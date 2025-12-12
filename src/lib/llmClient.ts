import { ProviderId, ProviderConfig } from '../types';
import { USE_PROXY, PROXY_URL } from './config';

// Provider configurations
const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  doubao: {
    id: 'doubao',
    displayName: '豆包 (Doubao)',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'ep-20241211085953-dlmhz', // Default model, can be overridden
    apiKeyHeaderName: 'Authorization',
    buildRequestBody: ({ systemPrompt, userPrompt }) => ({
      model: 'ep-20241211085953-dlmhz',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    }),
    extractContent: (response) => {
      return response?.choices?.[0]?.message?.content || '';
    }
  },
  deepseek: {
    id: 'deepseek',
    displayName: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    apiKeyHeaderName: 'Authorization',
    buildRequestBody: ({ systemPrompt, userPrompt }) => ({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    }),
    extractContent: (response) => {
      return response?.choices?.[0]?.message?.content || '';
    }
  },
  openai: {
    id: 'openai',
    displayName: 'ChatGPT (OpenAI)',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    apiKeyHeaderName: 'Authorization',
    buildRequestBody: ({ systemPrompt, userPrompt }) => ({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    }),
    extractContent: (response) => {
      return response?.choices?.[0]?.message?.content || '';
    }
  },
  tongyi: {
    id: 'tongyi',
    displayName: '通义 (Tongyi)',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    model: 'qwen-max',
    apiKeyHeaderName: 'Authorization',
    buildRequestBody: ({ systemPrompt, userPrompt }) => ({
      model: 'qwen-max',
      input: {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      },
      parameters: {
        result_format: 'message'
      }
    }),
    extractContent: (response) => {
      return response?.output?.choices?.[0]?.message?.content || '';
    }
  }
};

function buildAuthHeaderValue(providerId: ProviderId, apiKey: string): string {
  // Most providers use "Bearer <token>" format
  if (providerId === 'tongyi') {
    return `Bearer ${apiKey}`;
  }
  return `Bearer ${apiKey}`;
}

export async function callLLM(params: {
  providerId: ProviderId;
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  timeoutMs?: number; // Optional timeout in milliseconds, default 120s
  onProgress?: (message: string) => void; // Optional progress callback
}): Promise<string> {
  const provider = PROVIDERS[params.providerId];
  const timeoutMs = params.timeoutMs || 120000; // Default 120 seconds

  if (!provider) {
    throw new Error(`Unknown provider: ${params.providerId}`);
  }

  const body = provider.buildRequestBody({
    systemPrompt: params.systemPrompt,
    userPrompt: params.userPrompt,
  });

  try {
    let response;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    params.onProgress?.('正在调用 AI API...');

    try {
      if (USE_PROXY) {
        // 使用代理服务器
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
          signal: controller.signal,
        });
      } else {
        // 直接调用 API
        response = await fetch(provider.baseUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            [provider.apiKeyHeaderName]: buildAuthHeaderValue(params.providerId, params.apiKey),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      }
    } finally {
      clearTimeout(timeoutId);
    }

    params.onProgress?.('正在解析 AI 响应...');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 返回错误 (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    const content = provider.extractContent(data);

    if (!content) {
      throw new Error('无法从 API 响应中提取内容。请检查 API Key 是否正确。');
    }

    params.onProgress?.('AI 响应成功');

    return content;
  } catch (error) {
    if (error instanceof Error) {
      // Handle timeout
      if (error.name === 'AbortError') {
        throw new Error(
          `请求超时（超过 ${timeoutMs / 1000} 秒）。\n` +
          `该分析阶段包含较多维度，可能需要更长时间。\n` +
          `建议：\n` +
          `1. 稍后重试\n` +
          `2. 检查网络连接\n` +
          `3. 联系技术支持`
        );
      }
      // More detailed error messages
      if (error.message.includes('Failed to fetch')) {
        throw new Error(
          `网络请求失败。可能的原因：\n` +
          `1. CORS 跨域限制 - 请使用支持 CORS 的 API endpoint 或配置代理服务器\n` +
          `2. 网络连接问题 - 请检查您的网络连接\n` +
          `3. API endpoint 不正确 - 请检查供应商的 API 地址\n` +
          `4. API Key 格式错误 - 请确认 API Key 格式正确\n\n` +
          `建议：使用后端代理服务来避免 CORS 问题。`
        );
      }
      throw new Error(`调用 LLM 失败: ${error.message}`);
    }
    throw new Error('调用 LLM 时发生未知错误');
  }
}

export function getProvider(providerId: ProviderId): ProviderConfig {
  const provider = PROVIDERS[providerId];
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  return provider;
}

export function getAllProviders(): ProviderConfig[] {
  return Object.values(PROVIDERS);
}

// Helper function to parse JSON from LLM response
export function parseJSONFromResponse(response: string): any {
  // Try to extract JSON if it's wrapped in markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }

  // Try to parse directly
  return JSON.parse(response);
}

// Helper to fix common JSON issues and retry parsing
export async function parseJSONWithRetry(params: {
  providerId: ProviderId;
  apiKey: string;
  rawResponse: string;
}): Promise<any> {
  try {
    return parseJSONFromResponse(params.rawResponse);
  } catch (error) {
    // If parsing fails, ask LLM to fix it
    const fixPrompt = `以下文本应该是一个JSON对象，但解析失败了。请只输出修复后的合法JSON，不要添加任何解释：\n\n${params.rawResponse}`;

    const fixedResponse = await callLLM({
      providerId: params.providerId,
      apiKey: params.apiKey,
      systemPrompt: '你是一个JSON格式修复助手。只输出合法的JSON，不要添加任何其他文字。',
      userPrompt: fixPrompt
    });

    return parseJSONFromResponse(fixedResponse);
  }
}
