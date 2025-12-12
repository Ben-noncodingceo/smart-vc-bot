# ✅ Cloudflare Pages 正确配置

## 🚨 重要：您的当前配置有误

您的配置中有这些错误命令：
- ❌ Deploy command: `npx wrangler deploy`
- ❌ Version command: `npx wrangler versions upload`

**这些命令是用于独立 Worker 的，不应该在 Pages 中使用！**

## ✅ 正确的配置

### 在 Cloudflare Pages Dashboard 中设置：

#### Build configuration

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

**关键点：**
- ✅ **不要填写** Deploy command
- ✅ **不要填写** Version command
- ✅ Pages 会自动部署 `dist/` 目录
- ✅ Pages Functions (`functions/`) 会自动部署

#### Branch control

```
Production branch: main
Builds for non-production branches: Enabled
```

#### Build watch paths

```
Include paths: *
```

## 📋 修改步骤

### 1. 进入 Cloudflare Dashboard

访问：https://dash.cloudflare.com/

### 2. 找到您的项目

Pages → smart-vc-bot

### 3. 进入设置

Settings → Builds & deployments

### 4. 编辑配置

点击 "Edit configuration"

### 5. 修改以下字段

**必须修改：**

| 字段 | 当前值（错误） | 正确值 |
|------|---------------|--------|
| Build command | npm run build | npm run build ✅ |
| Build output directory | ？ | **dist** |
| Deploy command | npx wrangler deploy ❌ | **留空/删除** ✅ |
| Version command | npx wrangler versions upload ❌ | **留空/删除** ✅ |

### 6. 保存并重新部署

- 点击 "Save"
- 点击 "Retry deployment"

## 🎯 工作原理

修改后的部署流程：

```
1. GitHub 推送代码
   ↓
2. Cloudflare Pages 自动触发构建
   ↓
3. 运行: npm install
   ↓
4. 运行: npm run build
   ↓
5. 部署 dist/ 目录（静态文件）
   ↓
6. 自动部署 functions/api/proxy.js（Pages Function）
   ↓
7. 完成！✨
```

**不需要手动运行 wrangler deploy！**

## 🔍 验证配置

构建成功后，您应该看到：

```
✓ Build succeeded
✓ Deploying...
  - Static files deployed from dist/
  - Functions deployed:
    • /api/proxy
✓ Deployment complete
```

## 🌐 测试

访问：
```
https://smart-vc-bot.pages.dev
```

测试代理 API：
```bash
curl -X OPTIONS https://smart-vc-bot.pages.dev/api/proxy
```

应该返回 CORS 头，说明 Pages Function 正常工作。

## ❓ 常见问题

### Q: 为什么不能用 wrangler deploy？

A: 因为您在使用 **Cloudflare Pages**，不是独立的 Worker。Pages 有自己的部署流程，会自动处理一切。

### Q: Functions 怎么部署？

A: Pages 会自动部署 `functions/` 目录中的所有文件。无需任何额外配置！

### Q: 如果我想用独立 Worker 怎么办？

A: 那是另一个方案。但对于您的项目，**Pages Functions 更简单更好**。

### Q: 构建失败怎么办？

A: 检查构建日志，通常是：
1. 依赖安装失败 → 检查 package.json
2. TypeScript 错误 → 检查代码
3. 构建配置错误 → 确保 Build output directory 是 `dist`

## 📚 参考文档

- [Cloudflare Pages - Framework guides](https://developers.cloudflare.com/pages/framework-guides/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Vite deployment](https://vitejs.dev/guide/static-deploy.html)

## 🎉 总结

**简单三步：**

1. ✅ Build command: `npm run build`
2. ✅ Build output directory: `dist`
3. ✅ 删除 Deploy command 和 Version command

修改后重新部署，应该就能正常工作了！🚀
