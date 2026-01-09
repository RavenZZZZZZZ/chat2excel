// ==============================================================================
// OCRWorkflow.tsx - OCR 工具工作流 (可折叠界面 v2)
// ==============================================================================
//
// 本组件实现全新的可折叠工作流界面:
// - 所有步骤同时可见 (Accordion 模式)
// - 完成的步骤自动折叠,下一步自动展开
// - 用户可以随时回到之前的步骤修改
// - 使用新的重新设计的步骤组件
//
// 核心功能:
// - 集成 CollapsibleWorkflow 容器
// - 集成 UploadStep, ProcessingStep, ResultsStep
// - 管理步骤展开/折叠状态
// - 协调 OCR 流水线和状态转换
//
// ==============================================================================

import { useState, useMemo, useEffect, useRef } from 'react';
import { Upload, FileText, Check } from 'lucide-react';
import { CollapsibleWorkflow, WorkflowStepStatus, WorkflowStep } from '../CollapsibleWorkflow';
import { UploadStep } from '../steps/UploadStep';
import { ProcessingStep, ProcessingTask } from '../steps/ProcessingStep';
import { ResultsStep, TableResult } from '../steps/ResultsStep';
import { useOCRPipeline } from '@/hooks/useOCRPipeline';
import { createLogger } from '@/lib/logger';

const log = createLogger('OCRWorkflow');

/**
 * OCR 工具工作流组件
 *
 * 实现可折叠的 3 步骤工作流:
 * 1. 上传图片文件
 * 2. OCR 识别处理
 * 3. 查看和导出结果
 *
 * 关键特性:
 * - 所有步骤同时可见 (Accordion 模式)
 * - 自动折叠完成的步骤
 * - 用户可以随时回到之前的步骤
 * - 实时进度更新
 */
export function OCRWorkflow() {
  // ============= 状态管理 =============

  /** 已上传的文件列表 */
  const [files, setFiles] = useState<File[]>([]);

  /** OCR 任务列表 (用于 ProcessingStep) */
  const [ocrTasks, setOcrTasks] = useState<ProcessingTask[]>([]);

  /** 识别结果列表 (用于 ResultsStep) */
  const [results, setResults] = useState<TableResult[]>([]);

  /** 原图 URL 列表 (用于结果对比) */
  const [originalImages, setOriginalImages] = useState<string[]>([]);

  /** 步骤展开状态 */
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['upload']));

  /** 用于控制 OCR 自动启动的 flag */
  const shouldStartOCR = useRef(false);

  /** OCR 是否正在处理 */
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);

  // ============= OCR 流水线 =============

  /**
   * 将文件转换为 ProcessingTask 格式
   */
  const initializeTasks = (fileList: File[]): ProcessingTask[] => {
    return fileList.map((file, index) => ({
      id: `task-${index}-${Date.now()}`,
      name: file.name,
      progress: 0,
      status: 'pending' as const,
    }));
  };

  /**
   * 更新 OCR 任务状态
   * 将 OCRTask 转换为 ProcessingTask 格式
   */
  const updateOcrTask = (ocrTask: any) => {
    log.info('updateOcrTask 被调用:', ocrTask);

    setOcrTasks(prev => {
      // 找到对应的任务 (通过文件名匹配)
      const taskIndex = prev.findIndex(t => t.name === ocrTask.file.name);

      if (taskIndex === -1) {
        // 如果找不到匹配的任务,可能是新上传的文件
        log.warn('找不到匹配的任务:', ocrTask.file.name);
        return prev;
      }

      // 映射状态
      let status: ProcessingTask['status'] = 'pending';
      switch (ocrTask.status) {
        case 'recognizing':
          status = 'processing';
          break;
        case 'completed':
          status = 'completed';
          break;
        case 'failed':
          status = 'failed';
          break;
        default:
          status = 'pending';
      }

      log.info(`更新任务 [${taskIndex}]: ${ocrTask.file.name}, 进度: ${ocrTask.progress}%, 状态: ${status}`);

      // 更新任务
      const updatedTasks = [...prev];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        progress: ocrTask.progress,
        status,
      };

      return updatedTasks;
    });
  };

  /**
   * 启动 OCR 流水线 (使用 useOCRPipeline hook)
   * 当 shouldStartOCR 为 true 时自动启动
   */
  useOCRPipeline(
    shouldStartOCR.current ? files : [],
    updateOcrTask,
    (newResults) => {
      // 转换为 TableResult 格式
      const tableResults: TableResult[] = newResults.map((result, index) => {
        // 将 TableData 转换为二维数组格式
        let tableData: any[][] = [];

        if (result.data && result.data.rows) {
          // 从 TableData 格式转换为二维数组
          tableData = result.data.rows.map(row =>
            row.cells.map(cell => cell.value)
          );
          log.info(`转换表格数据: ${tableData.length} 行, ${tableData[0]?.length || 0} 列`);
        }

        return {
          id: `result-${index}-${Date.now()}`,
          data: tableData,
          confidence: result.confidence,
        };
      });
      setResults(tableResults);

      // 生成原图 URL
      const images = files.map(file => URL.createObjectURL(file));
      setOriginalImages(images);

      // 标记处理完成
      setIsOCRProcessing(false);
      shouldStartOCR.current = false;

      log.info(`OCR 完成,识别到 ${tableResults.length} 个结果`);
    }
  );

  /**
   * 手动启动 OCR
   */
  const startOCRPipeline = () => {
    if (files.length === 0) {
      log.warn('没有文件可处理');
      return;
    }

    log.info('=== 手动启动 OCR 处理 ===');
    log.info('文件数量:', files.length);
    log.info('文件列表:', files.map(f => f.name));

    shouldStartOCR.current = true;
    setIsOCRProcessing(true);

    // 初始化任务状态
    const tasks = initializeTasks(files);
    log.info('初始化任务:', tasks);
    setOcrTasks(tasks);

    log.info('设置 shouldStartOCR.current = true, 等待 useOCRPipeline 启动...');

    // 强制重新渲染以触发 useOCRPipeline
    setExpandedSteps(prev => new Set([...prev, 'processing']));
  };

  // ============= 步骤状态管理 =============

  /**
   * 计算每个步骤的状态
   */
  const stepStatus = useMemo(() => {
    const uploadStatus: WorkflowStepStatus =
      files.length > 0 ? 'completed' : 'in-progress';

    const processingStatus: WorkflowStepStatus =
      results.length > 0 ? 'completed' :
      isOCRProcessing ? 'in-progress' :
      files.length > 0 ? 'pending' : 'pending';

    const resultsStatus: WorkflowStepStatus =
      results.length > 0 ? 'completed' : 'pending';

    return {
      upload: uploadStatus,
      processing: processingStatus,
      results: resultsStatus,
    };
  }, [files.length, results.length, isOCRProcessing]);

  /**
   * 自动折叠/展开逻辑
   * - 当步骤完成时,自动折叠
   * - 当下一步可用时,自动展开下一步
   */
  useEffect(() => {
    const newExpanded = new Set<string>();

    // 根据当前状态决定展开哪个步骤
    if (stepStatus.results === 'completed' || stepStatus.results === 'in-progress') {
      // 如果有结果,展开结果步骤
      newExpanded.add('results');
    } else if (stepStatus.processing === 'in-progress') {
      // 如果正在处理,展开处理步骤
      newExpanded.add('processing');
    } else if (stepStatus.upload === 'completed' && files.length > 0 && results.length === 0) {
      // 如果上传完成且有文件但没有结果,展开处理步骤(显示"开始识别"按钮)
      newExpanded.add('processing');
    } else if (stepStatus.upload === 'in-progress') {
      // 如果正在上传,展开上传步骤
      newExpanded.add('upload');
    } else {
      // 默认展开上传步骤
      newExpanded.add('upload');
    }

    setExpandedSteps(newExpanded);
  }, [stepStatus, files.length, results.length]);

  // ============= 步骤配置 =============

  /**
   * 工作流步骤配置
   */
  const workflowSteps = useMemo<WorkflowStep[]>(() => [
    {
      id: 'upload',
      title: '上传文件',
      description: files.length > 0 ? `已选择 ${files.length} 个文件` : '选择要处理的图片',
      icon: Upload,
      status: stepStatus.upload,
      canExpand: true,
      isExpanded: expandedSteps.has('upload'),
      children: (
        <UploadStep
          files={files}
          onFilesSelected={(newFiles) => {
            log.info('文件已选择:', newFiles.map(f => f.name));
            setFiles(newFiles);
            // 初始化 OCR 任务
            setOcrTasks(initializeTasks(newFiles));
            // 重置状态
            setResults([]);
            setOriginalImages([]);
            setIsOCRProcessing(false);
            shouldStartOCR.current = false;

            // 自动开始 OCR
            if (newFiles.length > 0) {
              log.info('自动开始 OCR 处理...');
              // 使用 setTimeout 确保 state 更新完成
              setTimeout(() => {
                shouldStartOCR.current = true;
                setIsOCRProcessing(true);
              }, 100);
            }
          }}
          onRemove={(index) => {
            const newFiles = files.filter((_, i) => i !== index);
            setFiles(newFiles);
            setOcrTasks(initializeTasks(newFiles));
            // 如果没有文件了,重置状态
            if (newFiles.length === 0) {
              setResults([]);
              setOriginalImages([]);
              setIsOCRProcessing(false);
              shouldStartOCR.current = false;
            }
          }}
        />
      ),
    },
    {
      id: 'processing',
      title: 'OCR 识别',
      description: isOCRProcessing
        ? '正在识别图片中的表格...'
        : results.length > 0
        ? `已完成 ${results.length} 个表格识别`
        : files.length > 0
        ? '等待开始识别'
        : '请先上传文件',
      icon: FileText,
      status: stepStatus.processing,
      canExpand: files.length > 0,
      isExpanded: expandedSteps.has('processing'),
      children: (
        <ProcessingStep
          tasks={ocrTasks}
          onComplete={() => {
            log.info('所有 OCR 任务完成');
          }}
          onError={() => {
            log.error('OCR 处理出错');
          }}
        />
      ),
    },
    {
      id: 'results',
      title: '识别结果',
      description: results.length > 0
        ? `查看和导出 ${results.length} 个识别结果`
        : '等待识别完成',
      icon: Check,
      status: stepStatus.results,
      canExpand: results.length > 0,
      isExpanded: expandedSteps.has('results'),
      children: (
        <ResultsStep
          results={results}
          originalImages={originalImages}
          onExport={async (index) => {
            const result = results[index];
            log.info('导出结果:', result.id);

            // TODO: 实现导出逻辑
            // 这里需要调用实际的导出功能
            await new Promise(resolve => setTimeout(resolve, 1000));
          }}
          onDataChange={(index, newData) => {
            setResults(prev => {
              const newResults = [...prev];
              newResults[index] = { ...newResults[index], data: newData };
              return newResults;
            });
          }}
        />
      ),
    },
  ], [files, ocrTasks, results, originalImages, stepStatus, expandedSteps, isOCRProcessing]);

  // ============= 渲染 =============

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#D4A27F] rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0E0E0E] dark:text-[#FDFDF7]">
              表格 OCR 识别
            </h1>
            <p className="text-sm text-[#6B6B6B] dark:text-[#9CA3AF]">
              使用 AI 技术快速识别图片中的表格数据
            </p>
          </div>
        </div>
      </div>

      {/* Workflow */}
      <CollapsibleWorkflow
        steps={workflowSteps}
        onStepToggle={(stepId, isExpanded) => {
          setExpandedSteps(prev => {
            const newSet = new Set(prev);
            if (isExpanded) {
              newSet.add(stepId);
            } else {
              newSet.delete(stepId);
            }
            return newSet;
          });
        }}
      />

      {/* Start OCR Button (当有文件但未开始处理时显示) */}
      {files.length > 0 && !isOCRProcessing && results.length === 0 && (
        <div className="mt-6">
          <button
            onClick={startOCRPipeline}
            className="w-full sm:w-auto px-8 py-3
                     bg-[#0E0E0E] dark:bg-[#D4A27F]
                     text-white dark:text-[#09090B]
                     font-semibold rounded-lg
                     hover:opacity-90 active:scale-[0.98]
                     transition-all
                     flex items-center justify-center gap-2
                     shadow-lg"
          >
            <Check className="w-5 h-5" />
            开始识别
          </button>
        </div>
      )}
    </div>
  );
}
