// ==============================================================================
// App.tsx - 应用根组件
// ==============================================================================
//
// 本组件是应用的根组件，负责：
// - 布局结构（Header、Main、Footer）
// - 路由出口
// - Sentry 初始化
// - Vercel Analytics 集成
//
// 组件结构：
// - <Header>: 顶部导航栏
// - <main>: 页面内容区域（包含 <Outlet>）
// - <Footer>: 页脚区域
//
// ==============================================================================

import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

// 初始化 Sentry（仅在生产环境且配置了 DSN 时启用）
if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_SENTRY === 'true') {
  import('@/sentry');
}

/**
 * App 根组件
 *
 * 定义应用的整体布局结构
 * - 使用 ErrorBoundary 包裹整个应用，防止错误导致崩溃
 * - 使用 flex 布局实现 Header 在顶部、Footer 在底部
 * - 使用 <Outlet> 渲染当前路由对应的页面组件
 * - 集成 Vercel Analytics 用于访问统计
 */
function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 错误会被自动上报到 Sentry（如果已配置）
        console.error('应用级错误捕获:', error, errorInfo);
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        disableTransitionOnChange={false}
        storageKey="chat2excel-theme"
      >
        <div className="min-h-screen flex flex-col">
          {/* 顶部导航栏 */}
          <Header />

          {/* 页面主要内容区域 */}
          <main className="flex-1">
            <Outlet />
          </main>

          {/* 页脚 */}
          <Footer />
        </div>

        {/* Vercel Analytics - 仅在生产环境启用 */}
        {import.meta.env.PROD && <Analytics />}
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
