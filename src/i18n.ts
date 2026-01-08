// ==============================================================================
// i18n.ts - i18next 国际化配置
// ==============================================================================
//
// 本文件配置 i18next，为应用提供中英文双语支持
//
// 主要功能：
// - 初始化 i18next
// - 配置语言检测（localStorage + 浏览器语言）
// - 配置翻译文件路径
// - 配置命名空间（可选）
//
// ==============================================================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 绑定 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    resources: {
      'zh-CN': zhCN,
      'en-US': enUS,
    },
    fallbackLng: 'zh-CN', // 默认语言：简体中文
    lng: 'zh-CN', // 初始语言：简体中文

    debug: import.meta.env.DEV, // 开发环境启用调试

    interpolation: {
      escapeValue: false, // React 已自动转义，无需再次转义
    },

    detection: {
      // 语言检测顺序
      order: ['localStorage', 'navigator'],
      // 缓存用户语言偏好
      caches: ['localStorage'],
      // localStorage 键名
      lookupLocalStorage: 'chat2excel-language',
    },
  });

export default i18n;
