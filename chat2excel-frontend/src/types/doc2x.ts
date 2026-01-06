// ==============================================================================
// doc2x.ts - Doc2X API 类型定义
// ==============================================================================
//
// 本文件定义 Doc2X API 的请求和响应类型。
//
// ==============================================================================

/**
 * Doc2X API 响应
 */
export interface Doc2XResponse {
  code: string;
  data?: {
    uid?: string;
    result?: Doc2XResult;
    status?: 'processing' | 'success' | 'failed';
    progress?: number;
    detail?: string;
  };
  error?: string;
}

/**
 * Doc2X 识别结果
 */
export interface Doc2XResult {
  blocks?: Doc2XBlock[];
  pages?: Doc2XPage[];
  // 根据实际 API 返回补充其他字段
}

/**
 * Doc2X 页面数据
 */
export interface Doc2XPage {
  md?: string; // Markdown 格式的内容
  blocks?: Doc2XBlock[];
}

/**
 * Doc2X 文本块
 */
export interface Doc2XBlock {
  text: string;
  bbox?: [number, number, number, number] | BBoxRect;
  confidence?: number;
  type?: string;
  // 根据实际 API 返回补充其他字段
}

/**
 * 边界框矩形格式
 */
export interface BBoxRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Doc2X 配置
 */
export interface Doc2XConfig {
  apiKey: string;
  baseURL: string;
  timeout: number;
}
