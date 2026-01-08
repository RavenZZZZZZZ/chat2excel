#!/bin/bash

# 域名批量替换脚本
# 将 yiruo.chat 替换为 yiruoai.com

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

OLD_DOMAIN="yiruo.chat"
NEW_DOMAIN="yiruoai.com"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}域名批量替换工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "旧域名: ${YELLOW}${OLD_DOMAIN}${NC}"
echo -e "新域名: ${GREEN}${NEW_DOMAIN}${NC}"
echo ""

# 确认
read -p "确认要替换所有文件中的域名吗？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}已取消${NC}"
    exit 1
fi

# 需要替换的文件列表
FILES=(
    "scripts/test-performance.sh"
    "scripts/diagnose-storage.sh"
    "scripts/test-api-endpoints.sh"
    "scripts/check-deployment.sh"
    "scripts/check-dns.sh"
    "scripts/verify-cdn.sh"
    "docs/DIAGNOSE_403_ERROR.md"
    "docs/ALIYUN_CDN_QUICKSTART.md"
    "docs/ALIYUN_DNS_CONFIG.md"
)

echo -e "\n${BLUE}开始替换...${NC}\n"

# 替换每个文件
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${YELLOW}处理: ${file}${NC}"

        # 创建备份
        cp "$file" "${file}.backup"

        # 执行替换
        sed -i '' "s/${OLD_DOMAIN}/${NEW_DOMAIN}/g" "$file"

        echo -e "  ${GREEN}✓ 已替换${NC}"
        echo -e "  ${GREEN}✓ 备份: ${file}.backup${NC}"
    else
        echo -e "${RED}✗ 文件不存在: ${file}${NC}"
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}替换完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 显示替换统计
echo -e "${BLUE}替换统计：${NC}"
echo "  处理文件数: ${#FILES[@]}"
echo "  旧域名: ${OLD_DOMAIN}"
echo "  新域名: ${NEW_DOMAIN}"
echo ""

# 验证替换结果
echo -e "${BLUE}验证替换结果...${NC}"
echo ""

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        COUNT=$(grep -c "${NEW_DOMAIN}" "$file" || true)
        if [ $COUNT -gt 0 ]; then
            echo -e "${GREEN}✓${NC} ${file}: ${COUNT} 处引用"
        fi
    fi
done

echo ""
echo -e "${YELLOW}备份文件说明：${NC}"
echo "  所有原始文件已备份为 *.backup"
echo "  如需回滚，运行："
echo "  ${GREEN}for f in *.backup; do mv \"\$f\" \"\${f%.backup}\"; done${NC}"
echo ""

echo -e "${YELLOW}后续步骤：${NC}"
echo "  1. 检查替换结果，确保没有遗漏"
echo "  2. 购买新域名: ${NEW_DOMAIN}"
echo "  3. 配置 DNS 指向 Vercel (76.76.21.21)"
echo "  4. 在 Vercel 添加新域名"
echo "  5. 等待 SSL 证书生成"
echo "  6. (可选) 配置阿里云 CDN"
echo "  7. 删除旧域名的 DNS 记录"
echo ""

echo -e "${YELLOW}测试新域名：${NC}"
echo "  bash scripts/test-performance.sh"
echo ""
