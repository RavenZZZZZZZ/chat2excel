// ==============================================================================
// OCRResult.tsx - OCR 识别结果展示组件
// ==============================================================================

import type { OCRTask } from '@/types/ocr';

interface OCRResultProps {
  tasks: OCRTask[];
}

/**
 * OCR 结果展示组件
 */
export function OCRResult({ tasks }: OCRResultProps) {
  // 只显示已完成的任务
  const completedTasks = tasks.filter((t) => t.status === 'completed' && t.result);

  if (completedTasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        识别结果 ({completedTasks.length})
      </h2>

      <div className="space-y-6">
        {completedTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            {/* 图片和基本信息 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                {/* 图片预览 */}
                <img
                  src={task.preview}
                  alt={task.file.name}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />

                {/* 文件信息 */}
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {task.file.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">识别耗时:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {task.result?.duration || 0} ms
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">字符数量:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {task.result?.text.length || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">识别项数:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {task.result?.items.length || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">文件大小:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {(task.file.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 识别文本 */}
            <div className="p-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                识别文本
              </h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                  {task.result?.text || '未识别到文本'}
                </pre>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (task.result?.text) {
                      navigator.clipboard.writeText(task.result.text);
                      // TODO: 显示复制成功提示
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  复制文本
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([task.result?.text || ''], {
                      type: 'text/plain',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${task.file.name}-ocr.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  下载为 TXT
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
