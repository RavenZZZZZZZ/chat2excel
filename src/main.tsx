// ==============================================================================
// main.tsx - 应用入口文件
// ==============================================================================
// 
// 本文件是 React 应用的入口点，负责：
// - 导入全局样式
// - 渲染应用根组件
// 
// 执行流程：
// 1. 导入 React 和 ReactDOM
// 2. 导入全局 CSS 样式
// 3. 获取根 DOM 元素
// 4. 使用 createRoot 创建 React 根
// 5. 使用 StrictMode 包裹组件（开发时进行额外检查）
// 6. 渲染 AppRouter（路由器）
//
// ==============================================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'  // 导入 i18n 配置（必须在 AppRouter 之前）
import AppRouter from './router'

/**
 * 渲染应用
 * 
 * - document.getElementById('root'): 获取 index.html 中的根元素
 * - StrictMode: React 的严格模式，帮助发现潜在问题
 * - AppRouter: 路由器组件，包含所有页面路由
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
