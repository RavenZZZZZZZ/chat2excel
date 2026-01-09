// ==============================================================================
// ThemeToggle.tsx - 主题切换按钮组件
// ==============================================================================
//
// 本组件实现主题切换功能：
// - 显示当前主题状态（太阳/月亮图标）
// - 点击切换亮色/暗色模式
// - 平滑过渡动画
// - 支持国际化
//
// ==============================================================================

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from './useTheme';

/**
 * 主题切换按钮组件
 *
 * 功能说明：
 * - 使用自定义 useTheme Hook 获取和设置主题
 * - 亮色模式显示太阳图标，暗色模式显示月亮图标
 * - 点击切换主题（Light <-> Dark）
 * - 添加了加载状态避免 SSR 水合不匹配
 */
export function ThemeToggle() {
  const { theme, setTheme, isDark, mounted } = useTheme();
  const { t } = useTranslation();

  // 如果未挂载，显示占位符（保持布局稳定）
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={t('theme.toggle')}
        type="button"
      >
        <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
      aria-label={t('theme.toggle')}
      title={isDark ? t('theme.light') : t('theme.dark')}
      type="button"
    >
      {/* 太阳图标（亮色模式显示） */}
      <Sun
        className={`w-5 h-5 text-gray-700 dark:text-gray-300 transition-all duration-300 ${
          isDark
            ? 'opacity-0 rotate-90 scale-0 absolute'
            : 'opacity-100 rotate-0 scale-100'
        }`}
      />

      {/* 月亮图标（暗色模式显示） */}
      <Moon
        className={`w-5 h-5 text-gray-700 dark:text-gray-300 transition-all duration-300 ${
          isDark
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-90 scale-0 absolute'
        }`}
      />
    </button>
  );
}
