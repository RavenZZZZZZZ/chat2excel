// ==============================================================================
// ToolLayout.tsx - 工具布局容器
// ==============================================================================
//
// 本组件为工具提供统一的布局结构:
// - 侧边栏导航
// - 顶部面包屑导航
// - 工具内容区域
// - 响应式设计
//
// 核心功能:
// - 包含侧边栏导航
// - 显示当前工具路径
// - 提供统一的页面容器
// - 响应式布局适配
//
// ==============================================================================

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ToolConfig } from '@/lib/tool-registry';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

/**
 * 工具布局容器属性
 */
export interface ToolLayoutProps {
  /** 工具配置 */
  tool: ToolConfig;
  /** 工具内容 */
  children: ReactNode;
  /** 自定义类名 */
  className?: string;
}

/**
 * 工具布局容器组件
 *
 * 为每个工具提供统一的布局结构:
 * - 左侧: 侧边栏导航 (桌面端 64px/260px, 移动端抽屉)
 * - 右侧: 主内容区域
 *   - 顶部: 面包屑导航
 *   - 中间: 工具内容
 *
 * @example
 * ```tsx
 * <ToolLayout tool={toolConfig}>
 *   <OCRWorkflow />
 * </ToolLayout>
 * ```
 */
export function ToolLayout({ tool, children, className }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FDFDF7] dark:bg-[#09090B]">
      {/* 侧边栏导航 */}
      <Sidebar />

      {/* 主内容区域 */}
      <main className="md:ml-16 min-h-screen">
        {/* 顶部面包屑导航 */}
        <header className="sticky top-0 z-30 h-14
                        bg-white/80 dark:bg-[#0E0E0E]/80
                        backdrop-blur border-b border-gray-200 dark:border-gray-800
                        flex items-center justify-between px-4 sm:px-6">
          {/* 面包屑导航 */}
          <div className="flex items-center gap-2 text-sm overflow-hidden">
            <span className="text-[#6B6B6B] dark:text-[#9CA3AF] whitespace-nowrap">
              工具
            </span>
            <span className="text-gray-400 dark:text-gray-600 flex-shrink-0">
              /
            </span>
            <span className="text-[#6B6B6B] dark:text-[#9CA3AF] whitespace-nowrap">
              {tool.category.name}
            </span>
            <span className="text-gray-400 dark:text-gray-600 flex-shrink-0">
              /
            </span>
            <span className="font-medium text-[#0E0E0E] dark:text-[#FDFDF7] truncate">
              {tool.name}
            </span>
          </div>

          {/* 主题切换按钮 */}
          <ThemeToggle />
        </header>

        {/* 工具内容区域 */}
        <div className={cn("px-4 sm:px-6 md:px-8 py-8", className)}>
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * 简化版工具布局 (无侧边栏)
 *
 * 用于首页等不需要侧边栏的页面
 */
export interface SimpleLayoutProps {
  /** 页面内容 */
  children: ReactNode;
  /** 自定义类名 */
  className?: string;
}

/**
 * 简化版布局容器
 *
 * 不包含侧边栏,仅提供基础布局
 */
export function SimpleLayout({ children, className }: SimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FDFDF7] dark:bg-[#09090B]">
      <main className="min-h-screen">
        <div className={cn("px-4 sm:px-6 md:px-8 py-8", className)}>
          {children}
        </div>
      </main>
    </div>
  );
}
