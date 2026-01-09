// ==============================================================================
// ResultsStep.tsx - 结果步骤组件
// ==============================================================================
//
// 本组件实现重新设计的 OCR 结果展示步骤:
// - 结果导航 (上一张/下一张)
// - 操作按钮 (显示原图/导出 Excel)
// - 表格预览 (可编辑)
// - 原图对比 (可选显示)
//
// 核心功能:
// - 多结果切换
// - 原图显示/隐藏切换
// - Excel 导出功能
// - 表格数据预览
// - 响应式布局 (单列/双列)
//
// ==============================================================================

import { useState } from 'react';
import { Download, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * 表格结果数据
 */
export interface TableResult {
  /** 结果唯一标识 */
  id: string;
  /** 表格数据 (二维数组) */
  data: any[][];
  /** 置信度 (0-1) */
  confidence?: number;
}

/**
 * 结果步骤组件属性
 */
export interface ResultsStepProps {
  /** 识别结果列表 */
  results: TableResult[];
  /** 原图 URL 列表 (可选) */
  originalImages?: string[];
  /** 导出回调 */
  onExport: (index: number) => Promise<void>;
  /** 数据变更回调 */
  onDataChange?: (index: number, newData: any[][]) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 结果步骤组件
 *
 * 重新设计的 OCR 结果展示界面:
 * - 顶部结果导航 (上一张/下一张)
 * - 操作按钮 (显示原图/导出 Excel)
 * - 主内容区: 原图对比 (可选) + 表格预览
 * - 响应式布局: 移动端单列,桌面端双列
 *
 * @example
 * ```tsx
 * const [results] = useState([
 *   {
 *     id: '1',
 *     data: [
 *       ['列A', '列B', '列C'],
 *       ['数据1', '数据2', '数据3']
 *     ],
 *     confidence: 0.95
 *   }
 * ]);
 *
 * return <ResultsStep
 *   results={results}
 *   originalImages={['image1.jpg']}
 *   onExport={async (index) => {
 *     await excelExporter.export(results[index].data);
 *   }}
 * />;
 * ```
 */
export function ResultsStep({
  results,
  originalImages = [],
  onExport,
  onDataChange,
  className
}: ResultsStepProps) {
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const currentResult = results[currentResultIndex];
  const currentImage = originalImages[currentResultIndex];

  /**
   * 处理导出操作
   */
  const handleExport = async () => {
    if (!currentResult?.data || isExporting) return;

    setIsExporting(true);
    try {
      await onExport(currentResultIndex);
      alert('✅ 导出成功!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败,请重试');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * 处理表格数据变更
   */
  const handleDataChange = (newData: any[][]) => {
    onDataChange?.(currentResultIndex, newData);
  };

  // 验证数据格式
  let tableData: any[][];
  if (!currentResult?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B6B6B] dark:text-[#9CA3AF]">暂无数据</p>
      </div>
    );
  }

  if (!Array.isArray(currentResult.data)) {
    console.error('[ResultsStep] 数据格式错误,期望二维数组,实际:', currentResult.data);
    return (
      <div className="text-center py-12">
        <p className="text-red-500">数据格式错误</p>
      </div>
    );
  }

  tableData = currentResult.data;

  // 检查是否为空数据
  if (tableData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B6B6B] dark:text-[#9CA3AF]">表格数据为空</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 结果导航 (仅当有多个结果时显示) */}
      {results.length > 1 && (
        <div className="flex items-center justify-between px-4 py-3
                        bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <button
            onClick={() => setCurrentResultIndex(Math.max(0, currentResultIndex - 1))}
            disabled={currentResultIndex === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium",
              "bg-white dark:bg-[#0E0E0E]",
              "border-2 border-gray-200 dark:border-gray-700",
              "rounded-lg hover:border-gray-300 dark:hover:border-gray-600",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            上一张
          </button>

          <span className="text-sm text-[#6B6B6B] dark:text-[#9CA3AF]">
            {currentResultIndex + 1} / {results.length}
          </span>

          <button
            onClick={() => setCurrentResultIndex(
              Math.min(results.length - 1, currentResultIndex + 1)
            )}
            disabled={currentResultIndex === results.length - 1}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium",
              "bg-white dark:bg-[#0E0E0E]",
              "border-2 border-gray-200 dark:border-gray-700",
              "rounded-lg hover:border-gray-300 dark:hover:border-gray-600",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors"
            )}
          >
            下一张
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center gap-3">
        {/* 显示原图按钮 */}
        {currentImage && (
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium",
              "border-2 border-gray-200 dark:border-gray-700 rounded-lg",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              "transition-colors"
            )}
          >
            {showOriginal ? (
              <>
                <EyeOff className="w-4 h-4" />
                隐藏原图
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                显示原图
              </>
            )}
          </button>
        )}

        {/* 导出按钮 */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold",
            "bg-[#0E0E0E] dark:bg-[#D4A27F]",
            "text-white dark:text-[#09090B]",
            "rounded-lg",
            "hover:opacity-90 active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all"
          )}
        >
          {isExporting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
              导出中...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              导出 Excel
            </>
          )}
        </button>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 原图 (可选显示) */}
        <AnimatePresence>
          {showOriginal && currentImage && (
            <motion.div
              key="original"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-[#0E0E0E] dark:text-[#FDFDF7] mb-4">
                原始图片
              </h3>
              <div className="aspect-video bg-white dark:bg-[#0E0E0E] rounded-lg
                              border-2 border-gray-200 dark:border-gray-700
                              flex items-center justify-center overflow-hidden">
                <img
                  src={currentImage}
                  alt="原始图片"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 表格预览 */}
        <div className={cn(
          "bg-white dark:bg-[#0E0E0E]",
          "border-2 border-gray-200 dark:border-gray-800",
          "rounded-xl p-6",
          !showOriginal && "lg:col-span-2"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0E0E0E] dark:text-[#FDFDF7]">
              识别结果
            </h3>
            {currentResult.confidence && (
              <span className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF]">
                置信度: {(currentResult.confidence * 100).toFixed(1)}%
              </span>
            )}
          </div>

          {/* 表格预览 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {tableData[0]?.map((header, i) => (
                    <th key={i} className="px-4 py-2 text-left font-medium
                                         text-[#0E0E0E] dark:text-[#FDFDF7]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.slice(1).map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800
                                   hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2 text-[#6B6B6B] dark:text-[#9CA3AF]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
