// ==============================================================================
// ProcessingState.tsx - 处理状态组件
// ==============================================================================
//
// 本组件实现 OCR 处理状态:
// - 显示识别进度
// - 显示任务列表
// - 启动 OCR 流水线
// - 应用 Claude 极简设计系统
//
// 核心功能:
// - 调用 useOCRPipeline 启动 OCR
// - 实时更新任务进度
// - 处理完成后自动触发状态转换
// - 显示每个文件的处理状态
//
// ==============================================================================

import { motion } from 'framer-motion';
import { OCRProgress } from '@/components/ocr/OCRProgress';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { useOCRPipeline } from '@/hooks/useOCRPipeline';

/**
 * 处理状态组件
 *
 * 显示 OCR 识别进度:
 * - Title: "正在识别..."
 * - Progress Card: 总体进度
 * - Task List: 每个文件的处理状态
 *
 * @returns JSX 元素
 */
export function ProcessingState() {
  const { files, ocrTasks, updateOcrTask, setParsedResults } = useWorkflowState();

  // 启动 OCR 流水线
  useOCRPipeline(
    files?.map(f => f.file) || [],
    updateOcrTask,
    setParsedResults
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="max-w-5xl mx-auto"
    >
      {/* Title */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold
                      text-[#0E0E0E] dark:text-[#FDFDF7] mb-4">
          正在识别...
        </h1>
        <p className="text-base sm:text-lg text-[#6B6B6B] dark:text-[#9CA3AF]">
          请稍候,我们正在处理您的图片
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-white dark:bg-[#0E0E0E]
                    border-2 border-gray-200 dark:border-gray-800
                    rounded-xl p-6 sm:p-8 mb-6">
        <OCRProgress tasks={ocrTasks || []} />
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {ocrTasks?.map(task => (
          <div
            key={task.id}
            className="bg-white dark:bg-[#0E0E0E]
                     border-2 border-gray-200 dark:border-gray-800
                     rounded-xl p-4
                     flex items-center justify-between
                     transition-colors duration-200
                     hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              {/* 状态指示点 */}
              <div className={`w-2 h-2 rounded-full ${
                task.status === 'completed' ? 'bg-green-500' :
                task.status === 'failed' ? 'bg-red-500' :
                'bg-amber-500 animate-pulse'
              }`} />
              <span className="text-sm text-[#0E0E0E] dark:text-[#FDFDF7]">
                {task.file.name}
              </span>
            </div>
            <span className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF]">
              {task.status === 'completed' ? '✓ 完成' :
               task.status === 'failed' ? '✗ 失败' :
               `${task.progress}%`}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
