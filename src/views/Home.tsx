// ==============================================================================
// Home.tsx - 首页（上传页面）
// ==============================================================================
//
// 本组件实现应用的首页，主要功能包括：
// - 显示应用介绍
// - 提供图片文件上传功能
// - 显示上传文件预览
// - 跳转到识别页面
//
// ==============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ImageUpload, ImagePreview, type UploadImageFile } from '@/components/upload';
import { useUploadStore } from '@/stores/useUploadStore';
import { createLogger } from '@/lib/logger';

const log = createLogger('Home');

/**
 * 首页组件
 */
export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<UploadImageFile[]>([]);
  const { setUploadedFiles: setUploadedFilesToStore } = useUploadStore();

  /**
   * 处理开始识别按钮点击
   */
  const handleStartRecognition = () => {
    log.debug('点击了开始识别按钮');
    log.debug('当前上传的文件数量:', uploadedFiles.length);

    if (uploadedFiles.length === 0) {
      log.warn('没有已上传的文件');
      return;
    }

    // 将文件保存到 Zustand store
    setUploadedFilesToStore(uploadedFiles);

    log.info('已保存文件到 store，数量:', uploadedFiles.length);
    log.info('准备跳转到 /recognizing');

    // 跳转到识别页面
    navigate('/recognizing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* 页面标题区域 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('home.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            {t('home.subtitle')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t('home.dropZone.subtitle')}
          </p>
        </div>

        {/* 上传组件 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <ImageUpload
            value={uploadedFiles}
            onChange={setUploadedFiles}
            multiple={true}
            maxSize={10 * 1024 * 1024}
          />
        </div>

        {/* 已上传图片预览 */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('home.uploadedCount', { count: uploadedFiles.length })}
            </h2>
            <ImagePreview
              images={uploadedFiles}
              onRemove={(id) => {
                setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
              }}
            />

            {/* 开始识别按钮 */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleStartRecognition}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                {t('home.startRecognition')}
              </button>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        {uploadedFiles.length === 0 && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              使用说明
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 步骤 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600 dark:text-blue-400"
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
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  1. 上传图片
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  拖拽或点击上传包含表格的图片
                </p>
              </div>

              {/* 步骤 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  2. 自动识别
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  使用 OCR 技术自动识别表格内容
                </p>
              </div>

              {/* 步骤 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  3. 导出 Excel
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  编辑并导出识别结果为 Excel 文件
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
