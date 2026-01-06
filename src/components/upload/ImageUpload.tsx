// ==============================================================================
// ImageUpload.tsx - 图片上传组件
// ==============================================================================
//
// 本组件实现图片拖拽上传功能，包括：
// - 拖拽上传区域
// - 点击选择文件
// - 文件类型和大小验证
// - 本地文件预览（不上传到服务器）
// - 错误提示
//
// ==============================================================================

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

/**
 * 图片文件信息接口（兼容旧版本）
 */
export interface ImageFile {
  file: File;
  preview: string;
  id: string;
  uploadedPath?: string;
  uploadedUrl?: string;
  recordId?: string;
}

/**
 * 组件 Props 接口
 */
interface ImageUploadProps {
  /**
   * 文件上传成功回调
   * @param files 上传的文件列表
   */
  onFilesSelected?: (files: ImageFile[]) => void;

  /**
   * 最大文件大小（默认 10MB）
   */
  maxSize?: number;

  /**
   * 是否允许多文件上传（默认 false）
   */
  multiple?: boolean;

  /**
   * 已上传的文件列表（用于受控模式）
   */
  value?: ImageFile[];

  /**
   * 文件变化回调
   */
  onChange?: (files: ImageFile[]) => void;
}

/**
 * 默认最大文件大小：10MB
 */
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

/**
 * 允许的图片格式
 */
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

/**
 * 图片上传组件
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export function ImageUpload({
  maxSize = DEFAULT_MAX_SIZE,
  multiple = true,
  value,
  onChange,
}: ImageUploadProps) {
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  /**
   * 组件卸载时清理 blob URLs
   */
  useEffect(() => {
    return () => {
      // 清理所有预览 URL
      value?.forEach((file) => {
        if (file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  /**
   * 处理文件选择（本地处理，不上传到服务器）
   */
  const handleUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError('');

    try {
      // 直接使用本地文件，不上传到服务器
      const imageFiles: ImageFile[] = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      }));

      // 通知父组件
      if (imageFiles.length > 0) {
        const updatedFiles = multiple ? [...(value || []), ...imageFiles] : imageFiles;
        onChange?.(updatedFiles);
      }

    } catch (err) {
      console.error('文件处理失败:', err);
      setError('文件处理失败，请重试');
    } finally {
      setIsUploading(false);
    }
  }, [maxSize, multiple, value, onChange]);

  /**
   * 处理文件选择（通过 dropzone）
   */
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');

    // 处理被拒绝的文件
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError(`文件大小超过限制（最大 ${Math.round(maxSize / 1024 / 1024)}MB）`);
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError('不支持的文件格式，请上传 JPG、PNG、WEBP 或 GIF 图片');
      } else {
        setError('文件上传失败，请重试');
      }
      return;
    }

    // 上传文件
    handleUpload(acceptedFiles);
  }, [maxSize, handleUpload]);

  /**
   * 配置 dropzone
   */
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize,
    multiple,
    disabled: isUploading,
  });

  /**
   * 删除文件
   */
  const handleRemove = (id: string) => {
    const fileToRemove = (value || []).find((f) => f.id === id);

    // 释放 blob URL
    if (fileToRemove?.preview.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const updatedFiles = (value || []).filter((f) => f.id !== id);
    onChange?.(updatedFiles);
  };

  return (
    <div className="w-full">
      {/* 拖拽上传区域 */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
          ${isDragReject ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {/* 上传图标 */}
        <div className="mx-auto mb-4">
          {isUploading ? (
            // 上传中图标
            <svg
              className="animate-spin w-16 h-16 mx-auto text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isDragActive ? (
            // 拖拽中图标
            <svg
              className="w-16 h-16 mx-auto text-blue-500 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          ) : (
            // 默认上传图标
            <svg
              className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>

        {/* 提示文字 */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {isUploading ? '正在上传...' : isDragActive ? '释放鼠标上传' : '拖拽图片到这里，或点击选择'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            支持 JPG、PNG、WEBP、GIF 格式，最大 {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* 已上传文件列表 */}
      {value && value.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            已上传 {value.length} 个文件
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {value.map((imageFile) => (
              <div
                key={imageFile.id}
                className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {/* 图片预览 */}
                <img
                  src={imageFile.preview}
                  alt={imageFile.file.name}
                  className="w-full h-48 object-cover"
                />

                {/* 删除按钮 */}
                <button
                  onClick={() => handleRemove(imageFile.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="删除图片"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* 文件信息 */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {imageFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {(imageFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {/* 上传状态标记 */}
                  {imageFile.uploadedUrl && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      已上传
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
