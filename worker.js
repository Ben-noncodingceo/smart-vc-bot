// Cloudflare Worker for CORS Proxy
// 部署说明：wrangler deploy

export default {
  async fetch(request, env) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 仅允许 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    try {
      const requestBody = await request.json();
      const { url, headers, body } = requestBody;

      if (!url) {
        return new Response(JSON.stringify({ error: '缺少 URL 参数' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // 转发请求到目标 API
      const response = await fetch(url, {
        method: 'POST',
        headers: headers || {},
        body: JSON.stringify(body),
      });

      // 获取响应数据
      const data = await response.json();

      // 返回响应，添加 CORS 头
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Proxy error',
          message: error.message,
          details: error.toString()
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
