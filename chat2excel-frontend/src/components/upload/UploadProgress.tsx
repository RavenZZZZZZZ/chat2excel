// ==============================================================================
// UploadProgress.tsx - 上传进度组件
// ==============================================================================
//
// 本组件显示文件上传的进度信息
// - 总体进度条
// - 单个文件进度
// - 状态图标和提示
// - 统计信息
//
// ==============================================================================

import type { UploadTask } from '@/types/upload';

interface UploadProgressProps {
  tasks: UploadTask[];
  onCancel?: (taskId: string) => void;
}

/**
 * 上传进度组件
 */
export function UploadProgress({ tasks, onCancel }: UploadProgressProps) {
  // 计算总体进度
  const totalProgress = tasks.length > 0
    ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length
    : 0;

  // 统计状态
  const stats = {
    total: tasks.length,
    uploading: tasks.filter(t => t.status === 'uploading').length,
    success: tasks.filter(t => t.status === 'success').length,
    error: tasks.filter(t => t.status === 'error').length,
  };

  // 如果没有任务，不显示
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-6">
      {/* 总体进度卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            上传进度
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(totalProgress)}%
          </span>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        {/* 统计信息 */}
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>总计: {stats.total}</span>
          {stats.uploading > 0 && (
            <span className="text-blue-600">上传中: {stats.uploading}</span>
          )}
          {stats.success > 0 && (
            <span className="text-green-600">成功: {stats.success}</span>
          )}
          {stats.error > 0 && (
            <span className="text-red-600">失败: {stats.error}</span>
          )}
        </div>
      </div>

      {/* 单个文件进度列表 */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <UploadTaskItem
            key={task.id}
            task={task}
            onCancel={onCancel}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 单个任务进度项
 */
function UploadTaskItem({
  task,
  onCancel
}: {
  task: UploadTask
  onCancel?: (taskId: string) => void
}) {
  /**
   * 获取状态图标
   */
  const getStatusIcon = () => {
    switch (task.status) {
      case 'uploading':
        return (
          <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md flex items-center gap-3">
      {/* 状态图标 */}
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>

      {/* 文件信息 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {task.file.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {task.status === 'uploading' && `上传中... ${task.progress}%`}
          {task.status === 'success' && '上传成功'}
          {task.status === 'error' && (task.error || '上传失败')}
        </p>

        {/* 进度条 */}
        {task.status === 'uploading' && (
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-200"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* 文件大小 */}
      <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
        {(task.file.size / 1024 / 1024).toFixed(2)} MB
      </div>

      {/* 取消按钮 */}
      {task.status === 'uploading' && onCancel && (
        <button
          onClick={() => onCancel(task.id)}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="取消上传"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
