// ==============================================================================
// Recognizing.tsx - 识别中页面
// ==============================================================================
//
// 本组件实现 OCR 识别过程中的进度页面，主要功能包括：
// - 显示识别进度
// - 显示当前处理步骤
// - 显示估计剩余时间
// - 显示识别结果
//
// ==============================================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ocrService } from '@/services/ocr';
import { tableParser, markdownTableParser } from '@/services/table';
import { taskExists, saveOCRResult } from '@/services/api';
import { OCRProgress } from '@/components/ocr/OCRProgress';
import { OCRResult } from '@/components/ocr/OCRResult';
import { useUploadStore } from '@/stores/useUploadStore';
import { createLogger } from '@/lib/logger';
import type { OCRTask } from '@/types/ocr';
import type { TableParseResult } from '@/types/table';

const log = createLogger('Recognizing');

export default function Recognizing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<OCRTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResults, setLocalParsedResults] = useState<TableParseResult[]>([]);
  const hasStartedRef = useRef(false);
  const { uploadedFiles, updateOcrTask, setParsedResults, setOcrTasks } = useUploadStore();

  useEffect(() => {
    // 如果已经开始了，就不再执行
    if (hasStartedRef.current) {
      log.debug('已经开始过，跳过');
      return;
    }

    // 从 Zustand store 获取已上传的文件
    const filesToProcess = uploadedFiles.map(f => f.file);

    log.debug('useEffect 执行，检查文件:', filesToProcess.length);

    if (filesToProcess.length === 0) {
      log.error('未找到待识别的文件');
      navigate('/');
      return;
    }

    // 标记已开始
    hasStartedRef.current = true;

    // 开始 OCR 识别
    startOCR(filesToProcess);
  }, [uploadedFiles, navigate, updateOcrTask, setParsedResults]);

  /**
   * 开始 OCR 识别
   */
  const startOCR = async (files: File[]) => {
    setIsProcessing(true);

    try {
      log.info(`开始 OCR 识别 ${files.length} 张图片`);

      const results = await ocrService.recognizeBatch(
        files,
        (updatedTask) => {
          // 更新任务进度 - 同时更新本地 state 和 store
          setTasks((prev) => {
            const existingIndex = prev.findIndex((t) => t.id === updatedTask.id);

            if (existingIndex >= 0) {
              // 更新现有任务
              const newTasks = [...prev];
              newTasks[existingIndex] = updatedTask;
              return newTasks;
            } else {
              // 添加新任务
              return [...prev, updatedTask];
            }
          });

          // 同时更新到 store
          updateOcrTask(updatedTask);
        }
      );

      log.info('所有图片识别完成');
      setTasks(results);

      // 保存最终的 OCR 任务到 store
      setOcrTasks(results);

      // === 保存到 Supabase ===
      log.info('开始保存到 Supabase...');

      const savePromises = results.map(async (task) => {
        if (task.status === 'completed' && task.result) {
          try {
            // 检查是否已保存（避免重复）
            const exists = await taskExists(task.id);
            if (exists) {
              log.debug(`任务已保存，跳过: ${task.id}`);
              return;
            }

            // 上传图片并保存 OCR 结果
            const saveResult = await saveOCRResult(
              task.file,
              task
            );

            if (saveResult) {
              log.info(`保存成功: ${task.file.name}`, saveResult);

              // 更新任务的 Supabase 元数据
              task.supabaseTaskId = saveResult.taskId;
              task.imagePath = saveResult.imagePath;
              task.imageUrl = saveResult.imageUrl;
              task.savedToSupabase = true;

              // 更新 UI 显示
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === task.id
                    ? { ...t, supabaseTaskId: saveResult.taskId, imageUrl: saveResult.imageUrl, savedToSupabase: true }
                    : t
                )
              );

              // 更新 store
              updateOcrTask(task);
            } else {
              log.warn(`保存失败: ${task.file.name}`);
              task.savedToSupabase = false;
            }
          } catch (error) {
            log.error(`保存异常: ${task.file.name}`, error);
            task.savedToSupabase = false;
            // 不抛出错误，允许 UI 继续显示 OCR 结果
          }
        }
      });

      // 等待所有保存完成（非阻塞）
      await Promise.allSettled(savePromises);
      log.info('Supabase 保存完成');

      // 进行表格解析
      log.debug('开始表格结构解析...');
      const parseResults: TableParseResult[] = [];

      for (const task of results) {
        if (!task.result) {
          log.warn(`跳过任务: ${task.file.name}, 没有识别结果`);
          continue;
        }

        log.debug(`解析图片: ${task.file.name}`);

        let parseResult: TableParseResult;

        // 优先使用 MarkdownTableParser 解析 HTML 表格内容
        if (task.result.text) {
          log.debug('尝试使用 MarkdownTableParser 解析 HTML 表格...');
          parseResult = markdownTableParser.parse(task.result.text);

          // 如果 HTML 解析失败且有位置信息的 items，则回退到 TableParser
          if (!parseResult.success && task.result.items.length > 0) {
            log.debug('HTML 解析失败，回退到 TableParser...');
            parseResult = tableParser.parse(task.result.items);
          }
        } else if (task.result.items.length > 0) {
          // 只有位置信息的 items，使用 TableParser
          log.debug('使用 TableParser 解析位置信息...');
          parseResult = tableParser.parse(task.result.items);
        } else {
          // 既没有 text 也没有 items
          log.warn(`跳过任务: ${task.file.name}, 没有可解析的内容`);
          continue;
        }

        parseResults.push(parseResult);

        if (parseResult.success) {
          log.info(`表格解析成功: ${task.file.name}, 置信度: ${(parseResult.confidence! * 100).toFixed(1)}%`);
        } else {
          log.warn(`表格解析失败: ${task.file.name}, 原因: ${parseResult.error}`);
        }
      }

      setLocalParsedResults(parseResults);

      // 保存到 store
      setParsedResults(parseResults);
      log.info('所有表格解析完成，已保存到 store');

    } catch (error) {
      log.error('OCR 识别失败', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {isProcessing ? t('recognizing.title') : t('recognizing.completed')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isProcessing
              ? t('recognizing.subtitle')
              : t('recognizing.completedSubtitle')}
          </p>
        </div>

        {/* OCR 进度 */}
        <OCRProgress tasks={tasks} />

        {/* OCR 结果 */}
        {!isProcessing && tasks.length > 0 && <OCRResult tasks={tasks} />}

        {/* 导航按钮 */}
        {!isProcessing && tasks.length > 0 && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              {t('common.back')}
            </button>

            <button
              onClick={() => {
                log.debug('点击编辑结果按钮');
                log.debug('parsedResults:', parsedResults);

                // 检查是否有解析结果
                if (!parsedResults || parsedResults.length === 0) {
                  log.error('没有解析结果，无法跳转到编辑页面');
                  alert('没有可编辑的结果，请确保识别成功');
                  return;
                }

                // 将解析结果保存到 store（已经在 OCR 完成时保存）
                log.info('已保存到 store，准备跳转');
                navigate('/editing');
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {t('editing.title')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
