# 前端部署架构说明

## 🏗️ 当前架构

Chat2Excel 使用**混合架构**部署到 Vercel：

### 组件分布

```
┌─────────────────────────────────────────────────┐
│              Vercel 部署                         │
├─────────────────────────────────────────────────┤
│                                                  │
│  Next.js 16.1.1 (App Router)                    │
│  ├── app/page.tsx          → 根路由页面         │
│  ├── app/api/*/route.ts     → API 路由         │
│  └── public/assets/*         → 前端静态资源     │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 文件说明

#### 1. **后端 API** - `app/api/`
- 由 Next.js App Router 处理
- 8 个 API 端点（health, tasks, storage, ocr）
- 运行时执行，动态处理请求

#### 2. **前端页面** - `app/page.tsx`
- Next.js 根路由组件
- 直接渲染 HTML，引用 Vite 构建的 JS/CSS
- 静态预渲染（`○ /`）

#### 3. **前端资源** - `public/assets/`
- Vite 构建的前端应用文件
- JS: `index-BWKsTMP9.js`
- CSS: `index-8U-2jKh2.css`
- 存储在 Git 仓库中

## 🔄 工作流程

### 本地开发

```bash
# 终端 1: 启动后端 (Next.js)
npm run dev
# → http://localhost:3000/api/*

# 终端 2: 启动前端 (Vite)
npm run dev:vite
# → http://localhost:5173/
```

### 构建和部署

```bash
# 1. 构建前端
npm run build:vite

# 2. 复制到 public/
cp -r dist/assets public/
cp dist/index.html public/

# 3. 提交到 Git
git add public/
git commit -m "update: frontend build"

# 4. 推送触发 Vercel 部署
git push origin main
```

### Vercel 构建过程

1. **安装依赖** - `npm install`
2. **构建 Next.js** - `npm run build`
3. **输出到** - `.next/` 目录
4. **前端文件** - 从 Git 的 `public/` 读取
5. **部署** - 上传到 Vercel CDN

## 📁 关键文件

### Next.js 配置

**[next.config.mjs](../next.config.mjs)**
```javascript
{
  reactStrictMode: true,
  output: 'standalone',  // Vercel 优化
  env: { /* 环境变量 */ }
}
```

**[vercel.json](../vercel.json)**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### 根页面

**[app/page.tsx](../app/page.tsx)**
```tsx
export default function RootPage() {
  return (
    <html lang="zh-CN">
      <head>
        <script src="/assets/index-BWKsTMP9.js"></script>
        <link href="/assets/index-8U-2jKh2.css" />
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  );
}
```

### .gitignore

**[.gitignore](../.gitignore)**
```
# 忽略构建产物
dist/
.next/

# 但保留前端文件（Vercel 需要从 Git 读取）
!public/assets/
!public/index.html
```

## 🚀 访问路径

| 路径 | 处理方式 | 文件位置 |
|------|---------|----------|
| `/` | Next.js 静态页面 | `app/page.tsx` |
| `/api/*` | Next.js API 路由 | `app/api/*/route.ts` |
| `/assets/*` | 静态文件服务 | `public/assets/*` |

## ⚠️ 重要注意事项

### 1. 前端资源文件名

每次 Vite 重新构建时，文件名会变化（包含哈希）：
- `index-BWKsTMP9.js` → `index-ABC123.js`
- `index-8U-2jKh2.css` → `index-XYZ789.css`

**更新步骤**：
1. 运行 `npm run build:vite`
2. 检查 `dist/index.html` 中的新文件名
3. 更新 `app/page.tsx` 中的引用
4. 复制文件到 `public/`
5. 提交到 Git

### 2. 为什么不使用 build:all 脚本

原计划使用 `scripts/build-all.sh` 自动构建前后端，但遇到问题：
- `.gitignore` 忽略了 `public/assets/`
- Vercel 构建时文件不会被提交
- 部署后前端资源 404

**解决方案**：手动构建并提交前端文件到 Git

### 3. 为什么不在 Vercel 构建时构建前端

理论上可以，但会有问题：
- 每次部署都会重新构建前端
- 文件名哈希变化，缓存失效
- 构建时间延长

**当前方案**：前端文件提交到 Git，稳定可靠

## 🔧 故障排查

### 问题：访问 / 返回 404

**原因**：
- `app/page.tsx` 不存在
- 或 `public/assets/` 文件不存在

**解决**：
```bash
# 检查文件是否存在
ls app/page.tsx
ls public/assets/index-*.js

# 重新构建
npm run build:vite
cp -r dist/assets public/
```

### 问题：前端 JS 加载失败

**原因**：
- `app/page.tsx` 中的文件名不匹配
- 文件未提交到 Git

**解决**：
```bash
# 检查实际文件名
ls public/assets/

# 更新 app/page.tsx 中的文件名
git add app/page.tsx public/
git commit -m "fix: update frontend assets"
git push
```

### 问题：API 调用失败

**原因**：
- API 环境变量未配置
- Supabase/Doc2X 密钥错误

**解决**：
检查 Vercel Dashboard → Settings → Environment Variables

## 📊 性能优化

### 当前实现

- ✅ 根路由静态预渲染
- ✅ API 路由动态执行
- ✅ 前端资源 CDN 缓存

### 未来改进

- [ ] 添加 API 响应缓存
- [ ] 使用 ISR (Incremental Static Regeneration)
- [ ] 实现 Service Worker 离线支持

## 🎯 总结

这个混合架构的优势：
1. **简单可靠** - 前端文件存储在 Git，不依赖构建时
2. **部署快速** - 只需构建 Next.js，前端文件直接读取
3. **易于维护** - 清晰的文件结构和职责分离

缺点：
- 需要手动更新前端文件引用
- Git 仓库会变大（包含构建产物）

对于小型项目来说，这是一个**实用且稳定**的部署方案。
