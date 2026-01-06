// ==============================================================================
// Editing.tsx - 编辑页面
// ==============================================================================
//
// 本组件实现表格编辑页面，主要功能包括：
// - 显示识别出的表格数据
// - 提供表格编辑功能
// - 导出为 Excel
//
// ==============================================================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TablePreview } from '@/components/table';
import { excelExporter } from '@/services/export';
import { useUploadStore } from '@/stores/useUploadStore';
import { createLogger } from '@/lib/logger';
import type { TableData } from '@/types/recognition';
import type { TableParseResult } from '@/types/table';
import type { OCRTask } from '@/types/ocr';

const log = createLogger('Editing');

interface TaskWithParseResult {
  task: OCRTask;
  parseResult: TableParseResult;
}

export default function Editing() {
  const navigate = useNavigate();
  const [tableDataList, setTableDataList] = useState<TableData[]>([]);
  const [taskList, setTaskList] = useState<TaskWithParseResult[]>([]);
  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [showOriginalImage, setShowOriginalImage] = useState(true);
  const hasInitializedRef = useRef(false);
  const { parsedResults, ocrTasks } = useUploadStore();

  useEffect(() => {
    // 避免重复初始化
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    log.debug('解析结果:', parsedResults.length);
    log.debug('OCR 任务:', ocrTasks.length);

    if (!parsedResults || parsedResults.length === 0) {
      log.error('未找到解析结果');
      navigate('/');
      return;
    }

    if (!ocrTasks || ocrTasks.length === 0) {
      log.error('未找到 OCR 任务');
      navigate('/');
      return;
    }

    log.info('加载解析结果:', parsedResults.length);

    // 组合任务和解析结果
    const taskWithResults: TaskWithParseResult[] = [];
    const successfulTables: TableData[] = [];

    parsedResults.forEach((parseResult, index) => {
      if (parseResult.success && parseResult.data && ocrTasks[index]) {
        taskWithResults.push({
          task: ocrTasks[index],
          parseResult,
        });
        successfulTables.push(parseResult.data);
      }
    });

    setTaskList(taskWithResults);
    setTableDataList(successfulTables);
  }, [navigate, parsedResults, ocrTasks]);

  /**
   * 处理表格数据变更
   */
  const handleTableDataChange = (newData: TableData) => {
    const newList = [...tableDataList];
    newList[currentTableIndex] = newData;
    setTableDataList(newList);
  };

  /**
   * 导出当前表格为 Excel
   */
  const handleExportExcel = async () => {
    if (tableDataList.length === 0) return;

    setIsExporting(true);
    try {
      const currentTable = tableDataList[currentTableIndex];
      const fileName = `table-export-${currentTableIndex + 1}`;

      await excelExporter.export(currentTable, {
        fileName,
        sheetName: 'Sheet1',
      });

      console.log('✅ Excel 导出成功');
    } catch (error) {
      console.error('❌ Excel 导出失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * 导出所有表格为单个 Excel 文件
   */
  const handleExportAllExcel = async () => {
    if (tableDataList.length === 0) return;

    setIsExporting(true);
    try {
      // TODO: 实现将多个表格导出到一个 Excel 文件的多个 Sheet
      console.log('📦 批量导出功能待实现');
    } catch (error) {
      console.error('❌ 批量导出失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // 如果没有数据，显示加载状态
  if (tableDataList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载数据...</p>
        </div>
      </div>
    );
  }

  const currentTable = tableDataList[currentTableIndex];
  const currentTask = taskList[currentTableIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            编辑表格
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            表格 {currentTableIndex + 1} / {tableDataList.length}
            {currentTask && (
              <span className="ml-4 text-sm">
                文件名: {currentTask.task.file.name} |
                置信度: {currentTask.parseResult.confidence ? `${(currentTask.parseResult.confidence * 100).toFixed(1)}%` : 'N/A'}
              </span>
            )}
          </p>
        </div>

        {/* 工具栏 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* 表格切换 */}
          {tableDataList.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTableIndex(Math.max(0, currentTableIndex - 1))}
                disabled={currentTableIndex === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                上一个
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                {currentTableIndex + 1} / {tableDataList.length}
              </span>
              <button
                onClick={() => setCurrentTableIndex(Math.min(tableDataList.length - 1, currentTableIndex + 1))}
                disabled={currentTableIndex === tableDataList.length - 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                下一个
              </button>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              返回首页
            </button>

            <button
              onClick={() => setShowOriginalImage(!showOriginalImage)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              {showOriginalImage ? '隐藏原图' : '显示原图'}
            </button>

            {tableDataList.length > 1 && (
              <button
                onClick={handleExportAllExcel}
                disabled={isExporting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? '导出中...' : '导出全部'}
              </button>
            )}

            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? '导出中...' : '导出 Excel'}
            </button>
          </div>
        </div>

        {/* 主内容区：左侧原图，右侧表格 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 原图显示 */}
          {showOriginalImage && currentTask && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                原始图片
              </h2>
              <div className="relative">
                <img
                  src={currentTask.task.preview}
                  alt={currentTask.task.file.name}
                  className="w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>文件信息:</strong></p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>文件名: {currentTask.task.file.name}</li>
                    <li>文件大小: {(currentTask.task.file.size / 1024).toFixed(2)} KB</li>
                    <li>类型: {currentTask.task.file.type}</li>
                    <li>置信度: {currentTask.parseResult.confidence ? `${(currentTask.parseResult.confidence * 100).toFixed(1)}%` : 'N/A'}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 表格预览 */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${showOriginalImage ? '' : 'lg:col-span-2'}`}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              解析结果
            </h2>
            <TablePreview
              tableData={currentTable}
              onDataChange={handleTableDataChange}
              readonly={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
