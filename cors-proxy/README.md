# CORS 代理服务器

这是一个简单的 CORS 代理服务器，用于解决 AI BP Analysis Tool 的跨域请求问题。

## 快速开始

### 1. 安装依赖

```bash
cd cors-proxy
npm install
```

### 2. 启动服务器

```bash
npm start
```

服务器将运行在 `http://localhost:3001`

### 3. 配置前端使用代理

编辑 `src/lib/llmClient.ts`，在文件开头添加配置：

```typescript
// 配置代理 URL（开发环境）
const USE_PROXY = true;
const PROXY_URL = 'http://localhost:3001/api/proxy';
```

然后修改 `callLLM` 函数：

```typescript
export async function callLLM(params: {
  providerId: ProviderId;
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const provider = PROVIDERS[params.providerId];

  if (!provider) {
    throw new Error(`Unknown provider: ${params.providerId}`);
  }

  const body = provider.buildRequestBody({
    systemPrompt: params.systemPrompt,
    userPrompt: params.userPrompt,
  });

  try {
    let response;

    if (USE_PROXY) {
      // 使用代理
      response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: provider.baseUrl,
          headers: {
            'Content-Type': 'application/json',
            [provider.apiKeyHeaderName]: buildAuthHeaderValue(params.providerId, params.apiKey),
          },
          body: body
        }),
      });
    } else {
      // 直接调用（如果 API 支持 CORS）
      response = await fetch(provider.baseUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          [provider.apiKeyHeaderName]: buildAuthHeaderValue(params.providerId, params.apiKey),
        },
        body: JSON.stringify(body),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 返回错误 (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    const content = provider.extractContent(data);

    if (!content) {
      throw new Error('无法从 API 响应中提取内容。请检查 API Key 是否正确。');
    }

    return content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`调用 LLM 失败: ${error.message}`);
    }
    throw new Error('调用 LLM 时发生未知错误');
  }
}
```

## 使用方法

1. 启动代理服务器：`npm start`
2. 启动前端应用：`npm run dev`（在主项目目录）
3. 访问 `http://localhost:5173`
4. 正常使用应用，所有 LLM API 请求将通过代理服务器

## 健康检查

访问 `http://localhost:3001/health` 查看服务器状态

## 注意事项

⚠️ **安全警告**：
- 这个代理服务器仅用于开发和测试
- 不要在生产环境直接暴露这个服务器
- API Key 会通过代理服务器传递，请确保在安全的网络环境中使用

## 生产环境部署

生产环境建议使用：
- Cloudflare Workers
- Vercel Serverless Functions
- AWS Lambda + API Gateway

详见主项目的 `CORS_SOLUTION.md` 文档。
