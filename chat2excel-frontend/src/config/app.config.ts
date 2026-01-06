// ==============================================================================
// app.config.ts - 应用配置
// ==============================================================================
// 
// 本文件集中管理应用的所有配置项，从环境变量读取配置。
// 
// 主要配置：
// - API 地址和超时设置
// - OCR 引擎选择
// - 功能开关（测试功能、分析）
// - Tesseract OCR 配置
// - Excel 导出配置
//
// 环境变量说明：
// - VITE_ 前缀：Vite 特有的环境变量
// - 在 .env.local 文件中配置
// - 通过 import.meta.env 访问
//
// ==============================================================================

import type { AppConfig } from '@/types';

/**
 * 应用主配置
 * 
 * 从环境变量读取配置，如果未设置则使用默认值
 */
export const appConfig: AppConfig = {
  // API 基础地址
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  // API 请求超时时间（毫秒）
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  // OCR 识别引擎（tesseract/baidu/aliyun）
  ocrProvider: import.meta.env.VITE_OCR_PROVIDER || 'tesseract',
  // 是否启用测试版功能
  enableBetaFeatures: import.meta.env.VITE_ENABLE_BETA_FEATURES === 'true',
  // 是否启用数据分析
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

/**
 * 完整配置对象
 * 
 * 包含所有子配置模块
 */
export const config = {
  app: appConfig,
  
  /**
   * Tesseract OCR 配置
   * 
   * Tesseract.js 是一个纯前端的 OCR 库
   */
  tesseract: {
    // Worker 文件路径（用于 Web Worker）
    workerPath: import.meta.env.VITE_TESSERACT_WORKER_PATH || '/tesseract.js',
    // 语言文件路径
    langPath: import.meta.env.VITE_TESSERACT_LANG_PATH || '/lang/',
    // 支持的语言（简体中文、英文）
    languages: ['chi_sim', 'eng'],
  },
  
  /**
   * Excel 导出配置
   * 
   * 定义导出时的限制和默认选项
   */
  export: {
    // 最大导出文件大小（MB）
    maxSizeMB: Number(import.meta.env.VITE_EXPORT_MAX_SIZE_MB) || 10,
    // 默认导出格式
    defaultFormat: 'xlsx',
  },
};
