/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 移除 output: 'standalone'，改用默认模式以兼容 Vercel
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    // 为构建时提供假的环境变量（仅在构建时使用，运行时使用 Vercel 环境变量）
    SUPABASE_URL: 'https://fake.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'fake-key',
    // DOC2X_API_KEY 不能设置假值，否则会覆盖 Vercel 的真实环境变量
  },
}

export default nextConfig
