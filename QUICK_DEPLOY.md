# 快速部署到 Cloudflare（5 分钟）

您的前端已部署到：`smart-vc-bot.pages.dev`

现在只需要部署 CORS 代理 Worker，就能解决所有 CORS 问题！

## 🚀 一键部署 Worker

### 步骤 1: 安装 Wrangler（如果还没安装）

```bash
npm install -g wrangler
```

### 步骤 2: 登录 Cloudflare

```bash
wrangler login
```

浏览器会打开，点击"允许"授权。

### 步骤 3: 部署 Worker

```bash
./deploy-worker.sh
```

或者手动运行：

```bash
wrangler deploy
```

### 步骤 4: 获取 Worker URL

部署成功后，会显示类似：

```
Published ai-bp-cors-proxy
  https://ai-bp-cors-proxy.YOUR-ID.workers.dev
```

**复制这个 URL！**

### 步骤 5: 更新配置

编辑 `src/lib/config.ts`，将第 16 行的 URL 替换为您的 Worker URL：

```typescript
const PRODUCTION_PROXY_URL = 'https://ai-bp-cors-proxy.YOUR-ID.workers.dev';
```

### 步骤 6: 重新构建并推送

```bash
# 构建
npm run build

# 提交
git add .
git commit -m "Update Worker URL for production"
git push
```

Cloudflare Pages 会自动重新部署！

## ✅ 完成

等待 2-3 分钟，Cloudflare Pages 重新部署后，访问：

```
https://smart-vc-bot.pages.dev
```

现在应该可以正常使用了，不会再有 CORS 错误！

## 🔍 验证

1. 访问 https://smart-vc-bot.pages.dev
2. 选择任意 LLM 供应商
3. 输入 API Key
4. 上传文件
5. 开始分析

如果能成功分析，说明一切正常！

## ❓ 如果还有问题

### 检查 Worker 是否运行

```bash
curl https://ai-bp-cors-proxy.YOUR-ID.workers.dev
```

应该返回类似：
```json
{"error":"Method not allowed"}
```

这是正常的，说明 Worker 正在运行。

### 检查配置

确保：
1. `src/lib/config.ts` 中的 PRODUCTION_PROXY_URL 正确
2. 代码已推送到 GitHub
3. Cloudflare Pages 已重新部署（检查 Pages 仪表板）

### 查看日志

在 Cloudflare Dashboard 中：
1. 进入 Workers & Pages
2. 选择 `ai-bp-cors-proxy`
3. 查看 "Logs" 标签

## 💡 提示

- Worker 免费额度：每天 100,000 次请求
- Pages 免费额度：无限请求
- 两者结合使用，个人/小团队完全够用！

部署遇到问题？告诉我具体的错误信息，我来帮您解决！
