// ==============================================================================
// Help.tsx - 帮助中心页面
// ==============================================================================
//
// 本组件实现帮助文档页面，主要功能包括：
// - 显示使用教程
// - 常见问题解答（FAQ）
// - 功能说明
// - 联系方式
//
// 待实现功能：
// - 使用步骤说明
// - FAQ 手风琴组件
// - 视频教程嵌入
// - 反馈表单
// - 快捷键说明
//
// ==============================================================================

import { useTranslation } from 'react-i18next';

export default function Help() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('help.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('help.subtitle')}
          </p>
        </div>

        {/* 功能概述 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('help.sections.overview.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('help.sections.overview.content')}
          </p>
        </div>

        {/* 使用方法 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('help.sections.howToUse.title')}
          </h2>
          <ol className="space-y-4">
            {[1, 2, 3, 4].map((step) => (
              <li key={step} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  {step}
                </div>
                <p className="text-gray-700 dark:text-gray-300 pt-1">
                  {t(`help.sections.howToUse.steps.${step}` as const)}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* 支持的格式 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('help.sections.supportedFormats.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('help.sections.supportedFormats.formats')}
          </p>
        </div>

        {/* 使用技巧 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('help.sections.tips.title')}
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg
                className="w-6 h-6 text-green-500 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-700 dark:text-gray-300">
                {t('help.sections.tips.tips.clear')}
              </p>
            </li>
            <li className="flex items-start">
              <svg
                className="w-6 h-6 text-green-500 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-700 dark:text-gray-300">
                {t('help.sections.tips.tips.light')}
              </p>
            </li>
            <li className="flex items-start">
              <svg
                className="w-6 h-6 text-green-500 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-700 dark:text-gray-300">
                {t('help.sections.tips.tips.complete')}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
