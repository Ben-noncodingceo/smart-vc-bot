# 部署说明

## Cloudflare Pages 部署

### 自动部署

1. 访问 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 连接您的 GitHub 仓库
3. 选择 `smart-vc-bot` 仓库
4. 配置构建设置：
   - **框架预设**: Vite
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
   - **Node 版本**: 18

### 手动部署

如果您想手动部署，可以使用 Cloudflare Pages CLI：

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录到 Cloudflare
wrangler login

# 构建项目
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=ai-bp-analysis-tool
```

## 其他部署选项

### Vercel

1. 访问 [Vercel](https://vercel.com/)
2. 导入您的 GitHub 仓库
3. Vercel 会自动检测 Vite 项目并配置构建设置

### Netlify

1. 访问 [Netlify](https://www.netlify.com/)
2. 连接您的 GitHub 仓库
3. 配置构建设置：
   - **构建命令**: `npm run build`
   - **发布目录**: `dist`

### GitHub Pages

```bash
# 安装 gh-pages
npm install -D gh-pages

# 添加部署脚本到 package.json
# "deploy": "npm run build && gh-pages -d dist"

# 部署
npm run deploy
```

## 环境变量

本项目不需要环境变量，因为所有配置都在前端完成。

## 注意事项

- 确保您的 API Key 安全存储在本地
- 建议在生产环境使用 HTTPS
- 注意大文件上传可能导致浏览器性能问题
- 建议定期更新依赖包以修复安全漏洞

## 自定义域名

在 Cloudflare Pages 设置中，您可以添加自定义域名：

1. 进入项目设置
2. 选择 "Custom domains"
3. 添加您的域名
4. 配置 DNS 记录
