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
 * 懒加载设计测试页面组件
 */
const DesignTest = lazy(() => import('@/views/DesignTest'));

/**
 * 导入新的单页工作流组件 (v2) - 不使用懒加载
 */
import { AppWorkflow } from '@/components/workflow/AppWorkflow';
import { OCRWorkflow } from '@/components/workflow/tools/OCRWorkflow';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { toolRegistry } from '@/lib/tool-registry';

/**
 * 创建路由器
 *
 * 定义所有路由规则和对应的组件
 * - path: 路由路径
 * - element: 对应的页面组件
 * - Suspense: 显示加载状态
 *
 * 路由说明:
 * - /: 新的可折叠工作流 (v3, Accordion 模式)
 * - /v2: v2 版本工作流 (备份)
 * - /legacy: 旧版首页 (备份)
 * - /legacy/recognizing: 旧版识别页 (备份)
 * - /legacy/editing: 旧版编辑页 (备份)
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ToolLayout tool={toolRegistry.get('ocr-table')!}>
        <OCRWorkflow />
      </ToolLayout>
    ),
  },
  {
    path: '/v2',
    element: <AppWorkflow />,
  },
  // 旧页面备份 (通过 /legacy 访问)
  {
    path: '/legacy',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: '/legacy/recognizing',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Recognizing />
      </Suspense>
    ),
  },
  {
    path: '/legacy/editing',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Editing />
      </Suspense>
    ),
  },
  {
    path: '/legacy/editing/:id',
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
  {
    path: '/design-test',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <DesignTest />
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
