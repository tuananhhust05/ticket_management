#!/bin/bash

echo "🚀 启动票务管理系统..."
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 构建并启动服务
echo "📦 构建 Docker 镜像..."
docker-compose build

echo ""
echo "🚀 启动服务..."
docker-compose up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 5

echo ""
echo "✅ 服务已启动！"
echo ""
echo "📱 前端: http://localhost:3000/tickets-manager/"
echo "🔌 API: https://forskale.com/tickets-manager/api/"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"


