# Self-Hosted Runner 部署指南

本指南将帮助你设置 GitHub Actions Self-Hosted Runner 以实现自动部署。

## 🚀 快速开始

### 1. 设置 Self-Hosted Runner

#### 在你的服务器上安装 GitHub Actions Runner

```bash
# 创建 runner 目录
mkdir actions-runner && cd actions-runner

# 下载最新的 runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# 验证哈希（可选）
echo "29fc8cf2dab4c195bb147384e7e2c94cfd4d4022c793b346a6175435265aa278  actions-runner-linux-x64-2.311.0.tar.gz" | shasum -a 256 -c

# 解压
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

#### 配置 Runner

```bash
# 配置 runner
./config.sh --url https://github.com/HNRobert/UNNC-Freshman-Verify-Gateway --token YOUR_REGISTRATION_TOKEN

# 可选：配置为服务
sudo ./svc.sh install
sudo ./svc.sh start
```

**注意：**

- 替换 `YOUR_REGISTRATION_TOKEN` 为你从 GitHub 仓库设置中获取的令牌
- 访问 `Settings > Actions > Runners > New self-hosted runner` 获取令牌

### 2. 安装必要依赖

#### 在 Runner 服务器上安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 添加用户到 docker 组
sudo usermod -aG docker $USER

# 重新登录或运行
newgrp docker
```

#### 安装 Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 验证安装

```bash
docker --version
docker-compose --version
curl --version  # 用于健康检查
```

### 3. 配置 GitHub Secrets

在你的 GitHub 仓库中设置以下 Secrets：

1. 访问 `Settings > Secrets and variables > Actions`
2. 添加以下 Repository secrets：

```env
GITHUB_TOKEN  # 已自动提供，用于访问 GHCR
```

### 4. 部署配置

#### 用户数据目录配置

项目现在支持动态身份验证，需要配置用户数据根目录：

```bash
# 设置环境变量
export UNNC_VERIFY_USER_DATA_ROOT=/path/to/your/user-data

# 或者在 .env 文件中设置
echo "UNNC_VERIFY_USER_DATA_ROOT=/path/to/your/user-data" >> .env
```

#### 用户数据目录结构

用户数据目录应该按以下结构组织：

```text
user-data/
├── cpu/
│   ├── favicon.ico
│   ├── qrcode.jpg
│   └── locales/
│       ├── zh-CN.yml
│       ├── en-US.yml
│       └── en-UK.yml
├── math-club/
│   ├── favicon.ico
│   ├── qrcode.jpg
│   └── locales/
│       ├── zh-CN.yml
│       ├── en-US.yml
│       └── en-UK.yml
└── ...
```

每个身份目录必须包含：

- `favicon.ico` - 网站图标
- `qrcode.jpg` (或其他图片格式) - 群组二维码
- `locales/` - 语言文件目录

#### 端口配置

- **Staging**: `http://localhost:3001`
- **Production**: `http://localhost:3000`

#### Docker Compose 文件

项目包含三个 compose 文件：

- `docker-compose.yml` - 开发环境
- `docker-compose.staging.yml` - 测试环境
- `docker-compose.production.yml` - 生产环境

所有配置文件都会自动挂载 `UNNC_VERIFY_USER_DATA_ROOT` 环境变量指定的目录。

### 5. 手动部署

#### 准备用户数据

在部署前，请准备用户数据目录：

```bash
# 创建用户数据目录
mkdir -p /path/to/user-data

# 为每个身份创建目录结构（以 cpu 为例）
mkdir -p /path/to/user-data/cpu/locales

# 复制必要文件
cp your-favicon.ico /path/to/user-data/cpu/favicon.ico
cp your-qrcode.jpg /path/to/user-data/cpu/qrcode.jpg

# 创建语言文件（参考 user-data-example/cpu/locales/ 中的示例）
# 复制并修改示例文件
```

#### 设置环境变量

```bash
export UNNC_VERIFY_USER_DATA_ROOT=/path/to/user-data
```

#### 使用部署脚本

你也可以使用提供的部署脚本进行手动部署：

```bash
# 部署到测试环境
./scripts/deploy.sh staging

# 部署到生产环境
./scripts/deploy.sh production
```

## 🔧 高级配置

### 自定义域名

修改 `docker-compose.staging.yml` 和 `docker-compose.production.yml` 中的域名：

```yaml
labels:
  - "traefik.http.routers.staging-app.rule=Host(\`staging.unnc-verify.hnrobert.space\`)"
```

### SSL/TLS 配置

如果使用 nginx 和自签名证书：

```bash
# 生成自签名证书
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/nginx.key \
  -out ssl/nginx.crt \
  -subj "/C=CN/ST=Zhejiang/L=Ningbo/O=UNNC/CN=unnc-verify.hnrobert.space"
```

### 环境变量

在 compose 文件中添加环境变量：

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=your_database_url
  - API_KEY=your_api_key
```

### 持久化数据

如果需要持久化数据，添加卷：

```yaml
volumes:
  - ./data:/app/data
  - ./logs:/app/logs
```

## 🔍 监控和日志

### 查看日志

```bash
# 查看应用日志
docker-compose -f docker-compose.production.yml logs -f app

# 查看所有服务日志
docker-compose -f docker-compose.production.yml logs -f

# 查看特定时间的日志
docker-compose -f docker-compose.production.yml logs --since 2h
```

### 健康检查

```bash
# 检查应用健康状态
curl http://localhost:3000/api/health

# 检查容器状态
docker ps
docker-compose -f docker-compose.production.yml ps
```

### 系统监控

```bash
# 查看资源使用情况
docker stats

# 查看磁盘使用
docker system df
```

## 🛠️ 故障排除

### 常见问题

1. **Runner 无法连接到 GitHub**

   ```bash
   # 检查网络连接
   curl -I https://github.com

   # 检查防火墙设置
   sudo ufw status
   ```

2. **Docker 权限问题**

   ```bash
   # 确保用户在 docker 组中
   groups $USER

   # 重启 docker 服务
   sudo systemctl restart docker
   ```

3. **端口冲突**

   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep :3000

   # 修改 compose 文件中的端口映射
   ```

4. **镜像拉取失败**

   ```bash
   # 手动登录 GHCR
   echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

   # 手动拉取镜像
   docker pull ghcr.io/hnrobert/unnc-freshman-verify-gateway:main
   ```

### 清理和维护

```bash
# 清理未使用的镜像
docker image prune -f

# 清理所有未使用的资源
docker system prune -a -f

# 清理日志
sudo journalctl --vacuum-time=7d
```

## 📋 部署检查清单

- [ ] Self-hosted runner 已配置并运行
- [ ] Docker 和 Docker Compose 已安装
- [ ] GitHub Secrets 已配置
- [ ] 防火墙端口已开放（3000, 3001）
- [ ] 域名 DNS 已配置（如果使用）
- [ ] SSL 证书已配置（如果使用 HTTPS）
- [ ] 监控和日志系统已设置
- [ ] 备份策略已制定

## 🔗 相关链接

- [GitHub Actions Self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
