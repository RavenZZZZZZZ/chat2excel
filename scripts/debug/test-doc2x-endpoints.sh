#!/bin/bash
# 测试不同的Doc2X API端点格式

DOC2X_API_KEY="sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq"
TEST_UID="019b9e54-1b76-752f-98c4-778a7c09baa4"

echo "========================================="
echo "测试不同的Doc2X状态API端点"
echo "========================================="
echo ""
echo "测试UID: $TEST_UID"
echo ""

# 尝试不同的端点格式
endpoints=(
  "https://v2.doc2x.noedgeai.com/api/v2/async/parse/status?uid=$TEST_UID"
  "https://v2.doc2x.noedgeai.com/api/v2/async/parse/status/$TEST_UID"
  "https://v2.doc2x.noedgeai.com/api/v2/async/parse/img/layout/status?uid=$TEST_UID"
  "https://v2.doc2x.noedgeai.com/api/v2/async/parse/img/layout/$TEST_UID"
  "https://v2.doc2x.noedgeai.com/api/v2/async/status?uid=$TEST_UID"
  "https://doc2x.noedgeai.com/api/v2/async/parse/status?uid=$TEST_UID"
)

for endpoint in "${endpoints[@]}"; do
  echo "测试: $endpoint"
  response=$(curl -s "$endpoint" \
    -H "Authorization: Bearer $DOC2X_API_KEY" \
    -w "\nHTTP:%{http_code}")
  
  http_code=$(echo "$response" | grep "HTTP:" | cut -d: -f2)
  body=$(echo "$response" | sed '/HTTP:/d')
  
  echo "  HTTP $http_code"
  if [ -n "$body" ]; then
    echo "  响应: $(echo "$body" | head -c 200)"
  fi
  echo ""
done
