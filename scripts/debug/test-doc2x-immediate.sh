#!/bin/bash
# 测试 Doc2X API - 上传后立即查询状态

DOC2X_API_KEY="${DOC2X_API_KEY:-sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq}"
DOC2X_UPLOAD_URL="https://v2.doc2x.noedgeai.com/api/v2/async/parse/img/layout"
DOC2X_STATUS_URL="https://v2.doc2x.noedgeai.com/api/v2/parse/img/layout/status"
TEST_IMAGE="test-images/test02.jpg"

echo "========================================="
echo "测试 Doc2X API - 连续轮询测试"
echo "========================================="
echo ""

# 1. 上传图片
echo "📤 步骤 1: 上传图片"
UPLOAD_RESPONSE=$(curl -s -X POST "$DOC2X_UPLOAD_URL" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@$TEST_IMAGE")

echo "上传响应:"
echo "$UPLOAD_RESPONSE" | jq .
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

# 2. 立即查询状态
echo "⏳ 步骤 2: 立即查询状态 (第1次)"
for i in {1..10}; do
  echo ""
  echo "----- 第 $i 次查询 -----"

  STATUS_RESPONSE=$(curl -s "${DOC2X_STATUS_URL}?uid=${TASK_UID}" \
    -H "Authorization: Bearer $DOC2X_API_KEY" \
    -w "\n---HTTP_CODE:%{http_code}---")

  # 分离响应体和状态码
  HTTP_CODE=$(echo "$STATUS_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
  BODY=$(echo "$STATUS_RESPONSE" | sed '/HTTP_CODE:/d')

  echo "HTTP Status: $HTTP_CODE"
  echo "响应内容:"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

  # 检查是否完成
  if echo "$BODY" | jq -e '.data.status == "success"' >/dev/null 2>&1; then
    echo ""
    echo "✅ 处理完成!"
    echo "$BODY" | jq .
    break
  fi

  # 如果不是404也不是processing,停止
  if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "404" ]; then
    echo "⚠️  异常状态码: $HTTP_CODE"
    break
  fi

  if [ $i -lt 10 ]; then
    sleep 3
  fi
done

echo ""
echo "========================================="
