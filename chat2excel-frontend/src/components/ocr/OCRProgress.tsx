// ==============================================================================
// OCRProgress.tsx - OCR 识别进度显示组件
// ==============================================================================

import type { OCRTask } from '@/types/ocr';

interface OCRProgressProps {
  tasks: OCRTask[];
}

/**
 * OCR 进度显示组件
 */
export function OCRProgress({ tasks }: OCRProgressProps) {
  if (tasks.length === 0) {
    return null;
  }

  // 计算总体进度
  const totalProgress =
    tasks.length > 0
      ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length
      : 0;

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const failedCount = tasks.filter((t) => t.status === 'failed').length;
  const processingCount = tasks.filter(
    (t) => t.status === 'loading' || t.status === 'recognizing'
  ).length;

  return (
    <div className="space-y-4 mt-6">
      {/* 总体进度 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            OCR 识别进度
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(totalProgress)}%
          </span>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        {/* 统计信息 */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">总计:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">已完成:</span>
            <span className="font-semibold text-green-600">{completedCount}</span>
          </div>
          {processingCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">处理中:</span>
              <span className="font-semibold text-blue-600">{processingCount}</span>
            </div>
          )}
          {failedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">失败:</span>
              <span className="font-semibold text-red-600">{failedCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* 单个任务进度 */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <OCRTaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

interface OCRTaskItemProps {
  task: OCRTask;
}

/**
 * 单个 OCR 任务项
 */
function OCRTaskItem({ task }: OCRTaskItemProps) {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'loading':
        return (
          <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case 'recognizing':
        return (
          <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case 'loading':
        return '加载语言包...';
      case 'recognizing':
        return `识别中... ${task.progress}%`;
      case 'completed':
        return `完成 (${task.result?.duration || 0}ms)`;
      case 'failed':
        return task.error || '识别失败';
      default:
        return '等待中...';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        {/* 状态图标 */}
        <div className="flex-shrink-0">{getStatusIcon()}</div>

        {/* 图片预览 */}
        <div className="flex-shrink-0">
          <img
            src={task.preview}
            alt={task.file.name}
            className="w-12 h-12 object-cover rounded"
          />
        </div>

        {/* 文件信息和进度 */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {task.file.name}
            </p>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {getStatusText()}
            </span>
          </div>

          {/* 进度条 */}
          {task.status === 'loading' || task.status === 'recognizing' ? (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          ) : task.status === 'failed' ? (
            <p className="text-xs text-red-600">{task.error}</p>
          ) : task.status === 'completed' && task.result ? (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              识别到 {task.result.text.length} 个字符
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
