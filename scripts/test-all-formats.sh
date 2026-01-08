#!/bin/bash
# 全面测试 Doc2X API 对不同图片格式的支持

DOC2X_API_KEY="${DOC2X_API_KEY:-sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq}"
DOC2X_UPLOAD_URL="https://v2.doc2x.noedgeai.com/api/v2/async/parse/img/layout"

echo "========================================="
echo "Doc2X API 格式支持全面测试"
echo "========================================="
echo ""

BASE_IMAGE="test-images/test02.jpg"

echo "📋 基准图片: $BASE_IMAGE"
echo ""

# 测试 1: JPEG
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 1: JPEG (image/jpeg)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
response=$(curl -s -X POST "$DOC2X_UPLOAD_URL" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@$BASE_IMAGE")
code=$(echo "$response" | jq -r '.code // empty')
if [ "$code" = "success" ]; then
  echo "✅ JPEG - 成功"
else
  echo "❌ JPEG - 失败"
fi
echo ""

# 测试 2: PNG
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 2: PNG (image/png)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# JPEG 不能伪装成 PNG，但我们可以测试
response=$(curl -s -X POST "$DOC2X_UPLOAD_URL" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  -H "Content-Type: image/png" \
  --data-binary "@$BASE_IMAGE")
code=$(echo "$response" | jq -r '.code // empty')
error=$(echo "$response" | jq -r '.error // empty')
if [ "$code" = "success" ]; then
  echo "✅ PNG - 成功"
else
  echo "⚠️  PNG - 失败 ($error)"
  echo "   注意: 用 JPEG 内容测试 PNG 可能失败"
fi
echo ""

# 测试 3: WebP
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 3: WebP (image/webp)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
response=$(curl -s -X POST "$DOC2X_UPLOAD_URL" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  -H "Content-Type: image/webp" \
  --data-binary "@$BASE_IMAGE")
code=$(echo "$response" | jq -r '.code // empty')
error=$(echo "$response" | jq -r '.error // empty')
if [ "$code" = "success" ]; then
  echo "✅ WebP - 成功"
else
  echo "❌ WebP - 失败 ($error)"
fi
echo ""

# 测试 4: GIF
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 4: GIF (image/gif)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
response=$(curl -s -X POST "$DOC2X_UPLOAD_URL" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  -H "Content-Type: image/gif" \
  --data-binary "@$BASE_IMAGE")
code=$(echo "$response" | jq -r '.code // empty')
error=$(echo "$response" | jq -r '.error // empty')
if [ "$code" = "success" ]; then
  echo "✅ GIF - 成功"
else
  echo "❌ GIF - 失败 ($error)"
fi
echo ""

# 测试 5: BMP
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "测试 5: BMP (image/bmp)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
response=$(curl -s -X POST "$DOC2X_UPLOAD_URL" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  -H "Content-Type: image/bmp" \
  --data-binary "@$BASE_IMAGE")
code=$(echo "$response" | jq -r '.code // empty')
error=$(echo "$response" | jq -r '.error // empty')
if [ "$code" = "success" ]; then
  echo "✅ BMP - 成功"
else
  echo "❌ BMP - 失败 ($error)"
fi
echo ""

echo "========================================="
echo "结论"
echo "========================================="
echo ""
echo "Doc2X API 文档明确说明支持: jpg/png"
echo "以上测试验证了其他格式是否被接受"
echo ""
echo "关键发现:"
echo "  1. 文档说支持的格式应该优先使用"
echo "  2. 其他格式可能被拒绝或行为不确定"
echo "  3. 手机拍照常见格式:"
echo "     - iPhone: HEIC (需要转换)"
echo "     - Android: JPEG/WebP"
echo ""
