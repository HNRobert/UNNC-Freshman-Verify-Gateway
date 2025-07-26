#!/bin/bash

# 部署检查脚本
# 用于验证 SSL 证书和服务状态

set -e

DOMAIN="unnc-verify.hnrobert.space"

echo "🔍 开始部署验证..."

# 检查 SSL 证书文件
echo "📜 检查 SSL 证书文件..."
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ]; then
    echo "✅ Let's Encrypt SSL 证书文件存在"
    
    # 验证证书格式
    if openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -text > /dev/null 2>&1; then
        echo "✅ SSL 证书格式正确"
        
        # 显示证书信息
        echo "📋 证书信息:"
        openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -subject -dates
    else
        echo "❌ SSL 证书格式错误"
        exit 1
    fi
    
    # 验证私钥格式
    if openssl rsa -in /etc/letsencrypt/live/$DOMAIN/privkey.pem -noout > /dev/null 2>&1; then
        echo "✅ SSL 私钥格式正确"
    else
        echo "❌ SSL 私钥格式错误"
        exit 1
    fi
    
    # 验证证书和私钥匹配
    CERT_MODULUS=$(openssl x509 -noout -modulus -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem | openssl md5)
    KEY_MODULUS=$(openssl rsa -noout -modulus -in /etc/letsencrypt/live/$DOMAIN/privkey.pem | openssl md5)
    
    if [ "$CERT_MODULUS" = "$KEY_MODULUS" ]; then
        echo "✅ 证书和私钥匹配"
    else
        echo "❌ 证书和私钥不匹配"
        exit 1
    fi
else
    echo "⚠️ Let's Encrypt SSL 证书文件不存在，请先运行 certbot 获取证书"
fi

# 检查用户数据目录
echo "📁 检查用户数据目录..."
if [ -n "$UNNC_VERIFY_USER_DATA_ROOT" ]; then
    if [ -d "$UNNC_VERIFY_USER_DATA_ROOT" ]; then
        echo "✅ 用户数据目录存在: $UNNC_VERIFY_USER_DATA_ROOT"
        echo "📋 目录内容:"
        ls -la "$UNNC_VERIFY_USER_DATA_ROOT" | head -10
    else
        echo "❌ 用户数据目录不存在: $UNNC_VERIFY_USER_DATA_ROOT"
        exit 1
    fi
else
    echo "❌ UNNC_VERIFY_USER_DATA_ROOT 环境变量未设置"
    exit 1
fi

# 检查 Docker 镜像
echo "🐳 检查 Docker 镜像..."
if [ "$1" = "staging" ]; then
    IMAGE_TAG="develop"
    PORT="3000"
    HTTPS_PORT="3443"
elif [ "$1" = "production" ]; then
    IMAGE_TAG="main"
    PORT="3000"
    HTTPS_PORT="3443"
else
    echo "❌ 请指定环境: staging 或 production"
    echo "用法: $0 [staging|production]"
    exit 1
fi

IMAGE_NAME="ghcr.io/hnrobert/unnc-freshman-verify-gateway:$IMAGE_TAG"

if docker image inspect "$IMAGE_NAME" > /dev/null 2>&1; then
    echo "✅ Docker 镜像存在: $IMAGE_NAME"
else
    echo "⚠️ Docker 镜像不存在，尝试拉取..."
    docker pull "$IMAGE_NAME"
fi

echo "🚀 准备启动服务..."

# 启动服务
if [ "$1" = "staging" ]; then
    docker-compose -f docker-compose.staging.yml up -d
elif [ "$1" = "production" ]; then
    docker-compose -f docker-compose.production.yml up -d
fi

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 15

# 健康检查
echo "🔍 执行健康检查..."

# 设置正确的端口
if [ "$1" = "staging" ]; then
    HTTP_PORT="3000"
    HTTPS_PORT="3443"
elif [ "$1" = "production" ]; then
    HTTP_PORT="3000"
    HTTPS_PORT="3443"
fi

# HTTP 健康检查
if curl -f "http://localhost:$HTTP_PORT/api/health" > /dev/null 2>&1; then
    echo "✅ HTTP 健康检查通过"
else
    echo "❌ HTTP 健康检查失败"
    exit 1
fi

# HTTPS 健康检查
if [ "$1" = "production" ] && [ -f "/etc/letsencrypt/live/unnc-verify.hnrobert.space/fullchain.pem" ]; then
    # 生产环境使用 Let's Encrypt 证书
    if curl -k -f "https://localhost:$HTTPS_PORT/api/health" > /dev/null 2>&1; then
        echo "✅ HTTPS 健康检查通过 (Let's Encrypt)"
    else
        echo "⚠️ HTTPS 健康检查失败，但会继续部署"
    fi
else
    echo "⚠️ Let's Encrypt 证书不存在，跳过 HTTPS 健康检查"
        echo "⚠️ HTTPS 健康检查失败，但会继续部署"
    fi
fi

# 检查可用身份
echo "🔍 检查可用身份..."
if curl -s "http://localhost:$HTTP_PORT/api/identities" | jq '.' > /dev/null 2>&1; then
    echo "✅ API 响应正常"
    echo "📋 可用身份:"
    curl -s "http://localhost:$HTTP_PORT/api/identities" | jq '.identities[]' || echo "No identities found"
else
    echo "⚠️ 无法获取身份列表，但基本服务正常"
fi

echo "🎉 部署验证完成！"
echo "🌐 服务访问地址:"
echo "  - HTTP:  http://localhost:$HTTP_PORT"
if [ -f "/etc/letsencrypt/live/unnc-verify.hnrobert.space/fullchain.pem" ]; then
    echo "  - HTTPS: https://localhost:$HTTPS_PORT"
fi
