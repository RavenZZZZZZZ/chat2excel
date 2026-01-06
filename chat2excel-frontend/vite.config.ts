import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    // 本地开发时代理到后端服务器（如果需要）
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // 资源内联限制
    chunkSizeWarningLimit: 1000,
  },
  // 定义全局常量
  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV),
  },
})
