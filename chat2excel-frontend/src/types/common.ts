// ==============================================================================
// common.ts - 通用类型定义
// ==============================================================================
// 
// 本文件定义了项目中通用的 TypeScript 类型。
// 
// 主要类型：
// - Language: 支持的语言类型
// - AppConfig: 应用配置
// - ToastMessage: Toast 消息提示
//
// ==============================================================================

/**
 * 支持的语言类型
 * 
 * 定义应用支持的语言选项
 */
export type Language = 'zh-CN' | 'en-US';

/**
 * 应用配置
 * 
 * 应用的全局配置项，通常从环境变量读取
 */
export interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  ocrProvider: string;
  enableBetaFeatures: boolean;
  enableAnalytics: boolean;
}

/**
 * Toast 消息提示
 * 
 * 用于显示操作成功、失败、警告等提示信息
 */
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
