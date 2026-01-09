// ==============================================================================
// ResultsState.tsx - 结果状态组件
// ==============================================================================
//
// 本组件实现结果展示状态:
// - 显示解析后的表格数据
// - 支持表格编辑
// - 原图对比 (可选显示)
// - 导出 Excel 功能
// - 应用 Claude 极简设计系统
//
// 核心功能:
// - 表格数据预览和编辑
// - 多表格切换
// - 原图对比显示/隐藏
// - 导出 Excel 文件
// - 响应式布局 (桌面端双列,移动端单列)
//
// ==============================================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TablePreview } from '@/components/table';
import { excelExporter } from '@/services/export';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { cn } from '@/lib/utils';
import type { TableData } from '@/types/recognition';

/**
 * 结果状态组件
 *
 * 显示识别结果:
 * - Header: 标题和当前表格信息
 * - Toolbar: 表格切换和操作按钮
 * - Main Grid: 原图对比 (可选) + 表格编辑
 *
 * @returns JSX 元素
 */
export function ResultsState() {
  const { parsedResults, ocrTasks, updateOcrTask } = useWorkflowState();

  const [currentTableIndex, setCurrentTableIndex] = useState(0);
  const [showOriginalImage, setShowOriginalImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentResult = parsedResults[currentTableIndex];
  const currentTask = ocrTasks[currentTableIndex];

  /**
   * 处理表格数据变更
   */
  const handleTableDataChange = (newData: TableData) => {
    // TODO: 实现数据变更逻辑
    console.log('Table data changed:', newData);
  };

  /**
   * 导出当前表格为 Excel
   */
  const handleExport = async () => {
    if (!currentResult?.data) return;

    setIsExporting(true);
    try {
      const fileName = `table-export-${currentTableIndex + 1}-${Date.now()}`;

      await excelExporter.export(currentResult.data, {
        fileName,
        sheetName: 'Sheet1',
      });

      // TODO: 使用 Toast 通知替代 alert
      alert('✅ 导出成功!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败,请重试');
    } finally {
      setIsExporting(false);
    }
  };

  if (!currentResult?.data) {
    return (
      <div className="text-center text-[#6B6B6B] dark:text-[#9CA3AF]">
        No data available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold
                      text-[#0E0E0E] dark:text-[#FDFDF7] mb-2">
          识别结果
        </h1>
        <p className="text-sm sm:text-base text-[#6B6B6B] dark:text-[#9CA3AF]">
          当前表格: {currentTableIndex + 1} / {parsedResults.length}
          {currentTask && currentResult.confidence && (
            <span className="ml-2 sm:ml-4 text-xs">
              | 置信度: {(currentResult.confidence * 100).toFixed(1)}%
            </span>
          )}
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#0E0E0E]
                    border-2 border-gray-200 dark:border-gray-800
                    rounded-xl p-4 mb-6
                    flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        {/* Table Navigation */}
        {parsedResults.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTableIndex(Math.max(0, currentTableIndex - 1))}
              disabled={currentTableIndex === 0}
              className="px-3 sm:px-4 py-2 text-sm
                       bg-gray-200 dark:bg-gray-800
                       hover:bg-gray-300 dark:hover:bg-gray-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       rounded-lg font-medium
                       transition-colors duration-200"
            >
              上一张
            </button>
            <span className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#9CA3AF]">
              {currentTableIndex + 1} / {parsedResults.length}
            </span>
            <button
              onClick={() => setCurrentTableIndex(
                Math.min(parsedResults.length - 1, currentTableIndex + 1)
              )}
              disabled={currentTableIndex === parsedResults.length - 1}
              className="px-3 sm:px-4 py-2 text-sm
                       bg-gray-200 dark:bg-gray-800
                       hover:bg-gray-300 dark:hover:bg-gray-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       rounded-lg font-medium
                       transition-colors duration-200"
            >
              下一张
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOriginalImage(!showOriginalImage)}
            className="px-3 sm:px-4 py-2 text-sm
                     border-2 border-current
                     hover:bg-gray-50 dark:hover:bg-gray-800
                     rounded-lg font-medium
                     transition-colors duration-200"
          >
            {showOriginalImage ? '隐藏原图' : '显示原图'}
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 sm:px-6 py-2 text-sm
                     bg-[#0E0E0E] dark:bg-[#D4A27F]
                     text-white dark:text-[#09090B]
                     hover:opacity-90 active:scale-[0.985]
                     rounded-lg font-semibold
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? '导出中...' : '导出 Excel'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Image (可选显示) */}
        {showOriginalImage && currentTask && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="bg-white dark:bg-[#0E0E0E]
                     border-2 border-gray-200 dark:border-gray-800
                     rounded-xl p-6"
          >
            <h2 className="text-lg font-bold text-[#0E0E0E] dark:text-[#FDFDF7] mb-4">
              原始图片
            </h2>
            <img
              src={currentTask.preview}
              alt={currentTask.file.name}
              className="w-full h-auto rounded-lg border
                         border-gray-200 dark:border-gray-700"
            />
            <div className="mt-4 text-xs sm:text-sm text-[#6B6B6B] dark:text-[#9CA3AF]">
              <p><strong>文件名:</strong> {currentTask.file.name}</p>
              <p><strong>大小:</strong> {(currentTask.file.size / 1024).toFixed(2)} KB</p>
              <p><strong>类型:</strong> {currentTask.file.type}</p>
            </div>
          </motion.div>
        )}

        {/* Table Editor */}
        <div className={cn(
          "bg-white dark:bg-[#0E0E0E] border-2 border-gray-200 dark:border-gray-800 rounded-xl p-6",
          !showOriginalImage && "lg:col-span-2"
        )}>
          <h2 className="text-lg font-bold text-[#0E0E0E] dark:text-[#FDFDF7] mb-4">
            表格数据
          </h2>
          <TablePreview
            tableData={currentResult.data}
            onDataChange={handleTableDataChange}
            readonly={false}
          />
        </div>
      </div>
    </motion.div>
  );
}
