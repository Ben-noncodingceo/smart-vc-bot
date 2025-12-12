#!/bin/bash

# Cloudflare Worker 快速部署脚本

echo "================================"
echo "AI BP CORS Proxy - Worker 部署"
echo "================================"
echo ""

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装"
    echo "正在安装..."
    npm install -g wrangler
    if [ $? -ne 0 ]; then
        echo "❌ 安装失败，请手动运行: npm install -g wrangler"
        exit 1
    fi
    echo "✅ Wrangler CLI 安装成功"
fi

echo ""
echo "📋 检查登录状态..."
wrangler whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "🔐 需要登录 Cloudflare"
    wrangler login
    if [ $? -ne 0 ]; then
        echo "❌ 登录失败"
        exit 1
    fi
fi

echo "✅ 已登录 Cloudflare"
echo ""

echo "🚀 开始部署 Worker..."
wrangler deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "================================"
    echo "✅ Worker 部署成功！"
    echo "================================"
    echo ""
    echo "📝 下一步："
    echo "1. 记下上面显示的 Worker URL"
    echo "2. 编辑 src/lib/config.ts"
    echo "3. 将 PRODUCTION_PROXY_URL 替换为您的 Worker URL"
    echo "4. 运行 npm run build 重新构建前端"
    echo "5. 部署到 Cloudflare Pages"
    echo ""
else
    echo ""
    echo "❌ 部署失败"
    echo "请检查错误信息并重试"
    exit 1
fi
