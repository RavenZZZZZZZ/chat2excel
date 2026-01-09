// ==============================================================================
// ProcessingStep.tsx - 处理步骤组件
// ==============================================================================
//
// 本组件实现重新设计的 OCR 处理状态显示:
// - 中心的圆形进度指示器 (百分比数字)
// - 外层旋转加载动画
// - 任务列表显示每个文件的处理状态
// - 进度条动画
//
// 核心功能:
// - 显示总体处理进度
// - 显示每个文件的处理状态
// - 进度条动画
// - 自动触发完成/错误回调
//
// ==============================================================================

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * 处理任务状态
 */
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * 处理任务
 */
export interface ProcessingTask {
  /** 任务唯一标识 */
  id: string;
  /** 任务名称 (通常是文件名) */
  name: string;
  /** 进度百分比 (0-100) */
  progress: number;
  /** 当前状态 */
  status: TaskStatus;
}

/**
 * 处理步骤组件属性
 */
export interface ProcessingStepProps {
  /** 处理任务列表 */
  tasks: ProcessingTask[];
  /** 全部完成回调 */
  onComplete?: () => void;
  /** 全部失败回调 */
  onError?: () => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 处理步骤组件
 *
 * 重新设计的 OCR 处理状态显示:
 * - 中心显示圆形进度指示器
 * - 外层旋转加载动画
 * - 任务列表显示每个文件的处理进度
 * - 流畅的进度条动画
 *
 * @example
 * ```tsx
 * const [tasks, setTasks] = useState([
 *   {
 *     id: '1',
 *     name: 'test.jpg',
 *     progress: 60,
 *     status: 'processing'
 *   }
 * ]);
 *
 * return <ProcessingStep
 *   tasks={tasks}
 *   onComplete={() => console.log('完成')}
 *   onError={() => console.log('失败')}
 * />;
 * ```
 */
export function ProcessingStep({
  tasks,
  onComplete,
  onError,
  className
}: ProcessingStepProps) {
  const [overallProgress, setOverallProgress] = useState(0);

  /**
   * 监听任务完成状态
   * 当所有任务都完成时触发 onComplete 回调
   */
  useEffect(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    setOverallProgress((completed / total) * 100);

    if (completed === total && total > 0) {
      onComplete?.();
    }
  }, [tasks, onComplete]);

  /**
   * 监听任务失败状态
   * 当所有任务都失败时触发 onError 回调
   */
  useEffect(() => {
    const failed = tasks.filter(t => t.status === 'failed').length;
    if (failed > 0 && failed === tasks.length) {
      onError?.();
    }
  }, [tasks, onError]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* 总体进度 */}
      <div className="text-center">
        {/* 圆形进度指示器 */}
        <div className="inline-flex items-center justify-center w-20 h-20 mb-4
                        rounded-full bg-gray-100 dark:bg-gray-800
                        relative">
          {/* 外层旋转动画 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <Loader2 className="w-full h-full text-[#D4A27F]" />
          </motion.div>

          {/* 中心百分比数字 */}
          <span className="text-2xl font-bold text-[#0E0E0E] dark:text-[#FDFDF7]">
            {Math.round(overallProgress)}%
          </span>
        </div>

        {/* 标题和描述 */}
        <h3 className="text-lg font-semibold text-[#0E0E0E] dark:text-[#FDFDF7] mb-2">
          正在处理...
        </h3>

        <p className="text-sm text-[#6B6B6B] dark:text-[#9CA3AF]">
          {tasks.filter(t => t.status === 'completed').length} / {tasks.length} 个任务已完成
        </p>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              {/* 状态图标 */}
              {task.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
              {task.status === 'failed' && (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              {task.status === 'processing' && (
                <Loader2 className="w-5 h-5 text-[#D4A27F] animate-spin flex-shrink-0" />
              )}
              {task.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
              )}

              {/* 任务名称 */}
              <span className="flex-1 text-sm font-medium text-[#0E0E0E] dark:text-[#FDFDF7] truncate">
                {task.name}
              </span>

              {/* 状态文本 */}
              <span className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF] flex-shrink-0">
                {task.status === 'completed' && '✓ 完成'}
                {task.status === 'failed' && '✗ 失败'}
                {task.status === 'processing' && `${task.progress}%`}
                {task.status === 'pending' && '等待中...'}
              </span>
            </div>

            {/* 进度条 */}
            {task.status === 'processing' && (
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-[#D4A27F]"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
