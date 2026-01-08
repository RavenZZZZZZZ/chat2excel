// ==============================================================================
// LanguageSwitcher.tsx - 语言切换组件
// ==============================================================================
//
// 本组件提供语言切换功能，允许用户在中文和英文之间切换
//
// 主要功能：
// - 显示当前语言
// - 切换语言（中文/英文）
// - 持久化语言偏好到 localStorage
//
// ==============================================================================

import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const isChinese = i18n.language === 'zh-CN';

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => changeLanguage('zh-CN')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          isChinese
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="切换到中文"
      >
        中文
      </button>
      <button
        onClick={() => changeLanguage('en-US')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          !isChinese
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
