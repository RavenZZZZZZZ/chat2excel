// ==============================================================================
// router/index.tsx - React Router 路由配置
// ==============================================================================
// 
// 本文件定义应用的所有路由配置。
// 
// 主要功能：
// - 使用 createBrowserRouter 创建路由器
// - 使用 React.lazy 实现路由懒加载（代码分割）
// - 使用 Suspense 处理加载状态
// 
// 路由列表：
// - /: 首页（上传页面）
// - /recognizing: 识别中页面
// - /editing/:id: 编辑页面（带参数 id）
// - /export/:id: 导出页面（带参数 id）
// - /help: 帮助页面
//
// ==============================================================================

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';

/**
 * 懒加载首页组件
 * 
 * 使用 React.lazy 实现代码分割，只在需要时加载
 */
const Home = lazy(() => import('@/views/Home'));

/**
 * 懒加载识别中页面组件
 */
const Recognizing = lazy(() => import('@/views/Recognizing'));

/**
 * 懒加载编辑页面组件
 */
const Editing = lazy(() => import('@/views/Editing'));

/**
 * 懒加载导出页面组件
 */
const Export = lazy(() => import('@/views/Export'));

/**
 * 懒加载帮助页面组件
 */
const Help = lazy(() => import('@/views/Help'));

/**
 * 创建路由器
 * 
 * 定义所有路由规则和对应的组件
 * - path: 路由路径
 * - element: 对应的页面组件
 * - Suspense: 显示加载状态
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: '/recognizing',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Recognizing />
      </Suspense>
    ),
  },
  {
    path: '/editing',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Editing />
      </Suspense>
    ),
  },
  {
    path: '/editing/:id',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Editing />
      </Suspense>
    ),
  },
  {
    path: '/export/:id',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Export />
      </Suspense>
    ),
  },
  {
    path: '/help',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Help />
      </Suspense>
    ),
  },
]);

/**
 * 应用路由器组件
 * 
 * 导出路由器组件，在 main.tsx 中使用
 */
export default function AppRouter() {
  return <RouterProvider router={router} />;
}
