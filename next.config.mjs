/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 移除 output: 'standalone'，改用默认模式以兼容 Vercel
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    // ⚠️ 重要：不要在这里设置 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY
    // next.config.mjs 中的 env 会覆盖 Vercel 的真实环境变量
    // 这些变量应该只在 Vercel Dashboard 中配置，不要在代码中设置假值
  },
  // 禁用静态资源缓存以便开发时快速测试
  generateEtags: false,
  // 增加 API body 大小限制,支持上传大图片 (最大 7MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '7mb',
    },
  },
  // API 路由配置
  api: {
    bodySizeLimit: '7mb',
    responseLimit: '8mb',
  },
}

export default nextConfig
