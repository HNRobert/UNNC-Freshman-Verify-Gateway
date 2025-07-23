# 微信群二维码验证系统

这是一个基于 Next.js 和 Tailwind CSS 的微信群二维码验证系统，用于 UNNC 计算机爱好者协会（CPU）招新群的身份验证。

## 功能特性

- 🔐 身份验证：通过身份证号和姓名验证录取状态
- 📱 响应式设计：支持移动端和桌面端
- 🎨 现代化 UI：使用 Tailwind CSS 构建的美观界面
- ⚡ 快速加载：基于 Next.js 的优化性能
- 🔒 安全性：前端验证，不存储个人信息

## 技术栈

- **框架**: Next.js 15.4.3
- **语言**: TypeScript
- **样式**: Tailwind CSS 4.x
- **图标**: Heroicons
- **HTTP 客户端**: Axios
- **包管理器**: pnpm

## 开发环境设置

### 前置要求

- Node.js 18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
pnpm build
```

### 运行生产版本

```bash
pnpm start
```

## 项目结构

```txt
src/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx           # 验证页面
│   ├── show/
│   │   └── page.tsx       # 二维码展示页面
│   └── globals.css        # 全局样式
└── public/
    └── qrcode.jpg         # 微信群二维码图片
```

## 使用说明

1. 用户访问主页，输入身份证号和姓名
2. 系统向 entry.nottingham.edu.cn 查询录取状态
3. 验证通过后跳转到二维码展示页面
4. 用户可以扫描二维码加入微信群

## 配置

### 基本配置

在 `src/app/page.tsx` 中可以修改以下配置：

- `codeName`: 群名称
- `unableToVerifyMessage`: 无法验证时的提示信息

### 多语言配置

本项目使用 YAML 格式的多语言文件，位于 `src/locales/` 目录：

- `zh-CN.yml`: 中文语言包
- `en-US.yml`: 英语（美国）语言包
- `en-UK.yml`: 英语（英国）语言包

每个 YAML 文件包含以下主要部分：

- `metadata`: 页面元数据（标题、描述）
- `common`: 通用文本（按钮、状态等）
- `verify`: 验证页面相关文本
- `qrcode`: 二维码页面相关文本
- `validation`: 表单验证相关文本

修改这些文件可以自定义界面文本内容。

### 动态元数据

项目支持根据用户选择的语言动态更新页面元数据：

- **页面标题**: 会根据当前选择的语言自动更新
- **页面描述**: description meta 标签会相应更改
- **SEO 标签**: 自动更新 Open Graph 和 Twitter Card 标签
- **语言属性**: HTML lang 属性会随语言切换而更新

这确保了搜索引擎和社交媒体分享时显示正确的多语言信息。

## 部署

本项目可以部署到任何支持 Next.js 的平台，如 Vercel、Netlify 等。

```bash
# 构建
pnpm build

# 启动
pnpm start
```

## 许可证

©2025 Computer Psycho Union, UNNC 宁诺计算机爱好者协会 All rights reserved.

## 贡献

欢迎提交 Issue 和 Pull Request。

## 联系方式

如有问题，请联系：<hnrobert@qq.com>
