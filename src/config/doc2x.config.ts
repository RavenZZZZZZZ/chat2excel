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
 *
 * 注意：API Key 仅在服务端（Vercel Serverless Functions）使用
 * 前端通过 /api/proxy 调用，不需要 API Key
 */
export const doc2xConfig: Doc2XConfig = {
  apiKey: '', // 前端不需要 API Key，由服务端管理
  // 生产环境使用 Vercel Serverless Functions，开发环境使用本地代理服务器
  baseURL: import.meta.env.VITE_DOC2X_PROXY_URL || '/api/proxy',
  timeout: parseInt(import.meta.env.VITE_DOC2X_TIMEOUT || '60000'),
};

/**
 * 验证 Doc2X 配置
 */
export function validateDoc2XConfig(): boolean {
  if (!doc2xConfig.baseURL) {
    console.error('❌ Doc2X Proxy URL 未配置');
    console.error('请在 .env.local 中设置 VITE_DOC2X_PROXY_URL');
    return false;
  }

  console.log('✅ Doc2X 配置验证通过');
  console.log(`📍 API Proxy URL: ${doc2xConfig.baseURL}`);
  console.log(`⏱️  超时时间: ${doc2xConfig.timeout}ms`);
  console.log(`🔒 API Key 由服务端管理，前端无需配置`);

  return true;
}
