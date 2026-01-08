// @ts-check
// ==============================================================================
// doc2x.ts - Doc2X API 配置
// ==============================================================================

/**
 * Doc2X API 基础 URL
 */
export const DOC2X_API_BASE_URL = process.env.DOC2X_API_BASE_URL || 'https://v2.doc2x.noedgeai.com';

/**
 * Doc2X API Key
 */
export const DOC2X_API_KEY = process.env.DOC2X_API_KEY;

if (!DOC2X_API_KEY) {
  console.warn('Warning: DOC2X_API_KEY is not set in environment variables');
}

/**
 * 文件上传端点
 */
export const DOC2X_UPLOAD_ENDPOINT = `${DOC2X_API_BASE_URL}/api/v2/async/parse/img/layout`;

/**
 * 状态查询端点
 */
export const DOC2X_STATUS_ENDPOINT = `${DOC2X_API_BASE_URL}/api/v2/async/parse/status`;
