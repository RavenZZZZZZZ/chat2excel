// @ts-check
// ==============================================================================
// lib/doc2x.ts - Doc2X API 配置
// ==============================================================================

export const DOC2X_API_BASE_URL = process.env.DOC2X_API_BASE_URL || 'https://v2.doc2x.noedgeai.com';
export const DOC2X_API_KEY = process.env.DOC2X_API_KEY;

if (!DOC2X_API_KEY) {
  console.warn('Warning: DOC2X_API_KEY is not set in environment variables');
}

export const DOC2X_UPLOAD_ENDPOINT = `${DOC2X_API_BASE_URL}/api/v2/async/parse/img/layout`;
export const DOC2X_STATUS_ENDPOINT = `${DOC2X_API_BASE_URL}/api/v2/async/parse/status`;
