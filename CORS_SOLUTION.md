# CORS 问题解决方案

## 问题说明

由于浏览器的安全策略（CORS - 跨域资源共享），纯前端应用无法直接调用大多数 LLM API。您会遇到类似 "Failed to fetch" 的错误。

## 解决方案

### 方案 1: 使用简单的 CORS 代理服务（推荐用于开发测试）

创建一个简单的 Node.js 代理服务器：

#### 1. 创建代理服务器

创建文件 `cors-proxy/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 通用代理端点
app.post('/api/proxy', async (req, res) => {
  try {
    const { url, method = 'POST', headers, body } = req.body;

    const response = await axios({
      method,
      url,
      headers,
      data: body
    });

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

app.listen(PORT, () => {
  console.log(`CORS 代理服务器运行在 http://localhost:${PORT}`);
});
```

创建 `cors-proxy/package.json`:

```json
{
  "name": "cors-proxy",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0"
  }
}
```

#### 2. 运行代理服务器

```bash
cd cors-proxy
npm install
npm start
```

#### 3. 修改前端代码使用代理

在 `src/lib/llmClient.ts` 中，修改 `callLLM` 函数使用代理：

```typescript
// 使用本地代理
const PROXY_URL = 'http://localhost:3001/api/proxy';

const response = await fetch(PROXY_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: provider.baseUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [provider.apiKeyHeaderName]: buildAuthHeaderValue(params.providerId, params.apiKey),
    },
    body: body
  }),
});
```

### 方案 2: 使用 Cloudflare Workers（推荐用于生产环境）

#### 1. 创建 Cloudflare Worker

创建文件 `worker.js`:

```javascript
export default {
  async fetch(request) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      const { url, headers, body } = await request.json();

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
```

#### 2. 部署 Worker

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录
wrangler login

# 部署
wrangler deploy worker.js
```

### 方案 3: 使用已有的公共 CORS 代理（仅用于测试）

⚠️ **警告：不要在生产环境使用公共代理，会暴露您的 API Key！**

```javascript
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const actualUrl = PROXY_URL + provider.baseUrl;
```

### 方案 4: 使用支持 CORS 的 LLM 服务

一些 LLM 服务提供商支持从浏览器直接调用：

#### DeepSeek
DeepSeek API 支持 CORS，可以直接从前端调用。

#### OpenAI (通过 Cloudflare AI Gateway)
使用 Cloudflare AI Gateway 作为中间层：

```javascript
// 配置 Cloudflare AI Gateway
const openaiGatewayUrl = 'https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai/chat/completions';
```

## 推荐的生产环境架构

```
用户浏览器
    ↓
您的前端应用 (Cloudflare Pages)
    ↓
后端 API 代理 (Cloudflare Workers / Vercel Functions)
    ↓
LLM API (豆包/DeepSeek/OpenAI/通义)
```

这样可以：
1. ✅ 解决 CORS 问题
2. ✅ 保护 API Key 安全
3. ✅ 添加请求限流和监控
4. ✅ 统一错误处理

## 快速测试方案

如果您只是想快速测试功能，可以：

1. **使用 DeepSeek**：它支持 CORS，可以直接从浏览器调用
2. **本地开发**：运行上面提供的简单代理服务器
3. **禁用浏览器安全性**（仅用于开发）：
   ```bash
   # Chrome (仅用于测试，不安全)
   # macOS
   open -na "Google Chrome" --args --user-data-dir=/tmp/chrome_dev --disable-web-security

   # Windows
   chrome.exe --user-data-dir="C:\tmp\chrome_dev" --disable-web-security
   ```

## 下一步

选择适合您的方案后：

1. 如果使用代理，修改 `src/lib/llmClient.ts` 中的请求 URL
2. 如果使用 DeepSeek，确保 API Key 正确
3. 重新构建并测试应用

需要帮助实现任何一个方案，请告诉我！
