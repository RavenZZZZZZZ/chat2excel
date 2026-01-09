// ==============================================================================
// useTheme.ts - 自定义主题 Hook
// ==============================================================================
//
// 本 Hook 提供主题切换功能，不依赖 next-themes：
// - 支持亮色/暗色两种模式
// - 默认跟随系统主题偏好
// - 持久化主题选择到 localStorage
// - 自动添加/移除 'dark' class 到 html 元素
//
// ==============================================================================

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // 初始化：从 localStorage 读取主题设置
  useEffect(() => {
    const storedTheme = localStorage.getItem('chat2excel-theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
    setMounted(true);
  }, []);

  // 应用主题到 DOM
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('chat2excel-theme', newTheme);
  };

  // 获取实际的主题（解析 system）
  const resolvedTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  return {
    theme,
    setTheme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    mounted,
  };
}
