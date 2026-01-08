#!/bin/bash
# ==============================================================================
# test-storage-upload.sh - 测试 Supabase Storage 上传功能
# ==============================================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 测试 Supabase Storage 上传功能"
echo "========================================"

# 从 .env.local 加载环境变量
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ 已加载 .env.local${NC}"
else
    echo -e "${RED}❌ 未找到 .env.local 文件${NC}"
    exit 1
fi

# 检查必需的环境变量
echo ""
echo "📋 检查环境变量..."
if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}❌ SUPABASE_URL 未设置${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SUPABASE_URL: $SUPABASE_URL${NC}"

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY 未设置${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:20}...${NC}"

BUCKET_NAME=${SUPABASE_BUCKET_NAME:-ocr-images}
echo -e "${GREEN}✅ SUPABASE_BUCKET_NAME: $BUCKET_NAME${NC}"

# 测试 1: 检查 bucket 是否存在
echo ""
echo "🪣 测试 1: 检查 Bucket 是否存在"
RESPONSE=$(curl -s "$SUPABASE_URL/storage/v1/bucket?limit=100" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY")

echo "响应: $RESPONSE"

# 检查 bucket 是否在列表中
if echo "$RESPONSE" | grep -q "\"id\":\"$BUCKET_NAME\""; then
    echo -e "${GREEN}✅ Bucket '$BUCKET_NAME' 存在${NC}"
else
    echo -e "${RED}❌ Bucket '$BUCKET_NAME' 不存在${NC}"
    echo "可用的 buckets:"
    echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4
fi

# 测试 2: 尝试列出 bucket 内容
echo ""
echo "📂 测试 2: 列出 Bucket 内容"
LIST_RESPONSE=$(curl -s "$SUPABASE_URL/storage/v1/object/list/$BUCKET_NAME" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY")

LIST_STATUS=$(echo "$LIST_RESPONSE" | grep -o '"statusCode":[0-9]*' | cut -d':' -f2)

if [ "$LIST_STATUS" = "200" ] || echo "$LIST_RESPONSE" | grep -q "name"; then
    echo -e "${GREEN}✅ 可以列出 Bucket 内容${NC}"
    echo "文件数量: $(echo "$LIST_RESPONSE" | grep -o '"name"' | wc -l)"
else
    echo -e "${RED}❌ 无法列出 Bucket 内容${NC}"
    echo "响应: $LIST_RESPONSE"
fi

# 测试 3: 尝试上传测试文件
echo ""
echo "📤 测试 3: 上传测试文件"
TEST_FILE="/tmp/test-upload-$(date +%s).txt"
echo "This is a test file uploaded at $(date)" > "$TEST_FILE"

UPLOAD_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/storage/v1/object/$BUCKET_NAME/test-upload.txt" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: text/plain" \
    --data-binary "@$TEST_FILE")

UPLOAD_STATUS=$(echo "$UPLOAD_RESPONSE" | grep -o '"statusCode":[0-9]*' | cut -d':' -f2)

if [ -z "$UPLOAD_STATUS" ] || [ "$UPLOAD_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ 文件上传成功${NC}"

    # 获取公开 URL
    PUBLIC_URL="$SUPABASE_URL/storage/v1/object/public/$BUCKET_NAME/test-upload.txt"
    echo -e "${GREEN}✅ 公开 URL: $PUBLIC_URL${NC}"

    # 清理测试文件
    echo ""
    echo "🧹 清理测试文件..."
    DELETE_RESPONSE=$(curl -s -X DELETE "$SUPABASE_URL/storage/v1/object/$BUCKET_NAME/test-upload.txt" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY")

    echo -e "${GREEN}✅ 测试完成${NC}"
else
    echo -e "${RED}❌ 文件上传失败${NC}"
    echo "响应: $UPLOAD_RESPONSE"

    # 检查是否是权限问题
    if echo "$UPLOAD_RESPONSE" | grep -q "authorization"; then
        echo -e "${YELLOW}⚠️  可能是 API Key 权限不足${NC}"
    fi

    # 检查是否是 bucket 不存在
    if echo "$UPLOAD_RESPONSE" | grep -q "NoSuchBucket"; then
        echo -e "${YELLOW}⚠️  Bucket 不存在，需要创建${NC}"
        echo ""
        echo "创建 Bucket 的 SQL 命令:"
        echo "INSERT INTO storage.buckets (id, name, public)"
        echo "VALUES ('$BUCKET_NAME', '$BUCKET_NAME', true);"
    fi
fi

rm -f "$TEST_FILE"

echo ""
echo "========================================"
echo "🔍 诊断完成"
