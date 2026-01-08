#!/bin/bash
# 测试 Doc2X API 对不同 JPEG 格式的支持

DOC2X_API_KEY="${DOC2X_API_KEY:-sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq}"
DOC2X_UPLOAD_URL="https://v2.doc2x.noedgeai.com/api/v2/async/parse/img/layout"
DOC2X_STATUS_URL="https://v2.doc2x.noedgeai.com/api/v2/parse/img/layout/status"

# 使用现有测试图片
TEST_JPG="test-images/test02.jpg"

echo "========================================="
echo "测试 Doc2X API 对 JPEG 格式的支持"
echo "========================================="
echo ""

# 如果有 test.jpeg 文件就用它，否则复制 test.jpg
if [ ! -f "test-images/test.jpeg" ]; then
  echo "📋 创建 test.jpeg 文件..."
  cp "$TEST_JPG" "test-images/test.jpeg"
fi

echo "✅ 测试文件准备完成"
ls -lh test-images/test.* | grep -E "\.(jpg|jpeg)$"
echo ""

# 测试 1: 上传 .jpg 文件
echo "📤 测试 1: 上传 test.jpg"
echo ""
response_jpg=$(curl -s -X POST "$DOC2X_UPLOAD_URL" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@test-images/test02.jpg")

uid_jpg=$(echo "$response_jpg" | jq -r '.data.uid')
echo "响应: $response_jpg"
echo ""
echo "✅ UID: $uid_jpg"
echo ""

# 等待一下
sleep 3

# 测试 2: 上传 .jpeg 文件  
echo "📤 测试 2: 上传 test.jpeg"
echo ""
response_jpeg=$(curl -s -X POST "$DOC2X_UPLOAD_URL" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@test-images/test.jpeg")

uid_jpeg=$(echo "$response_jpeg" | jq -r '.data.uid')
echo "响应: $response_jpeg"
echo ""
echo "✅ UID: $uid_jpeg"
echo ""

echo "========================================="
echo "结论:"
echo ""

if [ -n "$uid_jpg" ] && [ "$uid_jpg" != "null" ]; then
  echo "✅ .jpg 格式 - Doc2X API 接受"
else
  echo "❌ .jpg 格式 - Doc2X API 拒绝"
fi

if [ -n "$uid_jpeg" ] && [ "$uid_jpeg" != "null" ]; then
  echo "✅ .jpeg 格式 - Doc2X API 接受"
else
  echo "❌ .jpeg 格式 - Doc2X API 拒绝"
fi

echo ""
echo "注意: 两个文件使用相同的 Content-Type: image/jpeg"
echo "      这是浏览器对两种扩展名都返回的标准 MIME 类型"
echo ""
