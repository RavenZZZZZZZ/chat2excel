// ==============================================================================
// doc2x.config.ts - Doc2X 配置管理
// ==============================================================================
//
// 本文件管理 Doc2X API 的配置。
//
// ==============================================================================

import type { Doc2XConfig } from '@/types/doc2x';

/**
 * Doc2X 配置
 */
export const doc2xConfig: Doc2XConfig = {
  apiKey: import.meta.env.VITE_DOC2X_API_KEY || '',
  // 生产环境使用 Vercel Serverless Functions，开发环境使用本地代理服务器
  baseURL: import.meta.env.VITE_DOC2X_PROXY_URL || '/api/proxy',
  timeout: parseInt(import.meta.env.VITE_DOC2X_TIMEOUT || '60000'),
};

/**
 * 验证 Doc2X 配置
 */
export function validateDoc2XConfig(): boolean {
  if (!doc2xConfig.apiKey) {
    console.error('❌ Doc2X API Key 未配置');
    console.error('请在 .env.local 中设置 VITE_DOC2X_API_KEY');
    return false;
  }

  if (!doc2xConfig.apiKey.startsWith('sk-')) {
    console.error('❌ Doc2X API Key 格式错误，应以 sk- 开头');
    return false;
  }

  console.log('✅ Doc2X 配置验证通过');
  console.log(`📍 API Base URL: ${doc2xConfig.baseURL}`);
  console.log(`⏱️  超时时间: ${doc2xConfig.timeout}ms`);

  return true;
}
