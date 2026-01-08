#!/bin/bash
# ==============================================================================
# test-api-upload.sh - 测试本地 API 上传功能
# ==============================================================================

echo "🧪 测试本地 /api/storage/upload 端点"
echo "========================================"

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 5

# 创建测试图片
TEST_FILE="/tmp/test-image-upload.jpg"
echo "这是一个测试图片文件" > "$TEST_FILE"

echo ""
echo "📤 测试上传文件..."
curl -X POST http://localhost:3000/api/storage/upload \
    -F "file=@$TEST_FILE" \
    -v

echo ""
echo "========================================"
echo "🔍 测试完成"

rm -f "$TEST_FILE"
