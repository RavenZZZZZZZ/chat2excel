#!/bin/bash

echo "🔍 检查域名 DNS 解析状态"
echo "================================"
echo ""

DOMAIN="yiruo.chat"

echo "📍 检查 A 记录（根域名）"
echo "命令: dig +short A $DOMAIN"
dig +short A $DOMAIN @8.8.8.8
echo ""

echo "📍 检查 A 记录（www 子域名）"
echo "命令: dig +short A www.$DOMAIN"
dig +short A www.$DOMAIN @8.8.8.8
echo ""

echo "📍 检查 NS 记录（域名服务器）"
echo "命令: dig +short NS $DOMAIN"
dig +short NS $DOMAIN
echo ""

echo "================================"
echo "✅ 检查完成！"
echo ""
echo "预期结果："
echo "  A 记录应该指向: 76.76.21.21"
echo ""
echo "如果显示其他 IP 或没有结果，说明："
echo "  - DNS 还未生效（需要 5 分钟 - 48 小时）"
echo "  - DNS 配置有误，请检查"
echo ""
echo "如果显示正确的 IP，请访问："
echo "  - https://yiruo.chat"
echo "  - https://www.yiruo.chat"
