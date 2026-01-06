#!/bin/bash
# =============================================================================
// start-servers.sh - 启动所有开发服务器
// =============================================================================
//
// 本脚本启动前端开发服务器和 Doc2X 代理服务器
//
// =============================================================================

cd "$(dirname "$0")"

echo "🚀 启动开发服务器..."
echo ""

# 检查端口占用
if lsof -ti:3001 > /dev/null 2>&1; then
  echo "⚠️  端口 3001 已被占用，停止旧进程..."
  lsof -ti:3001 | xargs kill -9 2>/dev/null
fi

if lsof -ti:5175 > /dev/null 2>&1; then
  echo "⚠️  端口 5175 已被占用，停止旧进程..."
  lsof -ti:5175 | xargs kill -9 2>/dev/null
fi

# 启动代理服务器
echo "📡 启动 Doc2X 代理服务器 (端口 3001)..."
node proxy-server.cjs > proxy-server.log 2>&1 &
PROXY_PID=$!
echo "   PID: $PROXY_PID"

# 等待代理服务器启动
sleep 2

if curl -s http://localhost:3001/health > /dev/null; then
  echo "   ✅ 代理服务器启动成功"
else
  echo "   ❌ 代理服务器启动失败"
  exit 1
fi

# 启动前端开发服务器
echo ""
echo "🌐 启动前端开发服务器 (端口 5175)..."
npm run dev > vite-dev.log 2>&1 &
VITE_PID=$!
echo "   PID: $VITE_PID"

# 等待前端服务器启动
sleep 5

if curl -s http://localhost:5175 > /dev/null; then
  echo "   ✅ 前端服务器启动成功"
else
  echo "   ❌ 前端服务器启动失败"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║        🎉 所有服务器启动成功！                              ║"
echo "║                                                              ║"
echo "║        📍 前端地址: http://localhost:5175                   ║"
echo "║        📍 代理地址: http://localhost:3001                   ║"
echo "║                                                              ║"
echo "║        💡 提示:                                              ║"
echo "║           - 按 Ctrl+C 停止前端服务器                         ║"
echo "║           - 代理服务器会在后台继续运行                       ║"
echo "║           - 停止代理: kill $PROXY_PID                       ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 保存 PID 到文件
echo $PROXY_PID > .proxy-pid
echo $VITE_PID > .vite-pid

echo "已保存进程 PID:"
echo "  - 代理服务器: .proxy-pid"
echo "  - 前端服务器: .vite-pid"
echo ""
