#!/bin/bash
# ==============================================================================
# test-doc2x-key.sh - 测试 Doc2X API Key 是否有效
# ==============================================================================

DOC2X_API_KEY="${DOC2X_API_KEY:-sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq}"
DOC2X_API_URL="https://v2.doc2x.noedgeai.com/api/v2/async/parse/img/layout"
TEST_IMAGE="${1:-test02.jpg}"

echo "🔑 Doc2X API Key 测试工具"
echo "======================================"
echo ""

if [ ! -f "$TEST_IMAGE" ]; then
  echo "❌ 错误: 找不到测试图片: $TEST_IMAGE"
  echo ""
  echo "用法: $0 [图片路径]"
  echo "示例: $0 test02.jpg"
  exit 1
fi

echo "📋 测试配置:"
echo "  API URL: $DOC2X_API_URL"
echo "  图片文件: $TEST_IMAGE"
echo "  文件大小: $(ls -lh "$TEST_IMAGE" | awk '{print $5}')"
echo ""

echo "🚀 开始测试..."
echo ""

# 使用 curl 测试 API
response=$(curl -s -X POST "$DOC2X_API_URL" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@$TEST_IMAGE" \
  -w "\nHTTP_STATUS:%{http_code}")

# 提取 HTTP 状态码
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d':' -f2)
response_body=$(echo "$response" | sed '/HTTP_STATUS/d')

echo "📊 响应状态码: $http_status"
echo ""

if [ "$http_status" = "200" ] || [ "$http_status" = "201" ]; then
  echo "✅ API Key 有效！"
  echo ""
  echo "响应内容:"
  echo "$response_body" | jq . 2>/dev/null || echo "$response_body"

elif [ "$http_status" = "401" ]; then
  echo "❌ API Key 无效或已过期 (401 Unauthorized)"
  echo ""
  echo "错误响应:"
  echo "$response_body" | jq . 2>/dev/null || echo "$response_body"
  echo ""
  echo "🔧 解决方案:"
  echo "  1. 登录 Doc2X 控制台"
  echo "  2. 检查 API Key 状态"
  echo "  3. 如需要，重新生成 API Key"
  echo "  4. 更新 Vercel 环境变量"

elif [ "$http_status" = "403" ]; then
  echo "❌ 没有权限访问 API (403 Forbidden)"
  echo ""
  echo "错误响应:"
  echo "$response_body" | jq . 2>/dev/null || echo "$response_body"

else
  echo "⚠️  收到意外响应: $http_status"
  echo ""
  echo "完整响应:"
  echo "$response_body" | jq . 2>/dev/null || echo "$response_body"
fi

echo ""
echo "======================================"
echo "✨ 测试完成"
