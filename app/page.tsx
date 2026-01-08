// @ts-check
// ==============================================================================
// app/page.tsx - 根页面（重定向到前端应用）
// ==============================================================================

/**
 * 根页面组件
 *
 * 注意：这个项目使用混合架构：
 * - 后端：Next.js API Routes (app/api/*)
 * - 前端：Vite + React (dist/*)
 *
 * 前端应用需要单独构建并部署到 public/ 目录
 */

import { redirect } from 'next/navigation';

export default function RootPage() {
  // 如果前端已构建到 public/，则直接重定向到 index.html
  // 否则显示开发说明
  if (process.env.NODE_ENV === 'production') {
    redirect('/index.html');
  }

  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Chat2Excel - 表格 OCR 识别工具</title>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h1 style={{
            margin: '0 0 20px 0',
            fontSize: '28px',
            color: '#333',
          }}>
            🚀 Chat2Excel
          </h1>
          <p style={{
            margin: '0 0 20px 0',
            fontSize: '16px',
            color: '#666',
            lineHeight: '1.6',
          }}>
            智能表格识别与导出工具
          </p>
          <div style={{
            background: '#f5f5f5',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
          }}>
            <p style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
            }}>
              开发模式说明：
            </p>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.8',
            }}>
              <li>后端 API: <code>npm run dev</code> (端口 3000)</li>
              <li>前端应用: <code>npm run dev:vite</code> (端口 5173)</li>
            </ul>
          </div>
          <a
            href="http://localhost:5173"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#5568d3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#667eea';
            }}
          >
            打开前端应用 →
          </a>
          <p style={{
            margin: '20px 0 0 0',
            fontSize: '12px',
            color: '#999',
            textAlign: 'center',
          }}>
            查看 <a href="/docs" style={{ color: '#667eea' }}>文档</a> |
            查看 <a href="/api/health" style={{ color: '#667eea' }}>API 状态</a>
          </p>
        </div>
      </body>
    </html>
  );
}
