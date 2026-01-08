#!/bin/bash
# ==============================================================================
# 部署诊断脚本
# ==============================================================================

echo "🔍 Chat2Excel 部署诊断"
echo "========================"
echo ""

echo "📁 1. 检查关键文件..."
echo ""

files_to_check=(
  "app/page.tsx"
  "public/assets/index-BWKsTMP9.js"
  "public/assets/index-8U-2jKh2.css"
  "vercel.json"
  "next.config.mjs"
)

for file in "${files_to_check[@]}"; do
  if [ -f "$file" ]; then
    size=$(ls -lh "$file" | awk '{print $5}')
    echo "  ✅ $file ($size)"
  else
    echo "  ❌ $file (不存在!)"
  fi
done

echo ""
echo "📦 2. 检查 Git 状态..."
echo ""

echo "本地最新提交:"
git log -1 --oneline

echo ""
echo "远程最新提交:"
git ls-remote --heads origin main | awk '{print $1}'

echo ""
echo "是否一致?"
local_commit=$(git rev-parse HEAD)
remote_commit=$(git ls-remote --heads origin main | awk '{print $1}')
if [ "$local_commit" = "$remote_commit" ]; then
  echo "  ✅ 本地和远程提交一致"
else
  echo "  ❌ 本地和远程提交不一致!"
  echo "     本地: $local_commit"
  echo "     远程: $remote_commit"
fi

echo ""
echo "🔗 3. 测试链接 (请在浏览器中访问)..."
echo ""

cat << 'EOF'
请在浏览器中测试以下链接：

✅ 应该返回 JSON:
  https://yiruo.chat/api/health

✅ 应该返回 JavaScript 文件:
  https://yiruo.chat/assets/index-BWKsTMP9.js

✅ 应该返回 CSS 文件:
  https://yiruo.chat/assets/index-8U-2jKh2.css

✅ 应该返回 HTML 页面:
  https://yiruo.chat/

❓ 如果任何链接失败，请记录错误信息
EOF

echo ""
echo "📋 4. Vercel 部署检查清单..."
echo ""

cat << 'EOF'
请在 Vercel Dashboard 中检查：

1. 项目设置
   - 访问: https://vercel.com/dashboard
   - 找到 chat2excel 项目
   - 检查 "Framework Preset" 是否为 "Next.js"

2. 最新部署
   - 查看最新 deployment 状态
   - 点击查看详细日志
   - 检查是否有错误信息

3. 构建日志
   - 查找 "Route (app)" 部分
   - 确认是否有 "/" 路由
   - 检查是否有编译错误

4. 环境变量
   - 确认 SUPABASE_URL 已配置
   - 确认 SUPABASE_SERVICE_ROLE_KEY 已配置
   - 确认 DOC2X_API_KEY 已配置
EOF

echo ""
echo "🎯 5. 快速修复建议..."
echo ""

cat << 'EOF'
如果部署失败，尝试：

1. 在 Vercel 中手动触发重新部署
   - 点击 "Redeploy" 按钮

2. 清除 Vercel 缓存
   - Settings → Git → Ignored Build Step
   - 设置为空（如果有值的话）

3. 检查 Vercel 项目设置
   - Root Directory: 应该为空或 "./"
   - Build Command: npm run build
   - Output Directory: .next

4. 查看 Vercel Functions 列表
   - 确认 "/" 路由是否存在
EOF

echo ""
echo "========================"
echo "✨ 诊断完成！"
echo ""
echo "请将以上信息和支持你收集到的浏览器控制台信息、"
echo "Vercel 部署日志一起反馈。"
echo ""
