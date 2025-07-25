# GitHub Runner 环境变量设置指南

## 方法 1: 在 systemd 服务中设置环境变量

如果你的 GitHub Actions runner 作为 systemd 服务运行，你可以编辑服务文件：

```bash
sudo systemctl edit github-actions-runner.service
```

添加以下内容：

```ini
[Service]
Environment="UNNC_VERIFY_USER_DATA_ROOT=/home/robert/Documents/UNNC_VERIFY_USER_DATA_ROOT"
```

然后重启服务：

```bash
sudo systemctl daemon-reload
sudo systemctl restart github-actions-runner.service
```

## 方法 2: 在 runner 启动脚本中设置

如果你手动启动 runner，可以在启动前设置环境变量：

```bash
export UNNC_VERIFY_USER_DATA_ROOT=/home/robert/Documents/UNNC_VERIFY_USER_DATA_ROOT
./run.sh
```

## 方法 3: 在 .env 文件中设置

在 runner 目录下创建 `.env` 文件：

```bash
echo "UNNC_VERIFY_USER_DATA_ROOT=/home/robert/Documents/UNNC_VERIFY_USER_DATA_ROOT" > ~/.github-runner/.env
```

## 验证设置

重启 runner 后，可以通过以下 GitHub Actions workflow 验证：

```yaml
- name: Check environment variable
  run: echo "UNNC_VERIFY_USER_DATA_ROOT=$UNNC_VERIFY_USER_DATA_ROOT"
```
