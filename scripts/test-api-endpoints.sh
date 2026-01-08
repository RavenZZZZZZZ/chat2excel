#!/bin/bash
# ==============================================================================
# test-api-endpoints.sh - 测试所有 API 端点
# ==============================================================================

BASE_URL="https://yiruo.chat"

echo "🔍 测试 Chat2Excel API 端点"
echo "========================================"
echo ""

# 测试列表
declare -a endpoints=(
  "GET|/api/health"
  "POST|/api/ocr/upload"
  "GET|/api/ocr/status?uid=test"
  "GET|/api/tasks"
  "POST|/api/storage/upload"
)

for endpoint in "${endpoints[@]}"; do
  IFS='|' read -r method path <<< "$endpoint"

  echo "📍 测试: $method $path"

  if [ "$method" = "GET" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL$path")
  fi

  if [ "$status" = "200" ] || [ "$status" = "201" ] || [ "$status" = "400" ]; then
    echo "  ✅ 状态码: $status (正常)"
  elif [ "$status" = "404" ]; then
    echo "  ❌ 状态码: $status (路由不存在!)"
  elif [ "$status" = "401" ]; then
    echo "  ⚠️  状态码: $status (认证错误，但路由存在)"
  else
    echo "  ⚠️  状态码: $status"
  fi
  echo ""
done

echo "========================================"
echo "✨ 测试完成"
echo ""
echo "💡 如果看到 404 错误，说明 Vercel 部署可能有问题："
echo "   1. 检查 Vercel Dashboard 中的部署状态"
echo "   2. 查看最新的 Build Logs"
echo "   3. 确认 Route (app) 部分是否包含所有路由"
