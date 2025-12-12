# Cloudflare Pages Functions 部署（推荐方案）

## 🎉 超级简单！无需单独部署 Worker

使用 **Cloudflare Pages Functions**，代理会自动部署，完全零配置！

## 📁 文件结构

```
smart-vc-bot/
├── functions/           # Pages Functions（自动部署）
│   └── api/
│       └── proxy.js     # CORS 代理
├── src/                 # 前端代码
└── dist/               # 构建输出
```

## ✅ 工作原理

当您推送代码到 GitHub 时：

1. Cloudflare Pages 自动构建 `dist/`
2. 自动部署 `functions/` 中的 Functions
3. 代理 API 自动可用在 `/api/proxy`

**完全自动化！** 🚀

## 🔧 配置（已完成）

配置已自动设置：

```typescript
// 生产环境：使用 Pages Function
const PRODUCTION_PROXY_URL = '/api/proxy';

// 开发环境：使用本地代理
const DEVELOPMENT_PROXY_URL = 'http://localhost:3001/api/proxy';
```

## 📋 部署步骤

### 方法 1: 自动部署（推荐）

```bash
# 1. 提交代码
git add .
git commit -m "Add Pages Functions for CORS proxy"
git push

# 2. 等待 Cloudflare Pages 自动部署（2-3分钟）
# 3. 完成！
```

### 方法 2: 手动测试

```bash
# 本地构建
npm run build

# 本地测试 Pages Functions
npx wrangler pages dev dist

# 测试代理
curl -X POST http://localhost:8788/api/proxy \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.example.com"}'
```

## 🌐 生产环境

部署后，您的应用架构：

```
https://smart-vc-bot.pages.dev/
    ↓
前端应用（静态文件）
    ↓
https://smart-vc-bot.pages.dev/api/proxy
    ↓
Pages Function（自动处理 CORS）
    ↓
LLM API（豆包/DeepSeek/OpenAI/通义）
```

## ✨ 优势

✅ **零配置** - 无需单独部署 Worker
✅ **自动部署** - 推送代码即可
✅ **同域名** - 前端和 API 在同一域名
✅ **完全免费** - 包含在 Pages 免费额度内
✅ **无需 Wrangler** - 不需要安装额外工具

## 🔍 验证部署

### 1. 检查 Pages 构建日志

访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) > Pages > smart-vc-bot

查看最新部署，应该看到：
```
✓ Build succeeded
✓ Functions deployed
  - /api/proxy
```

### 2. 测试代理 API

访问您的 Pages URL：
```bash
curl -X OPTIONS https://smart-vc-bot.pages.dev/api/proxy
```

应该返回 CORS 头。

### 3. 测试应用

1. 访问 https://smart-vc-bot.pages.dev
2. 选择 LLM 供应商
3. 输入 API Key
4. 上传文件
5. 开始分析

**不会再有 CORS 错误！** ✨

## 🐛 故障排查

### Functions 没有部署？

检查：
1. `functions/` 文件夹是否在项目根目录
2. `functions/api/proxy.js` 是否存在
3. 代码是否已推送到 GitHub
4. Pages 是否重新构建（查看 Dashboard）

### 还是有 CORS 错误？

1. 清除浏览器缓存
2. 检查浏览器控制台的网络请求
3. 确认请求发送到 `/api/proxy`
4. 查看 Pages 的 Functions 日志

### 查看 Functions 日志

1. Cloudflare Dashboard > Pages > smart-vc-bot
2. 选择最新部署
3. 点击 "Functions" 标签
4. 查看实时日志

## 💡 提示

- Pages Functions 限制：每天 100,000 次请求（免费）
- 响应时间：通常 < 100ms
- 自动全球分发：使用 Cloudflare CDN
- 支持环境变量：在 Pages 设置中配置

## 📚 相关文档

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Pages Functions API](https://developers.cloudflare.com/pages/platform/functions/api-reference/)

## 🎯 总结

Pages Functions 方案 vs 独立 Worker：

| 特性 | Pages Functions | 独立 Worker |
|------|----------------|-------------|
| 部署 | ✅ 自动 | ❌ 手动 |
| 配置 | ✅ 零配置 | ❌ 需要配置 |
| 域名 | ✅ 同域名 | ❌ 不同域名 |
| 工具 | ✅ 无需额外工具 | ❌ 需要 Wrangler |

**推荐使用 Pages Functions！** 🎉
