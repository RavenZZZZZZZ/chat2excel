// ==============================================================================
// UploadState.tsx - 上传状态组件
// ==============================================================================
//
// 本组件实现文件上传状态:
// - 显示 Hero Section (标题 + 描述)
// - 集成 ImageUpload 组件
// - 显示使用步骤说明
// - 应用 Claude 极简设计系统
//
// 核心功能:
// - 拖拽上传文件
// - 文件预览和删除
// - 上传完成后自动触发状态转换
// - 响应式设计 (移动端/桌面端)
//
// ==============================================================================

import { motion } from 'framer-motion';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { useWorkflowState } from '@/hooks/useWorkflowState';

/**
 * 上传状态组件
 *
 * 显示上传界面:
 * - Hero Section: 标题和描述
 * - Upload Card: 上传区域
 * - Usage Steps: 使用步骤说明 (仅在没有文件时显示)
 *
 * @returns JSX 元素
 */
export function UploadState() {
  const { files, setFiles } = useWorkflowState();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="max-w-5xl mx-auto"
    >
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold
                      text-[#0E0E0E] dark:text-[#FDFDF7] mb-4 tracking-tight">
          图片转表格,<span className="text-[#D4A27F]">一键完成</span>
        </h1>
        <p className="text-base sm:text-lg text-[#6B6B6B] dark:text-[#9CA3AF]
                      max-w-2xl mx-auto leading-relaxed">
          使用先进的 AI OCR 技术,快速识别图片中的表格数据并导出为 Excel 文件。
          支持多种图片格式,识别准确率高达 98%。
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white dark:bg-[#0E0E0E]
                    border-2 border-gray-200 dark:border-gray-800
                    rounded-xl p-6 sm:p-8
                    hover:bg-gray-50 dark:hover:bg-gray-800
                    transition-colors duration-200">
        <ImageUpload value={files} onChange={setFiles} multiple />
      </div>

      {/* Usage Steps (仅在没有文件时显示) */}
      {files.length === 0 && (
        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: '📤', title: '上传图片', desc: '拖拽或选择包含表格的图片' },
            { icon: '⚡', title: '自动识别', desc: 'AI 自动识别表格结构' },
            { icon: '📊', title: '导出 Excel', desc: '一键导出可编辑的 Excel 文件' },
          ].map((step, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#0E0E0E]
                       border-2 border-gray-200 dark:border-gray-800
                       rounded-xl p-4 sm:p-6
                       hover:bg-gray-50 dark:hover:bg-gray-800
                       transition-colors duration-200"
            >
              <div className="text-2xl sm:text-3xl mb-3">{step.icon}</div>
              <h3 className="text-base sm:text-lg font-semibold
                            text-[#0E0E0E] dark:text-[#FDFDF7] mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#9CA3AF]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
