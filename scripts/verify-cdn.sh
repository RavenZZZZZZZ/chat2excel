#!/bin/bash

echo "🔍 验证 CDN 配置"
echo "================================"
echo ""

DOMAIN="yiruo.chat"

echo "📍 检查 DNS 解析（应该显示 CNAME）"
echo "命令: dig +short CNAME $DOMAIN"
dig +short CNAME $DOMAIN
echo ""

echo "📍 检查 CDN 节点"
echo "命令: curl -I https://$DOMAIN"
curl -I https://$DOMAIN 2>&1 | grep -E "Via|X-Cache|Server|CF-Cache-Status"
echo ""

echo "📍 测试 API 端点"
echo "命令: curl https://$DOMAIN/api/health"
curl -s https://$DOMAIN/api/health | head -5
echo ""

echo "================================"
echo "✅ 验证完成！"
echo ""
echo "预期结果："
echo "  DNS 应该显示 CNAME 记录（不是 A 记录）"
echo "  响应头应该包含 'Via: cache...' 或类似内容"
echo "  API 端点应该返回健康状态"
