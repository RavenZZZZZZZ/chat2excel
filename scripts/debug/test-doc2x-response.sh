#!/bin/bash
# 测试 Doc2X API 响应格式

DOC2X_API_KEY="${DOC2X_API_KEY:-sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq}"
DOC2X_UPLOAD_URL="https://v2.doc2x.noedgeai.com/api/v2/async/parse/img/layout"
DOC2X_STATUS_URL="https://v2.doc2x.noedgeai.com/api/v2/async/parse/status"
TEST_IMAGE="test-images/test02.jpg"

echo "========================================="
echo "测试 Doc2X API 响应格式"
echo "========================================="
echo ""

# 1. 上传图片
echo "📤 步骤 1: 上传图片"
echo "URL: $DOC2X_UPLOAD_URL"
echo ""

UPLOAD_RESPONSE=$(curl -s -X POST "$DOC2X_UPLOAD_URL" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@$TEST_IMAGE")

echo "上传响应:"
echo "$UPLOAD_RESPONSE" | jq . 2>/dev/null || echo "$UPLOAD_RESPONSE"
echo ""

# 提取 UID
TASK_UID=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.uid // .uid // empty' )

if [ "$TASK_UID" = "null" ] || [ "$TASK_UID" = "empty" ] || [ -z "$TASK_UID" ]; then
  echo "❌ 无法提取 UID"
  exit 1
fi

echo "✅ 获取到 UID: $TASK_UID"
echo ""
echo "========================================="
echo ""

# 2. 查询状态
echo "⏳ 步骤 2: 查询状态"
echo "URL: ${DOC2X_STATUS_URL}?uid=${TASK_UID}"
echo ""

STATUS_RESPONSE=$(curl -s "${DOC2X_STATUS_URL}?uid=${TASK_UID}" \
  -H "Authorization: Bearer $DOC2X_API_KEY")

echo "状态响应:"
echo "$STATUS_RESPONSE"
echo ""

echo "========================================="
echo "响应类型检查:"
echo ""

# 检查响应类型
if echo "$STATUS_RESPONSE" | jq . >/dev/null 2>&1; then
  echo "✅ 响应是有效的 JSON"
  echo ""
  echo "解析后的内容:"
  echo "$STATUS_RESPONSE" | jq .
else
  echo "⚠️  响应不是 JSON 格式"
  echo ""
  echo "原始内容 (前 500 字符):"
  echo "$STATUS_RESPONSE" | head -c 500
  echo ""
  echo "响应头:"
  curl -sI "${DOC2X_STATUS_URL}?uid=${UID}" \
    -H "Authorization: Bearer $DOC2X_API_KEY"
fi

echo ""
echo "========================================="
