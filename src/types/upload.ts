// ==============================================================================
// upload.ts - 上传相关类型定义
// ==============================================================================

/**
 * 上传文件状态
 */
export type UploadStatus =
  | 'idle'          // 空闲
  | 'uploading'     // 上传中
  | 'success'       // 成功
  | 'error'         // 错误
  | 'cancelled';    // 已取消

/**
 * 上传任务信息
 */
export interface UploadTask {
  id: string;                    // 任务 ID
  file: File;                    // 原始文件
  status: UploadStatus;          // 状态
  progress: number;              // 进度 0-100
  error?: string;                // 错误信息
  preview?: string;              // 本地预览 URL
  uploadedPath?: string;         // 上传后的路径
  uploadedUrl?: string;          // 上传后的 URL
  recordId?: string;             // 数据库记录 ID
}

/**
 * 上传结果
 */
export interface UploadResult {
  success: boolean;
  tasks: UploadTask[];
  errors: string[];
}

/**
 * 上传配置
 */
export interface UploadConfig {
  maxSize: number;               // 最大文件大小（字节）
  allowedTypes: string[];        // 允许的 MIME 类型
  bucketName: string;            // Storage bucket 名称
  path: string;                  // 上传路径前缀
}

/**
 * 上传进度回调
 */
export type ProgressCallback = (task: UploadTask) => void;

/**
 * 上传完成回调
 */
export type CompleteCallback = (result: UploadResult) => void;

/**
 * 上传错误代码
 */
export type UploadErrorCode =
  | 'FILE_TOO_LARGE'          // 文件过大
  | 'INVALID_FILE_TYPE'       // 文件类型无效
  | 'NETWORK_ERROR'           // 网络错误
  | 'STORAGE_ERROR'           // Storage 错误
  | 'DATABASE_ERROR'          // 数据库错误
  | 'UNKNOWN_ERROR';          // 未知错误

/**
 * 上传错误
 */
export interface UploadError {
  code: UploadErrorCode;
  message: string;
  details?: any;
}

/**
 * 错误信息映射
 */
export const ERROR_MESSAGES: Record<UploadErrorCode, string> = {
  FILE_TOO_LARGE: '文件大小超过限制（最大 7MB）',
  INVALID_FILE_TYPE: '不支持的文件格式，请上传 JPG、PNG、WEBP 或 GIF 图片',
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  STORAGE_ERROR: '文件上传失败，请稍后重试',
  DATABASE_ERROR: '保存记录失败，请稍后重试',
  UNKNOWN_ERROR: '未知错误，请稍后重试',
};
