// ==============================================================================
// api.ts - API 相关类型定义
// ==============================================================================
// 
// 本文件定义了与后端 API 交互相关的 TypeScript 类型。
// 
// 主要类型：
// - ApiResponse<T>: 统一的 API 响应格式（泛型）
// - ApiError: API 错误响应格式
// - FileUploadResponse: 文件上传响应
// - RecognitionRequest: OCR 识别请求
//
// ==============================================================================

/**
 * 统一的 API 响应格式（泛型）
 * 
 * @template T - 响应数据的类型
 * 
 * @example
 * // 成功响应示例
 * {
 *   success: true,
 *   code: 200,
 *   message: "操作成功",
 *   data: { ... },
 *   timestamp: 1234567890
 * }
 */
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/**
 * API 错误响应格式
 * 
 * 当 API 请求失败时，后端返回的错误信息格式
 */
export interface ApiError {
  success: false;
  code: number;
  message: string;
  error: string;
  timestamp: number;
}

/**
 * 文件上传响应
 * 
 * 文件上传成功后，后端返回的文件信息
 */
export interface FileUploadResponse {
  fileId: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  width: number;
  height: number;
}

/**
 * OCR 识别请求
 * 
 * 发起表格识别时，向后端发送的请求参数
 */
export interface RecognitionRequest {
  fileId: string;
  ocrProvider: 'tesseract' | 'baidu' | 'aliyun';
  options?: {
    detectStructure: boolean;
    mergeCells: boolean;
  };
}
