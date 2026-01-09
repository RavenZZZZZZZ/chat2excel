// ==============================================================================
// router/index.tsx - React Router 路由配置
// ==============================================================================
//
// 本文件定义应用的所有路由配置。
//
// 主要功能：
// - 使用 createBrowserRouter 创建路由器
// - 简化的路由结构 (仅保留必要路由)
//
// 路由列表：
// - /: OCR 工具主页 (新的可折叠工作流)
// - /help: 帮助页面
//
// ==============================================================================

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';

/**
 * 懒加载帮助页面组件
 */
const Help = lazy(() => import('@/views/Help'));

/**
 * 导入新的 OCR 工作流组件
 */
import { OCRWorkflow } from '@/components/workflow/tools/OCRWorkflow';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { toolRegistry } from '@/lib/tool-registry';

/**
 * 创建路由器
 *
 * 路由说明:
 * - /: OCR 表格识别工具 (新的可折叠工作流界面)
 * - /help: 帮助页面
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
    path: '/help',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Help />
      </Suspense>
    ),
  },
  // 404 页面 (放到最后)
  {
    path: '*',
    element: <div>页面未找到</div>,
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
