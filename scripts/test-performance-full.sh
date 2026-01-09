#!/bin/bash

# Chat2Excel 完整性能测试脚本
# 测试前端加载和 API 调用的完整延迟

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          Chat2Excel 完整性能测试 - 端到端延迟分析              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试 URL
BASE_URL="https://yiruoai.com"
API_URL="$BASE_URL/api"

# 格式化时间（毫秒）
format_ms() {
    local ms=$1
    if (( $(echo "$ms < 1" | bc -l) )); then
        echo "$(echo "$ms * 1000" | bc)ms"
    else
        echo "${ms}s"
    fi
}

# 测试 1：DNS 解析时间
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}测试 1: DNS 解析时间${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

DNS_TIME=$(curl -w "%{time_namelookup}" -o /dev/null -s "$BASE_URL")
echo "DNS 解析耗时: $(format_ms $DNS_TIME)"
echo ""

# 测试 2：TCP 连接时间
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}测试 2: TCP 连接时间${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

TCP_TIME=$(curl -w "%{time_connect}" -o /dev/null -s "$BASE_URL")
CONNECT_TIME=$(echo "$TCP_TIME - $DNS_TIME" | bc)
echo "TCP 连接耗时: $(format_ms $CONNECT_TIME)"
echo ""

# 测试 3：TLS 握手时间
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}测试 3: TLS/SSL 握手时间${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

START_TRANSFER_TIME=$(curl -w "%{time_starttransfer}" -o /dev/null -s "$BASE_URL")
TLS_TIME=$(echo "$START_TRANSFER_TIME - $TCP_TIME" | bc)
echo "TLS 握手耗时: $(format_ms $TLS_TIME)"
echo ""

# 测试 4：首字节时间 (TTFB)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}测试 4: 首字节时间 (TTFB)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

TTFB=$START_TRANSFER_TIME
echo "TTFB (Time To First Byte): $(format_ms $TTFB)"
echo ""

# 测试 5：完整页面加载时间
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}测试 5: 完整页面加载时间${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

TOTAL_TIME=$(curl -w "%{time_total}" -o /dev/null -s "$BASE_URL")
echo "页面完整加载: $(format_ms $TOTAL_TIME)"
echo ""

# 测试 6：静态资源加载（HTML 大小）
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}测试 6: HTML 文档大小${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

HTML_SIZE=$(curl -s -o /dev/null -w "%{size_download}" "$BASE_URL")
echo "HTML 大小: $(echo "scale=2; $HTML_SIZE / 1024" | bc) KB"
echo ""

# 测试 7：API 健康检查
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}测试 7: API 健康检查${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_namelookup}\n%{time_connect}\n%{time_starttransfer}\n%{time_total}" "$API_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 5 | head -n 1)
API_DNS=$(echo "$HEALTH_RESPONSE" | tail -n 4 | head -n 1)
API_CONNECT=$(echo "$HEALTH_RESPONSE" | tail -n 3 | head -n 1)
API_TTFB=$(echo "$HEALTH_RESPONSE" | tail -n 2 | head -n 1)
API_TOTAL=$(echo "$HEALTH_RESPONSE" | tail -n 1 | head -n 1)

echo "HTTP 状态码: $HTTP_CODE"
echo "DNS 解析: $(format_ms $API_DNS)"
echo "连接建立: $(format_ms $API_CONNECT)"
echo "TTFB: $(format_ms $API_TTFB)"
echo "总耗时: $(format_ms $API_TOTAL)"
echo ""

# 测试 8：响应头信息
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}测试 8: Vercel 响应头分析${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

VERCEL_ID=$(curl -s -I "$API_URL/health" | grep -i "x-vercel-id" | cut -d' ' -f2-)
VERCEL_CACHE=$(curl -s -I "$API_URL/health" | grep -i "x-vercel-cache" | cut -d' ' -f2-)
SERVER=$(curl -s -I "$API_URL/health" | grep -i "server" | cut -d' ' -f2-)

echo "Server: $SERVER"
echo "Vercel Cache: $VERCEL_CACHE"
echo "Vercel ID: $VERCEL_ID"
echo ""

# 解析 Vercel ID
if [[ ! -z "$VERCEL_ID" ]]; then
    EDGE_NODE=$(echo "$VERCEL_ID" | cut -d':' -f1)
    REGION=$(echo "$VERCEL_ID" | cut -d':' -f2)
    REQUEST_ID=$(echo "$VERCEL_ID" | cut -d':' -f3)

    echo "边缘节点: $EDGE_NODE"
    echo "执行区域: $REGION"
    echo "请求 ID: $REQUEST_ID"

    # 判断区域
    if [[ "$REGION" == "hkg1" ]]; then
        echo -e "${GREEN}✅ Functions 运行在香港 (hkg1)${NC}"
    elif [[ "$REGION" == "iad1" ]]; then
        echo -e "${RED}❌ Functions 运行在美东 (iad1)${NC}"
    else
        echo -e "${YELLOW}⚠️  Functions 运行在: $REGION${NC}"
    fi
fi
echo ""

# 测试 9：多次请求的平均延迟
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}测试 9: API 多次请求平均延迟 (5次)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

TOTAL=0
for i in {1..5}; do
    TIME=$(curl -w "%{time_total}" -o /dev/null -s "$API_URL/health")
    TOTAL=$(echo "$TOTAL + $TIME" | bc)
    echo "  请求 $i: $(format_ms $TIME)"
done

AVG=$(echo "scale=3; $TOTAL / 5" | bc)
echo -e "${GREEN}平均延迟: $(format_ms $AVG)${NC}"
echo ""

# 性能评估
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}性能评估${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 评估前端加载
if (( $(echo "$TOTAL_TIME < 1.0" | bc -l) )); then
    echo -e "前端加载: ${GREEN}优秀${NC} (< 1秒)"
elif (( $(echo "$TOTAL_TIME < 2.0" | bc -l) )); then
    echo -e "前端加载: ${YELLOW}良好${NC} (< 2秒)"
else
    echo -e "前端加载: ${RED}需要优化${NC} (> 2秒)"
fi

# 评估 API 响应
if (( $(echo "$AVG < 0.5" | bc -l) )); then
    echo -e "API 响应: ${GREEN}优秀${NC} (< 500ms)"
elif (( $(echo "$AVG < 1.0" | bc -l) )); then
    echo -e "API 响应: ${YELLOW}良好${NC} (< 1秒)"
else
    echo -e "API 响应: ${RED}需要优化${NC} (> 1秒)"
fi

# 评估 TTFB
if (( $(echo "$TTFB < 0.5" | bc -l) )); then
    echo -e "TTFB: ${GREEN}优秀${NC} (< 500ms)"
elif (( $(echo "$TTFB < 1.0" | bc -l) )); then
    echo -e "TTFB: ${YELLOW}良好${NC} (< 1秒)"
else
    echo -e "TTFB: ${RED}需要优化${NC} (> 1秒)"
fi
echo ""

# 总结
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}测试总结${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "前端完整加载: $(format_ms $TOTAL_TIME)"
echo "API 平均响应: $(format_ms $AVG)"
echo "DNS 解析: $(format_ms $DNS_TIME)"
echo "TTFB: $(format_ms $TTFB)"
echo ""

# 对比美东区域（假设数据）
echo "与美东区域对比（估算）:"
echo "  前端加载: 美东 ~2-3秒 → 香港 $(format_ms $TOTAL_TIME) ${GREEN}↑ 提升$(echo "scale=1; (3 - $TOTAL_TIME) / 3 * 100" | bc)%${NC}"
echo "  API 响应: 美东 ~14秒 → 香港 $(format_ms $AVG) ${GREEN}↑ 提升$(echo "scale=1; (14 - $AVG) / 14 * 100" | bc)%${NC}"
echo ""

echo -e "${GREEN}✅ 测试完成！${NC}"
echo ""
