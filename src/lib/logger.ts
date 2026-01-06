// ==============================================================================
// logger.ts - 日志工具
// ==============================================================================
//
// 本文件提供统一的日志管理，用于替代散落在代码中的 console.log。
//
// 功能：
// - 支持不同日志级别（debug, info, warn, error）
// - 开发环境显示详细日志，生产环境只显示错误
// - 可选择性启用/禁用日志
// - 支持日志上报到服务器（可选）
//
// ==============================================================================

/**
 * 日志级别
 */
export const enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4, // 禁用所有日志
}

/**
 * 日志配置
 */
interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  enableColors: boolean;
  // 错误上报回调（可选）
  onError?: (message: string, error?: Error) => void;
}

/**
 * 默认配置
 */
const defaultConfig: LoggerConfig = {
  // 开发环境显示所有日志，生产环境只显示错误
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.ERROR,
  enableTimestamp: true,
  enableColors: true,
};

/**
 * 当前配置
 */
let config: LoggerConfig = { ...defaultConfig };

/**
 * ANSI 颜色代码
 */
const colors = {
  reset: '\x1b[0m',
  debug: '\x1b[36m', // 青色
  info: '\x1b[32m',  // 绿色
  warn: '\x1b[33m',  // 黄色
  error: '\x1b[31m', // 红色
  dim: '\x1b[2m',    // 暗色
};

/**
 * 格式化时间戳
 */
function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().split('T')[1].slice(0, -1); // HH:MM:SS.mmm
}

/**
 * 格式化日志消息
 */
function formatMessage(level: string, message: string, color: string): string {
  const timestamp = config.enableTimestamp ? formatTimestamp() : '';
  const colorCode = config.enableColors ? color : '';
  const resetCode = config.enableColors ? colors.reset : '';

  if (timestamp) {
    return `${colorCode}[${timestamp}] [${level}]${resetCode} ${message}`;
  }
  return `${colorCode}[${level}]${resetCode} ${message}`;
}

/**
 * 日志类
 */
class Logger {
  /**
   * 设置日志配置
   */
  static setConfig(newConfig: Partial<LoggerConfig>) {
    config = { ...config, ...newConfig };
  }

  /**
   * DEBUG 级别日志
   */
  static debug(message: string, ...args: unknown[]) {
    if (config.level <= LogLevel.DEBUG) {
      const formatted = formatMessage('DEBUG', message, colors.debug);
      console.log(formatted, ...args);
    }
  }

  /**
   * INFO 级别日志
   */
  static info(message: string, ...args: unknown[]) {
    if (config.level <= LogLevel.INFO) {
      const formatted = formatMessage('INFO', message, colors.info);
      console.info(formatted, ...args);
    }
  }

  /**
   * WARN 级别日志
   */
  static warn(message: string, ...args: unknown[]) {
    if (config.level <= LogLevel.WARN) {
      const formatted = formatMessage('WARN', message, colors.warn);
      console.warn(formatted, ...args);
    }
  }

  /**
   * ERROR 级别日志
   */
  static error(message: string, error?: Error | unknown, ...args: unknown[]) {
    if (config.level <= LogLevel.ERROR) {
      const formatted = formatMessage('ERROR', message, colors.error);
      console.error(formatted, error, ...args);

      // 如果配置了错误上报，执行上报
      if (config.onError) {
        try {
          const errorMessage = error instanceof Error ? error.message : String(error);
          config.onError(`${message}: ${errorMessage}`, error instanceof Error ? error : undefined);
        } catch (err) {
          // 防止错误上报函数本身出错
          console.error('错误上报失败:', err);
        }
      }
    }
  }

  /**
   * 创建带前缀的日志器
   */
  static withPrefix(prefix: string) {
    return {
      debug: (message: string, ...args: unknown[]) => this.debug(`${prefix} ${message}`, ...args),
      info: (message: string, ...args: unknown[]) => this.info(`${prefix} ${message}`, ...args),
      warn: (message: string, ...args: unknown[]) => this.warn(`${prefix} ${message}`, ...args),
      error: (message: string, error?: Error | unknown, ...args: unknown[]) =>
        this.error(`${prefix} ${message}`, error, ...args),
    };
  }

  /**
   * 禁用所有日志
   */
  static disable() {
    config.level = LogLevel.NONE;
  }

  /**
   * 启用所有日志
   */
  static enable() {
    config.level = LogLevel.DEBUG;
  }
}

/**
 * 导出日志实例
 */
export const logger = Logger;

/**
 * 开发环境快捷方法
 */
export const log = {
  debug: (message: string, ...args: unknown[]) => Logger.debug(message, ...args),
  info: (message: string, ...args: unknown[]) => Logger.info(message, ...args),
  warn: (message: string, ...args: unknown[]) => Logger.warn(message, ...args),
  error: (message: string, error?: Error | unknown, ...args: unknown[]) =>
    Logger.error(message, error, ...args),
};

/**
 * 创建带上下文的日志器
 *
 * @example
 * const logger = createLogger('HomePage');
 * logger.info('用户点击了按钮');
 */
export function createLogger(context: string) {
  return Logger.withPrefix(`[${context}]`);
}
