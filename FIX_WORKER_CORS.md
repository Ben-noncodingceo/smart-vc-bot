# 🚨 修复 Worker CORS 问题

## 问题

Worker 返回 CORS 错误：
```
No 'Access-Control-Allow-Origin' header is present
```

这说明 Worker 没有正确部署或配置。

## ✅ 解决方案：重新部署 Worker

### 步骤 1: 安装 Wrangler（如果还没装）

```bash
npm install -g wrangler
```

### 步骤 2: 登录 Cloudflare

```bash
wrangler login
```

### 步骤 3: 部署 Worker

```bash
wrangler deploy
```

**重要：确保在项目根目录运行此命令！**

### 步骤 4: 验证部署

部署成功后，会显示：
```
Published ai-bp-cors-proxy
  https://ai-bp-cors-proxy.YOUR-ID.workers.dev
```

### 步骤 5: 测试 Worker

```bash
curl -X OPTIONS https://smart-vc-bot.peungsun.workers.dev
```

应该看到 CORS 头（如果看到空响应也是正常的）。

测试完整请求：
```bash
curl -X POST https://smart-vc-bot.peungsun.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"url":"https://httpbin.org/post","headers":{},"body":{"test":"data"}}'
```

应该返回 JSON 响应。

## 🔍 检查清单

### 1. 确认 wrangler.toml 配置

检查 `wrangler.toml` 文件：

```toml
name = "ai-bp-cors-proxy"
main = "worker.js"
compatibility_date = "2024-12-01"
```

### 2. 确认 worker.js 存在

确保项目根目录有 `worker.js` 文件。

### 3. 确认部署到正确的 Worker

运行 `wrangler deploy` 后，记下实际的 Worker URL。

**如果 URL 不是 `smart-vc-bot.peungsun.workers.dev`：**

需要更新 `src/lib/config.ts` 中的 PRODUCTION_PROXY_URL。

## 💡 快速修复（如果上面的步骤复杂）

### 方案 A: 使用现有的 Worker（如果已部署）

如果您之前已经部署过 Worker，但 URL 不同：

1. 运行 `wrangler deployments list` 查看已部署的 Worker
2. 找到实际的 Worker URL
3. 更新 `src/lib/config.ts`：
   ```typescript
   const PRODUCTION_PROXY_URL = 'https://YOUR-ACTUAL-WORKER.workers.dev';
   ```

### 方案 B: 临时禁用代理（测试前端）

暂时禁用代理，先确保前端部署正常：

编辑 `src/lib/config.ts`：
```typescript
export const USE_PROXY = false;
```

然后重新构建并推送。这样可以先测试前端功能。

## 🎯 推荐的完整流程

### 在您的本地电脑上：

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录
wrangler login

# 3. 进入项目目录
cd /path/to/smart-vc-bot

# 4. 部署 Worker
wrangler deploy

# 5. 记录返回的 Worker URL

# 6. 如果 URL 不同，更新配置
# 编辑 src/lib/config.ts 修改 PRODUCTION_PROXY_URL

# 7. 重新构建
npm run build

# 8. 提交并推送
git add .
git commit -m "Update Worker URL"
git push
```

## ❓ 如果仍然有问题

### 选项 1: 使用 Cloudflare Dashboard 部署

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → Create application → Create Worker
3. 点击 "Quick Edit"
4. 复制 `worker.js` 的内容粘贴进去
5. 点击 "Save and Deploy"
6. 记录 Worker URL
7. 更新前端配置

### 选项 2: 使用 Pages Functions（简化方案）

如果 Worker 部署一直有问题，改用 Pages Functions：

编辑 `src/lib/config.ts`：
```typescript
const PRODUCTION_PROXY_URL = '/api/proxy';
```

Pages Functions 会自动部署，不需要单独配置。

## 📞 需要帮助？

告诉我：
1. 运行 `wrangler deploy` 的输出（如果有）
2. Worker 的实际 URL
3. 任何错误信息

我可以帮您精确定位问题！
