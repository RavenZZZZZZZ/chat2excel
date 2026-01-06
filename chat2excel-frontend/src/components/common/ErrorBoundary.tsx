// ==============================================================================
// ErrorBoundary.tsx - React 错误边界组件
// ==============================================================================
//
// 本组件实现 React 错误边界（Error Boundary），用于捕获子组件树中的
// JavaScript 错误，记录错误日志，并显示备用 UI 而不是让整个应用崩溃。
//
// ==============================================================================

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
// @ts-ignore - UI components may not have type exports
import { Button } from '@/components/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React 错误边界组件
 *
 * 捕获子组件树中的错误，防止整个应用崩溃
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到控制台
    console.error('❌ Error Boundary 捕获到错误:', error);
    console.error('错误堆栈:', errorInfo.componentStack);

    // 发送错误到 Sentry
    import('@/sentry').then(({ Sentry }) => {
      if (typeof Sentry !== 'undefined' && Sentry.captureException) {
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        });
      }
    });

    // 保存错误信息到 state
    this.setState({
      error,
      errorInfo,
    });

    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误 UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              {/* 错误图标 */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* 标题 */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
                出错了
              </h1>

              {/* 错误描述 */}
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                应用程序遇到了意外错误。我们已经记录了这个问题，请尝试刷新页面。
              </p>

              {/* 错误详情（仅开发环境显示） */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mb-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    查看错误详情
                  </summary>
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-auto max-h-60">
                    <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* 操作按钮 */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="px-6 py-2"
                >
                  重试
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="px-6 py-2"
                >
                  刷新页面
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 函数式错误边界 Hook（用于函数组件）
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
