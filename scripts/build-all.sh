#!/bin/bash
# ==============================================================================
# build-all.sh - 构建前端和后端
# ==============================================================================

set -e  # 遇到错误立即退出

echo "🚀 开始构建 Chat2Excel..."

# 1. 构建前端（Vite）
echo ""
echo "📦 步骤 1/3: 构建前端 (Vite)..."
npm run build:vite

# 2. 复制前端构建产物到 public 目录
echo ""
echo "📋 步骤 2/3: 复制前端文件到 public 目录..."
rm -rf public/assets
rm -f public/index.html
rm -f public/vite.svg

cp -r dist/assets public/
cp dist/index.html public/
cp -r dist/*.svg public/ 2>/dev/null || true

echo "  ✅ 前端文件已复制到 public/"

# 3. 构建后端（Next.js）
echo ""
echo "🔧 步骤 3/3: 构建后端 (Next.js)..."
npm run build

echo ""
echo "✅ 构建完成！"
echo ""
echo "📂 输出目录："
echo "  - 后端: .next/"
echo "  - 前端: public/"
echo ""
echo "🧪 本地测试："
echo "  npm run start"
echo ""
echo "🚀 部署到 Vercel："
echo "  git push origin main"
echo ""
