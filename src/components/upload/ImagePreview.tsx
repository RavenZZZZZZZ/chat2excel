// ==============================================================================
// ImagePreview.tsx - 图片预览组件（带灯箱效果）
// ==============================================================================
//
// 本组件实现图片预览功能，包括：
// - 缩略图网格展示
// - 点击放大查看（灯箱效果）
// - 图片信息显示
// - 删除功能
//
// ==============================================================================

import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

/**
 * 图片文件信息接口
 */
export interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

/**
 * 组件 Props 接口
 */
interface ImagePreviewProps {
  /**
   * 图片文件列表
   */
  images: ImageFile[];

  /**
   * 删除图片回调
   * @param id 图片 ID
   */
  onRemove?: (id: string) => void;

  /**
   * 是否显示删除按钮（默认 true）
   */
  showRemove?: boolean;
}

/**
 * 图片预览组件
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export function ImagePreview({ images, onRemove, showRemove = true }: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * 处理图片点击（打开灯箱）
   */
  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  /**
   * 处理删除
   */
  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发灯箱
    onRemove?.(id);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
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
        <p className="text-gray-500 dark:text-gray-400">暂无图片</p>
      </div>
    );
  }

  return (
    <>
      {/* 图片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((imageFile, index) => (
          <div
            key={imageFile.id}
            className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => handleImageClick(index)}
          >
            {/* 图片缩略图 */}
            <div className="relative aspect-square">
              <img
                src={imageFile.preview}
                alt={imageFile.file.name}
                className="w-full h-full object-cover"
              />

              {/* 悬停遮罩 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>

            {/* 文件信息 */}
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {imageFile.file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(imageFile.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {/* 删除按钮 */}
            {showRemove && onRemove && (
              <button
                onClick={(e) => handleRemove(imageFile.id, e)}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
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
            )}
          </div>
        ))}
      </div>

      {/* 灯箱 */}
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        index={currentIndex}
        slides={images.map((img) => ({ src: img.preview }))}
        on={{
          view: ({ index }) => setCurrentIndex(index),
        }}
      />
    </>
  );
}
