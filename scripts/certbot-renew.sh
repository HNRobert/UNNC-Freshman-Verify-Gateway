#!/bin/bash

# SSL 证书自动续期脚本
# 应该通过 cron 定期运行此脚本（建议每天运行一次）

set -e

DOMAIN="unnc-verify.hnrobert.space"
CERTBOT_DIR="./ssl/certbot"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"

echo "🔍 检查 SSL 证书续期..."

# 检查证书是否存在
CERT_PATH="$CERTBOT_DIR/conf/live/$DOMAIN/fullchain.pem"

if [ ! -f "$CERT_PATH" ]; then
    echo "❌ 证书文件不存在: $CERT_PATH"
    echo "请先运行初始证书生成流程"
    exit 1
fi

# 检查证书是否即将过期（30天内）
if openssl x509 -checkend 2592000 -noout -in "$CERT_PATH"; then
    echo "✅ 证书有效期还有超过30天，无需续期"
    
    # 显示证书信息
    echo "📋 当前证书信息:"
    openssl x509 -in "$CERT_PATH" -noout -subject -dates
    exit 0
else
    echo "⚠️ 证书将在30天内过期，开始续期流程..."
fi

# 备份当前证书
BACKUP_DIR="./ssl/backup/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r "$CERTBOT_DIR/conf/live/$DOMAIN" "$BACKUP_DIR/" || true
echo "📦 已备份当前证书到: $BACKUP_DIR"

# 停止 nginx 以释放80端口用于 ACME 挑战
echo "🛑 停止 nginx 服务..."
docker-compose -f "$DOCKER_COMPOSE_FILE" stop nginx || true

# 运行 certbot 续期
echo "🔄 运行 certbot 续期..."
docker run --rm \
    -v $(pwd)/$CERTBOT_DIR/conf:/etc/letsencrypt \
    -v $(pwd)/$CERTBOT_DIR/www:/var/www/certbot \
    -p 80:80 \
    certbot/certbot \
    renew --standalone --quiet

# 检查续期是否成功
if [ -f "$CERT_PATH" ]; then
    # 验证新证书
    if openssl x509 -checkend 2592000 -noout -in "$CERT_PATH"; then
        echo "✅ 证书续期成功!"
        echo "📋 新证书信息:"
        openssl x509 -in "$CERT_PATH" -noout -subject -dates
        
        # 重新启动服务以使用新证书
        echo "🚀 重新启动服务..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
        
        # 等待服务启动
        sleep 10
        
        # 验证 HTTPS 是否正常工作
        if curl -f -k https://localhost:3443/api/health > /dev/null 2>&1; then
            echo "✅ HTTPS 服务正常运行"
            
            # 清理旧的备份（保留最近5个）
            find ./ssl/backup -type d -name "????????-??????" | sort | head -n -5 | xargs rm -rf || true
            
            echo "🎉 证书续期完成!"
        else
            echo "❌ HTTPS 服务验证失败，可能需要手动检查"
            exit 1
        fi
    else
        echo "❌ 新证书验证失败"
        
        # 恢复备份
        echo "🔄 恢复备份证书..."
        cp -r "$BACKUP_DIR/$DOMAIN" "$CERTBOT_DIR/conf/live/" || true
        
        # 重新启动服务
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
        exit 1
    fi
else
    echo "❌ 证书续期失败，证书文件不存在"
    
    # 恢复备份
    echo "🔄 恢复备份证书..."
    cp -r "$BACKUP_DIR/$DOMAIN" "$CERTBOT_DIR/conf/live/" || true
    
    # 重新启动服务
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    exit 1
fi

echo "📧 续期完成，建议检查应用日志确保一切正常"
