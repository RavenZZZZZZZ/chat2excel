// ==============================================================================
// Sidebar.tsx - 侧边栏导航组件
// ==============================================================================
//
// 本组件实现侧边栏导航系统:
// - 可折叠/展开的侧边栏
// - 工具分类导航
// - 移动端抽屉式导航
// - 搜索工具功能
//
// 核心功能:
// - 显示工具分类列表
// - 支持折叠/展开切换
// - 响应式设计 (桌面端/移动端)
// - 当前路由高亮
//
// ==============================================================================

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toolRegistry } from '@/lib/tool-registry';

/**
 * 侧边栏导航组件
 *
 * 实现可折叠的侧边栏导航:
 * - 桌面端: 64px (折叠) / 260px (展开)
 * - 移动端: 抽屉式全屏导航
 * - 显示所有工具分类
 * - 当前路由自动高亮
 */
export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const categories = toolRegistry.getCategories();

  /**
   * 检查分类是否处于激活状态
   */
  const isCategoryActive = (categoryId: string): boolean => {
    const tools = toolRegistry.getByCategory(categoryId);
    return tools.some(tool => tool.path === location.pathname);
  };

  /**
   * 获取分类的第一个工具路径
   */
  const getCategoryPath = (categoryId: string): string => {
    const tools = toolRegistry.getByCategory(categoryId);
    return tools[0]?.path || '#';
  };

  return (
    <>
      {/* ============= 桌面端侧边栏 ============= */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed left-0 top-0 h-screen z-40",
          "bg-white dark:bg-[#0E0E0E]",
          "border-r border-gray-200 dark:border-gray-800",
          "transition-all duration-300",
          isExpanded ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 bg-[#D4A27F] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">YR</span>
          </div>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-3 font-semibold text-[#0E0E0E] dark:text-[#FDFDF7] whitespace-nowrap"
            >
              Chat2Excel
            </motion.span>
          )}
        </div>

        {/* 导航链接 */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {/* 首页链接 */}
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg",
              "transition-colors duration-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              location.pathname === '/' && "bg-gray-100 dark:bg-gray-800"
            )}
          >
            <Home className={cn(
              "w-5 h-5 flex-shrink-0",
              location.pathname === '/' ? "text-[#D4A27F]" : "text-[#6B6B6B]"
            )} />
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-[#0E0E0E] dark:text-[#FDFDF7] whitespace-nowrap"
              >
                首页
              </motion.span>
            )}
          </Link>

          {/* 分类列表 */}
          {categories.map(category => {
            const isActive = isCategoryActive(category.id);
            const path = getCategoryPath(category.id);

            return (
              <Link
                key={category.id}
                to={path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  "transition-colors duration-200",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  isActive && "bg-gray-100 dark:bg-gray-800"
                )}
                title={!isExpanded ? category.name : undefined}
              >
                <category.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-[#D4A27F]" : "text-[#6B6B6B]"
                )} />
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium text-[#0E0E0E] dark:text-[#FDFDF7] whitespace-nowrap"
                  >
                    {category.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 底部操作 */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
              "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            )}
            title={isExpanded ? "收起侧边栏" : "展开侧边栏"}
          >
            {isExpanded ? (
              <ChevronLeft className="w-5 h-5 text-[#6B6B6B]" />
            ) : (
              <ChevronRight className="w-5 h-5 text-[#6B6B6B]" />
            )}
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[#6B6B6B] whitespace-nowrap"
              >
                收起
              </motion.span>
            )}
          </button>
        </div>
      </aside>

      {/* ============= 移动端菜单按钮 ============= */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40
                 w-14 h-14 bg-[#0E0E0E] dark:bg-[#D4A27F]
                 text-white dark:text-[#09090B]
                 rounded-full shadow-lg flex items-center justify-center
                 hover:opacity-90 active:scale-95 transition-all"
        aria-label="打开菜单"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* ============= 移动端抽屉 ============= */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />

            {/* 抽屉内容 */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden
                         bg-white dark:bg-[#0E0E0E]
                         border-r border-gray-200 dark:border-gray-800
                         flex flex-col"
            >
              {/* 头部 */}
              <div className="h-14 flex items-center justify-between px-4
                            border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#D4A27F] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">YR</span>
                  </div>
                  <span className="font-semibold text-[#0E0E0E] dark:text-[#FDFDF7]">
                    Chat2Excel
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
                           transition-colors"
                  aria-label="关闭菜单"
                >
                  <X className="w-5 h-5 text-[#6B6B6B]" />
                </button>
              </div>

              {/* 导航链接 */}
              <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {/* 首页 */}
                <Link
                  to="/"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "transition-colors duration-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    location.pathname === '/' && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <Home className={cn(
                    "w-5 h-5 flex-shrink-0",
                    location.pathname === '/' ? "text-[#D4A27F]" : "text-[#6B6B6B]"
                  )} />
                  <span className="text-sm font-medium text-[#0E0E0E] dark:text-[#FDFDF7]">
                    首页
                  </span>
                </Link>

                {/* 分类列表 */}
                {categories.map(category => {
                  const isActive = isCategoryActive(category.id);
                  const path = getCategoryPath(category.id);

                  return (
                    <Link
                      key={category.id}
                      to={path}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                        "transition-colors duration-200",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        isActive && "bg-gray-100 dark:bg-gray-800"
                      )}
                    >
                      <category.icon className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActive ? "text-[#D4A27F]" : "text-[#6B6B6B]"
                      )} />
                      <span className="text-sm font-medium text-[#0E0E0E] dark:text-[#FDFDF7]">
                        {category.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              {/* 底部统计 */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF]">
                  <div className="flex items-center justify-between mb-2">
                    <span>工具总数</span>
                    <span className="font-semibold">{toolRegistry.getAll().length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>分类数量</span>
                    <span className="font-semibold">{categories.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
