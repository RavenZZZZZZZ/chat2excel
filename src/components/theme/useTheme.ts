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

/**
 * 安全地从 localStorage 读取主题
 */
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';

  try {
    const stored = localStorage.getItem('chat2excel-theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (error) {
    console.warn('无法读取 localStorage:', error);
  }

  return 'system';
}

/**
 * 安全地保存主题到 localStorage
 */
function saveTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('chat2excel-theme', theme);
  } catch (error) {
    console.warn('无法写入 localStorage:', error);
  }
}

/**
 * 获取实际的主题（解析 system）
 */
function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;

  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 应用主题到 DOM
 */
function applyTheme(theme: 'light' | 'dark') {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  console.log('[useTheme] 应用主题:', theme, '当前 dark class:', root.classList.contains('dark'));

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  console.log('[useTheme] 应用后 dark class:', root.classList.contains('dark'));
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [mounted, setMounted] = useState(false);

  // 初始化：标记组件已挂载
  useEffect(() => {
    setMounted(true);

    // 初始应用主题
    const resolvedTheme = getResolvedTheme(theme);
    applyTheme(resolvedTheme);
  }, []);

  // 当主题改变时，应用到 DOM
  useEffect(() => {
    if (!mounted) return;

    const resolvedTheme = getResolvedTheme(theme);
    applyTheme(resolvedTheme);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    console.log('[useTheme] 设置主题:', newTheme);
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return {
    theme,
    setTheme,
    resolvedTheme,
    isDark,
    mounted,
  };
}
