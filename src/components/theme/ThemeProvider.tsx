// ==============================================================================
// ThemeProvider.tsx - 主题提供者组件
// ==============================================================================
//
// 本组件使用 next-themes 库提供主题切换功能：
// - 支持亮色/暗色两种主题模式
// - 自动跟随系统主题偏好
// - 持久化主题选择到 localStorage
// - 避免主题切换时的闪烁问题
//
// ==============================================================================

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

/**
 * 主题提供者组件
 *
 * 配置说明：
 * - attribute="class": 使用 class 属性切换主题（配合 Tailwind 的 dark: 类名）
 * - defaultTheme="system": 默认跟随系统主题偏好
 * - enableSystem=true: 允许使用系统主题
 * - disableTransitionOnChange=false: 切换主题时不禁用过渡动画
 * - storageKey="chat2excel-theme": localStorage 存储键名
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
