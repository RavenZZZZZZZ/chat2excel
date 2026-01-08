#!/bin/bash
# ==============================================================================
# test-webp.sh - 测试 WebP 格式是否被 Doc2X API 支持
# ==============================================================================

set -e

echo "🧪 测试 WebP 格式支持..."
echo ""

# 检查是否有测试图片
if [ ! -d "test-images" ]; then
  echo "❌ 错误: test-images 目录不存在"
  echo "   请先创建 test-images 目录并放入测试图片"
  exit 1
fi

# 查找 WebP 图片
webp_images=$(find test-images -type f -name "*.webp" 2>/dev/null || true)

if [ -z "$webp_images" ]; then
  echo "❌ 错误: test-images 目录中没有 WebP 图片"
  echo "   请添加 .webp 格式的测试图片"
  exit 1
fi

echo "✅ 找到 WebP 图片:"
echo "$webp_images" | nl
echo ""

# 检查 API key
if [ -z "$DOC2X_API_KEY" ]; then
  echo "⚠️  警告: DOC2X_API_KEY 环境变量未设置"
  echo "   尝试从 .env.local 读取..."

  if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
    echo "✅ 已从 .env.local 加载环境变量"
  else
    echo "❌ 错误: .env.local 文件不存在"
    echo "   请设置 DOC2X_API_KEY 环境变量"
    exit 1
  fi
fi

echo ""
echo "📤 开始测试 WebP 图片上传..."
echo ""

# 测试每个 WebP 图片
while IFS= read -r webp_image; do
  if [ -f "$webp_image" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📷 测试文件: $webp_image"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 获取文件大小
    file_size=$(stat -f%z "$webp_image" 2>/dev/null || stat -c%s "$webp_image" 2>/dev/null)
    file_size_mb=$(echo "scale=2; $file_size / 1024 / 1024" | bc)

    echo "   文件大小: ${file_size_mb} MB"
    echo ""

    # 调用 Doc2X API
    response=$(curl -s -X POST \
      "https://api.doc2x.no/v1/ocr/text" \
      -H "Authorization: Bearer $DOC2X_API_KEY" \
      -H "Content-Type: image/webp" \
      --data-binary "@$webp_image" \
      --max-time 30 \
      -w "\n%{http_code}")

    # 分离响应体和状态码
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')

    echo "📥 HTTP 状态码: $http_code"
    echo "📄 API 响应:"
    echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body"
    echo ""

    # 检查是否成功
    if [ "$http_code" = "200" ]; then
      echo "✅ 成功! WebP 格式被 Doc2X API 支持"
    else
      echo "❌ 失败! HTTP 状态码: $http_code"
    fi

    echo ""
  fi
done <<< "$webp_images"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 测试完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
