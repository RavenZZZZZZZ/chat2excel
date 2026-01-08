// ==============================================================================
// api/utils/logger.ts - 日志工具
// ==============================================================================
//
// 提供结构化日志记录功能，并支持错误上报到 Sentry
//
// ==============================================================================//

export class Logger {
  static info(message: string, meta?: any) {
    console.log(`ℹ️ ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  static error(message: string, error?: any) {
    console.error(`❌ ${message}`, error);

    // TODO: 发送到 Sentry
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error || new Error(message), {
    //     level: 'error',
    //     extra: { message },
    //   });
    // }
  }

  static warn(message: string, meta?: any) {
    console.warn(`⚠️ ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  static success(message: string, meta?: any) {
    console.log(`✅ ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }
}
