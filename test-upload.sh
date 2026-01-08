#!/bin/bash

# 测试 Doc2X API 配置
echo "=== 测试 Doc2X API 配置 ==="
echo ""

# 检查环境变量
if [ -z "$DOC2X_API_KEY" ]; then
  echo "❌ DOC2X_API_KEY 未设置"
  echo "请先设置环境变量："
  echo "export DOC2X_API_KEY=sk-your-key"
  exit 1
fi

echo "✅ DOC2X_API_KEY: ${DOC2X_API_KEY:0:10}..."
echo ""

# 测试 API 连接
API_BASE_URL=${DOC2X_API_BASE_URL:-https://v2.doc2x.noedgeai.com}
echo "📡 API Base URL: $API_BASE_URL"
echo ""

# 创建测试图片（1x1 像素的红色 PNG）
TEST_IMAGE=$(mktemp)
cat > "$TEST_IMAGE" << 'PNG'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==
PNG

echo "📝 测试图片: $TEST_IMAGE"
echo ""

# 发送测试请求
echo "🚀 发送测试请求..."
RESPONSE=$(curl -s -X POST \
  "$API_BASE_URL/api/v2/async/parse/img/layout" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  -H "Content-Type: image/png" \
  --data-binary @"$TEST_IMAGE")

echo "📦 响应:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# 清理
rm -f "$TEST_IMAGE"

echo "=== 测试完成 ==="
