#!/bin/bash
# ==============================================================================
# production-test.sh - 生产环境测试脚本
# ==============================================================================

echo "🧪 测试生产环境 /api/storage/upload 端点"
echo "========================================"

# 从环境变量或参数获取 API URL
API_URL="${1:-https://yiruo.chat}"

echo "📡 API URL: $API_URL"
echo ""

# 1. 测试健康检查
echo "1️⃣ 测试健康检查端点..."
curl -s "$API_URL/api/health" | python3 -m json.tool || echo "❌ Health check failed"
echo ""

# 2. 测试 Supabase 连接
echo "2️⃣ 测试 Supabase 连接..."
curl -s "$API_URL/api/debug/test-supabase" | python3 -m json.tool || echo "❌ Supabase test failed"
echo ""

# 3. 测试 Storage 上传（使用真实图片）
echo "3️⃣ 测试 Storage 上传..."

# 创建测试图片
TEST_FILE="/tmp/test-upload-$(date +%s).jpg"
echo "This is a test image file for debugging" > "$TEST_FILE"

echo "📤 上传文件: $TEST_FILE"
RESPONSE=$(curl -s -X POST "$API_URL/api/storage/upload" \
  -F "file=@$TEST_FILE" \
  -v 2>&1)

echo "📋 响应:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

# 清理
rm -f "$TEST_FILE"

echo ""
echo "========================================"
echo "✅ 测试完成"
echo ""
echo "💡 如果看到 500 错误，请检查 Vercel Dashboard 中的详细日志："
echo "   https://vercel.com/dashboard"
