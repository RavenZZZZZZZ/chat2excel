// ==============================================================================
// src/sentry.ts - Sentry 错误监控初始化
// ==============================================================================
//
// 配置 Sentry 客户端用于错误追踪和性能监控
//
// ==============================================================================

import * as Sentry from '@sentry/react';

// 从环境变量获取 Sentry DSN
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENABLE_SENTRY = import.meta.env.VITE_ENABLE_SENTRY === 'true' && !!SENTRY_DSN;

// 初始化 Sentry
if (ENABLE_SENTRY) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV || 'production',
    integrations: [
      new Sentry.BrowserTracing({
        tracingOrigins: [
          'localhost',
          'your-domain.vercel.app',
          /^\//,
        ],
      }),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // 性能监控采样率
    tracesSampleRate: 0.1, // 10% 的请求用于性能监控
    // 回放采样率
    replaysSessionSampleRate: 0.1, // 10% 的正常会话
    replaysOnErrorSampleRate: 1.0, // 100% 的错误会话
    // 过滤敏感数据
    beforeSend(event) {
      // 移除敏感的请求头
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }
      return event;
    },
    // 过滤不需要的错误
    ignoreErrors: [
      // 浏览器扩展导致的错误
      'top.GLOBALS',
      // 原始错误对象
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Facebook 相关错误
      'fb_xd_fragment',
      // 其他常见但不重要的错误
      /^Script error\.?$/,
      /^Javascript error\.?$/,
    ],
    denyUrls: [
      // 浏览器扩展
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      // 第三方脚本
      /graph\.facebook\.com/i,
      /connect\.facebook\.net/i,
    ],
  });

  console.log('✅ Sentry 已初始化');
  console.log(`📍 环境: ${import.meta.env.VITE_APP_ENV || 'production'}`);
} else {
  console.log('ℹ️  Sentry 未启用（生产环境建议启用）');
  console.log('   在 .env.local 中设置 VITE_ENABLE_SENTRY=true 和 VITE_SENTRY_DSN=your-dsn');
}

export { Sentry };
