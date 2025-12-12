# Cloudflare Pages + Workers 部署指南

本指南将帮助您在 Cloudflare 上部署完整的应用，包括前端和 CORS 代理。

## 架构

```
用户浏览器
    ↓
前端应用 (Cloudflare Pages)
    ↓
CORS 代理 (Cloudflare Worker)
    ↓
LLM API (豆包/DeepSeek/OpenAI/通义)
```

## 步骤 1: 部署 Cloudflare Worker（CORS 代理）

### 1.1 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 1.2 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，让您登录 Cloudflare 账户。

### 1.3 部署 Worker

```bash
wrangler deploy
```

部署成功后，您会看到类似输出：

```
Published ai-bp-cors-proxy (1.23 sec)
  https://ai-bp-cors-proxy.your-subdomain.workers.dev
```

**重要：记下这个 URL！**

### 1.4 测试 Worker

```bash
curl -X POST https://ai-bp-cors-proxy.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.deepseek.com/v1/chat/completions",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_API_KEY"
    },
    "body": {
      "model": "deepseek-chat",
      "messages": [{"role": "user", "content": "Hello"}]
    }
  }'
```

如果返回正常响应，说明 Worker 工作正常。

## 步骤 2: 更新前端配置

### 2.1 编辑配置文件

打开 `src/lib/config.ts`，将 Worker URL 替换到配置中：

```typescript
// 替换为您的 Worker URL
const PRODUCTION_PROXY_URL = 'https://ai-bp-cors-proxy.your-subdomain.workers.dev';
```

### 2.2 重新构建前端

```bash
npm run build
```

## 步骤 3: 部署前端到 Cloudflare Pages

### 方法 1: 通过 GitHub 自动部署（推荐）

1. 访问 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 点击 "Create a project"
3. 连接您的 GitHub 账户
4. 选择 `smart-vc-bot` 仓库
5. 配置构建设置：
   - **框架预设**: Vite
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
   - **分支**: `claude/ai-bp-analysis-tool-015jbd1bRUeovhVoZBvE6yWT`（或您的主分支）
6. 点击 "Save and Deploy"

### 方法 2: 使用 Wrangler 直接部署

```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=ai-bp-analysis-tool
```

## 步骤 4: 验证部署

### 4.1 访问应用

部署完成后，Cloudflare 会给您一个 URL，类似：
```
https://ai-bp-analysis-tool.pages.dev
```

### 4.2 测试流程

1. 访问您的应用 URL
2. 选择一个 LLM 供应商
3. 输入 API Key
4. 上传测试文件
5. 开始分析

如果一切正常，分析应该能够成功完成！

## 故障排查

### 问题 1: 仍然出现 CORS 错误

**检查：**
1. Worker 是否成功部署？
   ```bash
   curl https://ai-bp-cors-proxy.your-subdomain.workers.dev
   ```
2. 配置文件中的 PRODUCTION_PROXY_URL 是否正确？
3. 前端是否重新构建并部署？

**解决方案：**
- 重新部署 Worker: `wrangler deploy`
- 确认 Worker URL 正确
- 重新构建并部署前端

### 问题 2: Worker 部署失败

**可能原因：**
- 未登录 Cloudflare: `wrangler login`
- 配置文件错误: 检查 `wrangler.toml`

### 问题 3: API 调用失败

**检查：**
1. API Key 是否正确
2. 网络控制台中的错误信息
3. Worker 日志（在 Cloudflare Dashboard 中查看）

## 自定义域名（可选）

### 为 Pages 设置自定义域名

1. 进入 Cloudflare Pages 项目设置
2. 选择 "Custom domains"
3. 添加您的域名（例如：bp-analysis.yourdomain.com）
4. 按照提示配置 DNS

### 为 Worker 设置自定义域名

1. 进入 Cloudflare Workers 设置
2. 选择 "Triggers" → "Custom Domains"
3. 添加子域名（例如：api.yourdomain.com）
4. 更新 `src/lib/config.ts` 中的 URL

## 环境变量（可选）

如果您想通过环境变量管理配置：

### 在 Cloudflare Pages 中设置

1. 进入项目设置
2. 选择 "Environment variables"
3. 添加变量：
   - `VITE_PROXY_URL`: Worker URL

### 在代码中使用

```typescript
const PRODUCTION_PROXY_URL = import.meta.env.VITE_PROXY_URL ||
  'https://ai-bp-cors-proxy.your-subdomain.workers.dev';
```

## 成本估算

Cloudflare 免费计划包括：
- **Pages**: 500 次构建/月，无限请求
- **Workers**: 100,000 次请求/天

对于个人使用或小规模团队，免费计划完全够用！

## 监控和日志

### 查看 Worker 日志

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Workers & Pages
3. 选择您的 Worker
4. 查看 "Logs" 标签

### 查看 Pages 构建日志

1. 进入 Pages 项目
2. 选择 "Deployments"
3. 点击具体的部署查看日志

## 更新应用

### 更新前端

推送代码到 GitHub，Cloudflare Pages 会自动重新构建和部署。

或手动部署：
```bash
npm run build
wrangler pages deploy dist
```

### 更新 Worker

```bash
# 修改 worker.js 后
wrangler deploy
```

## 安全建议

1. ✅ 使用环境变量存储敏感配置
2. ✅ 定期更新依赖包
3. ✅ 为自定义域名配置 SSL（Cloudflare 自动提供）
4. ✅ 监控 Worker 的使用情况，防止滥用
5. ✅ 考虑添加速率限制（Rate Limiting）

## 需要帮助？

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

## 快速命令参考

```bash
# 部署 Worker
wrangler deploy

# 部署 Pages
npm run build && wrangler pages deploy dist

# 查看 Worker 日志（实时）
wrangler tail

# 查看 Worker 信息
wrangler whoami
```

完成这些步骤后，您的应用就能在 Cloudflare 上完美运行，不再有 CORS 问题！🚀
