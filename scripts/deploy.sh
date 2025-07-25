#!/bin/bash

# Build and run the application locally
set -e

echo "🚀 Building Docker image..."
docker build -t unnc-freshman-verify-gateway .

echo "📦 Starting application with docker-compose..."
docker-compose up -d

echo "🔍 Checking application health..."
sleep 10

# Wait for the application to be healthy
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    else
        echo "⏳ Waiting for application to start... ($i/30)"
        sleep 2
    fi
done

#!/bin/bash

# 自动部署脚本
# 使用方法: ./deploy.sh [staging|production]

set -e

ENV=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Colour

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境参数
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
    log_error "Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

log_info "开始部署到 $ENV 环境..."

cd "$PROJECT_ROOT"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker first."
    exit 1
fi

# 检查 docker-compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    log_error "docker-compose is not installed. Please install it first."
    exit 1
fi

# 选择对应的 compose 文件
COMPOSE_FILE="docker-compose.${ENV}.yml"

if [[ ! -f "$COMPOSE_FILE" ]]; then
    log_error "Compose file $COMPOSE_FILE not found!"
    exit 1
fi

log_info "使用配置文件: $COMPOSE_FILE"

# 如果提供了 GitHub token，则登录
if [[ -n "$GITHUB_TOKEN" ]]; then
    log_info "登录到 GitHub Container Registry..."
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u "${GITHUB_ACTOR:-github}" --password-stdin
fi

# 拉取最新镜像
if [[ "$ENV" == "staging" ]]; then
    IMAGE_TAG="develop"
    PORT="3001"
else
    IMAGE_TAG="main"
    PORT="3000"
fi

log_info "拉取最新镜像: ghcr.io/hnrobert/unnc-freshman-verify-gateway:$IMAGE_TAG"
docker pull "ghcr.io/hnrobert/unnc-freshman-verify-gateway:$IMAGE_TAG" || {
    log_warning "无法拉取远程镜像，将使用本地镜像"
}

# 备份当前版本（仅生产环境）
if [[ "$ENV" == "production" ]] && docker ps | grep -q production-app; then
    log_info "创建生产环境备份..."
    BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"
    docker tag "ghcr.io/hnrobert/unnc-freshman-verify-gateway:main" 
               "ghcr.io/hnrobert/unnc-freshman-verify-gateway:$BACKUP_TAG" || true
    log_success "备份已创建: $BACKUP_TAG"
fi

# 停止现有服务
log_info "停止现有 $ENV 服务..."
docker-compose -f "$COMPOSE_FILE" down || true

# 启动新服务
log_info "启动新的 $ENV 服务..."
docker-compose -f "$COMPOSE_FILE" up -d

# 等待服务启动
log_info "等待服务启动..."
sleep 15

# 健康检查
log_info "执行健康检查..."
HEALTH_URL="http://localhost:$PORT/api/health"

if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
    log_success "✅ $ENV 部署成功!"
    log_success "🌐 应用正在 http://localhost:$PORT 运行"
    
    # 显示服务状态
    log_info "服务状态:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    # 清理旧镜像（保留最近5个版本）
    log_info "清理旧镜像..."
    docker image prune -f
    
else
    log_error "❌ 健康检查失败，部署可能存在问题"
    log_info "查看服务日志:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
    
    if [[ "$ENV" == "production" ]]; then
        log_warning "🔄 生产环境部署失败，考虑手动回滚"
        # 这里可以添加自动回滚逻辑
    fi
    
    exit 1
fi

log_success "🎉 $ENV 环境部署完成!"
