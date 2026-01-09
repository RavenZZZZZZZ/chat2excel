// ==============================================================================
// Sidebar.tsx - 侧边栏导航组件 (重新设计)
// ==============================================================================
//
// 本组件实现侧边栏导航系统:
// - 可折叠/展开的侧边栏
// - 显示已激活的工具 (表格 OCR)
// - 显示即将推出的工具 (敬请期待)
// - Tooltip 提示功能
// - 移动端抽屉式导航
//
// 核心功能:
// - 当前可用工具可点击跳转
// - 未来工具显示"敬请期待"标签
// - 鼠标悬停显示详细提示
// - 响应式设计 (桌面端/移动端)
// - 当前路由高亮
//
// ==============================================================================

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronLeft, ChevronRight, Home, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toolRegistry, ToolCategory } from '@/lib/tool-registry';

/**
 * 敬请期待提示组件
 *
 * 在折叠模式下,鼠标悬停时显示的 Tooltip
 */
function ComingSoonTooltip({ isExpanded, children }: { isExpanded: boolean; children: React.ReactNode }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (isExpanded) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3
                       z-50 px-3 py-2
                       bg-[#0E0E0E] dark:bg-[#D4A27F]
                       text-white dark:text-[#09090B]
                       text-xs font-medium
                       rounded-lg
                       whitespace-nowrap
                       shadow-lg
                       pointer-events-none"
          >
            敬请期待
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2
                        w-2 h-2 bg-[#0E0E0E] dark:bg-[#D4A27F]
                        rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 侧边栏导航组件
 *
 * 实现可折叠的侧边栏导航:
 * - 桌面端: 64px (折叠) / 260px (展开)
 * - 移动端: 抽屉式全屏导航
 * - 显示已激活的工具 (表格 OCR)
 * - 显示即将推出的工具 (敬请期待)
 */
export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // 获取所有分类和工具
  const categories = toolRegistry.getCategories();
  const allTools = toolRegistry.getAll();

  /**
   * 检查分类是否有可用的工具
   */
  const hasAvailableTools = (categoryId: string): boolean => {
    const tools = toolRegistry.getByCategory(categoryId);
    return tools.length > 0;
  };

  /**
   * 检查分类是否处于激活状态
   */
  const isCategoryActive = (categoryId: string): boolean => {
    const tools = toolRegistry.getByCategory(categoryId);
    return tools.some((tool) => tool.path === location.pathname);
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

          {/* 分隔线 */}
          <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

          {/* 已激活的工具 (表格 OCR) */}
          {categories
            .filter((cat: ToolCategory) => hasAvailableTools(cat.id))
            .map((category: ToolCategory) => {
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

          {/* 即将推出的工具 (敬请期待) */}
          {categories
            .filter(cat => !hasAvailableTools(cat.id))
            .map(category => (
              <ComingSoonTooltip key={category.id} isExpanded={isExpanded}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "transition-colors duration-200",
                    "opacity-60 cursor-not-allowed",
                    "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  )}
                  title={!isExpanded ? "敬请期待" : undefined}
                >
                  <category.icon className="w-5 h-5 flex-shrink-0 text-[#6B6B6B]" />
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 flex-1"
                    >
                      <span className="text-sm font-medium text-[#0E0E0E] dark:text-[#FDFDF7] whitespace-nowrap">
                        {category.name}
                      </span>
                      <div className="flex items-center gap-1 px-2 py-0.5
                                  bg-gray-100 dark:bg-gray-800
                                  rounded-full">
                        <Lock className="w-3 h-3 text-[#9CA3AF]" />
                        <span className="text-xs text-[#9CA3AF]">敬请期待</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ComingSoonTooltip>
            ))}
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

                {/* 分隔线 */}
                <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

                {/* 已激活的工具 */}
                {categories
                  .filter(cat => hasAvailableTools(cat.id))
                  .map(category => {
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

                {/* 即将推出的工具 */}
                {categories
                  .filter(cat => !hasAvailableTools(cat.id))
                  .map(category => (
                    <div
                      key={category.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                        "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <category.icon className="w-5 h-5 flex-shrink-0 text-[#6B6B6B]" />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium text-[#0E0E0E] dark:text-[#FDFDF7]">
                          {category.name}
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5
                                    bg-gray-100 dark:bg-gray-800
                                    rounded-full">
                          <Lock className="w-3 h-3 text-[#9CA3AF]" />
                          <span className="text-xs text-[#9CA3AF]">敬请期待</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </nav>

              {/* 底部统计 */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-xs text-[#6B6B6B] dark:text-[#9CA3AF]">
                  <div className="flex items-center justify-between mb-2">
                    <span>可用工具</span>
                    <span className="font-semibold">{allTools.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>即将推出</span>
                    <span className="font-semibold">
                      {categories.filter(cat => !hasAvailableTools(cat.id)).length}
                    </span>
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
