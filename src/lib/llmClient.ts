import { ProviderId, ProviderConfig } from '../types';

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
    const response = await fetch(provider.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [provider.apiKeyHeaderName]: buildAuthHeaderValue(params.providerId, params.apiKey),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = provider.extractContent(data);

    if (!content) {
      throw new Error('Failed to extract content from LLM response');
    }

    return content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`LLM call failed: ${error.message}`);
    }
    throw new Error('LLM call failed with unknown error');
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
