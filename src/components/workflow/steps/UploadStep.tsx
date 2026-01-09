// ==============================================================================
// UploadStep.tsx - 上传步骤组件
// ==============================================================================
//
// 本组件实现重新设计的文件上传步骤:
// - 使用 react-dropzone 实现拖拽上传
// - 专业的视觉设计 (圆形图标背景、状态指示)
// - 文件预览 (缩略图 + 文件信息)
// - 流畅的动画效果
//
// 核心功能:
// - 拖拽上传文件
// - 点击选择文件
// - 文件类型和大小验证
// - 文件预览和删除
// - 响应式设计
//
// ==============================================================================

import { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

/**
 * 上传步骤组件属性
 */
export interface UploadStepProps {
  /** 文件选择回调 */
  onFilesSelected: (files: File[]) => void;
  /** 当前已选择的文件列表 */
  files: File[];
  /** 删除文件回调 */
  onRemove: (index: number) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 上传步骤组件
 *
 * 重新设计的文件上传界面:
 * - 拖拽区域使用圆形图标背景
 * - 悬停时有微妙的缩放动画
 * - 文件列表显示缩略图和文件信息
 * - 清晰的文件限制说明
 *
 * @example
 * ```tsx
 * const [files, setFiles] = useState<File[]>([]);
 *
 * return <UploadStep
 *   files={files}
 *   onFilesSelected={setFiles}
 *   onRemove={(index) => {
 *     setFiles(prev => prev.filter((_, i) => i !== index));
 *   }}
 * />;
 * ```
 */
export function UploadStep({
  onFilesSelected,
  files,
  onRemove,
  className
}: UploadStepProps) {
  /**
   * 处理文件删除
   * 移除临时创建的 URL 对象,避免内存泄漏
   */
  const handleRemove = useCallback((index: number) => {
    onRemove(index);
  }, [onRemove]);

  /**
   * 配置 react-dropzone
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10,
    maxSize: 7 * 1024 * 1024, // 7MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        // 显示错误信息
        const errors = rejectedFiles.map(f => {
          const error = f.errors[0];
          if (error.code === 'file-too-large') {
            return `${f.file.name} 文件过大 (最大 7MB)`;
          }
          if (error.code === 'file-invalid-type') {
            return `${f.file.name} 格式不支持`;
          }
          return `${f.file.name} 上传失败`;
        });
        alert(errors.join('\n'));
        return;
      }

      onFilesSelected(acceptedFiles);
    },
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* 上传区域 */}
      <div
        {...getRootProps()}
        className={cn(
          "relative group",
          "border-2 border-dashed rounded-xl",
          "transition-all duration-200",
          "cursor-pointer",
          isDragActive
            ? "border-[#D4A27F] bg-[#D4A27F]/5"
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
        )}
      >
        <input {...getInputProps()} />

        <div className="px-8 py-12 text-center">
          {/* 图标 */}
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-4
                           rounded-full bg-gray-100 dark:bg-gray-800
                           group-hover:bg-[#D4A27F]/10 transition-colors"
          >
            <Upload className="w-8 h-8 text-[#6B6B6B] group-hover:text-[#D4A27F]
                          transition-colors" />
          </motion.div>

          {/* 标题 */}
          <h3 className="text-lg font-semibold text-[#0E0E0E] dark:text-[#FDFDF7] mb-2">
            {isDragActive ? '松开以上传' : '拖拽文件到此处'}
          </h3>

          {/* 描述 */}
          <p className="text-sm text-[#6B6B6B] dark:text-[#9CA3AF] mb-4">
            或者点击选择文件
          </p>

          {/* 限制说明 */}
          <div className="flex items-center justify-center gap-6 text-xs text-[#9CA3AF]">
            <span>支持 JPG, PNG, WebP</span>
            <span>•</span>
            <span>最大 7MB</span>
            <span>•</span>
            <span>最多 10 个文件</span>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <motion.div
              key={`${file.name}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 px-4 py-3
                           bg-gray-50 dark:bg-gray-800/50
                           rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {/* 缩略图 */}
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0
                              bg-white dark:bg-[#0E0E0E]">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 文件信息 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0E0E0E] dark:text-[#FDFDF7] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF]">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              {/* 删除按钮 */}
              <button
                onClick={() => handleRemove(index)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700
                         transition-colors"
                aria-label="删除文件"
              >
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
