# 🔧 部署故障排查指南

## ✅ 好消息：构建成功了！

您的构建日志显示：
```
✓ built in 13.15s
```

这意味着代码本身没问题。如果看到"失败"，可能是以下原因：

## 🔍 快速检查清单

### 1️⃣ 检查 Cloudflare Pages 配置

**必须确认这些设置正确：**

进入：Cloudflare Dashboard → Pages → smart-vc-bot → Settings → Builds & deployments

```
✅ Build command: npm run build
✅ Build output directory: dist
❌ Deploy command: 删除/留空（不要填 wrangler deploy）
❌ Version command: 删除/留空
```

**如果有 Deploy command 或 Version command，必须删除！**

### 2️⃣ 查看完整的部署日志

1. Cloudflare Dashboard → Pages → smart-vc-bot
2. 点击 "Deployments"
3. 点击最新的部署
4. **查看完整日志**，找到失败的具体原因

### 3️⃣ 常见错误及解决方案

#### 错误 A: "Command failed with exit code 1"

**原因：** 配置中有 `npx wrangler deploy`

**解决：**
- 删除 Deploy command
- 删除 Version command
- 重新部署

#### 错误 B: "Functions deployment failed"

**原因：** Functions 文件格式有问题

**解决：** 检查 `functions/api/proxy.js` 是否存在且格式正确

#### 错误 C: "Build output directory not found"

**原因：** Build output directory 配置错误

**解决：** 确保设置为 `dist`（不是 `dist/` 或其他）

## 🎯 正确的部署流程

```
1. 推送代码到 GitHub
   ↓
2. Cloudflare Pages 自动触发
   ↓
3. 运行: npm install
   ✓ 成功
   ↓
4. 运行: npm run build
   ✓ 成功（您已看到这个）
   ↓
5. 部署静态文件从 dist/
   ？可能在这里失败
   ↓
6. 部署 Functions 从 functions/
   ？可能在这里失败
   ↓
7. 完成
```

## 📋 立即行动步骤

### Step 1: 确认配置正确

访问 Pages 设置，**截图**您的 Build configuration，发给我看。

### Step 2: 重新部署

1. 进入 Deployments
2. 找到最新的部署
3. 点击 "View build log"
4. **复制完整的日志**（特别是错误部分）
5. 告诉我具体的错误信息

### Step 3: 测试替代方案

如果 Pages Functions 持续失败，我们可以：

**方案 A: 使用您的独立 Worker**

您已经有了：`smart-vc-bot.peungsun.workers.dev`

修改 `src/lib/config.ts`:
```typescript
const PRODUCTION_PROXY_URL = 'https://smart-vc-bot.peungsun.workers.dev';
```

**方案 B: 简化部署**

暂时禁用代理，先让前端部署成功：
```typescript
export const USE_PROXY = false;
```

## 🧪 本地测试

在推送前，本地测试：

```bash
# 构建
npm run build

# 测试 Pages Functions（需要 wrangler）
npx wrangler pages dev dist

# 在浏览器访问
http://localhost:8788
```

测试代理：
```bash
curl -X POST http://localhost:8788/api/proxy \
  -H "Content-Type: application/json" \
  -d '{"url":"https://api.example.com","headers":{},"body":{}}'
```

## 🆘 需要更多帮助？

请提供：

1. **完整的构建日志**（特别是错误部分）
2. **Build configuration 截图**
3. **具体的错误信息**

这样我可以精确定位问题！

## 💡 快速解决方案

**如果急需上线，使用独立 Worker：**

1. 编辑 `src/lib/config.ts`:
```typescript
const PRODUCTION_PROXY_URL = 'https://smart-vc-bot.peungsun.workers.dev';
```

2. 重新构建并推送：
```bash
npm run build
git add .
git commit -m "Use independent Worker for CORS proxy"
git push
```

这样可以立即解决问题，之后再慢慢调试 Pages Functions。

---

**记住：构建成功了，只是部署环节有问题。这是可以解决的！** 💪
