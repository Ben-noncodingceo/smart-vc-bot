const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// 启用 CORS 和 JSON 解析
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CORS 代理服务器运行正常' });
});

// 通用代理端点
app.post('/api/proxy', async (req, res) => {
  try {
    const { url, headers, body } = req.body;

    if (!url) {
      return res.status(400).json({ error: '缺少 URL 参数' });
    }

    console.log(`代理请求到: ${url}`);

    const response = await axios({
      method: 'POST',
      url: url,
      headers: headers || {},
      data: body,
      timeout: 60000 // 60 秒超时
    });

    res.json(response.data);
  } catch (error) {
    console.error('代理错误:', error.message);

    const status = error.response?.status || 500;
    const errorData = {
      error: error.message,
      details: error.response?.data,
      status: status
    };

    res.status(status).json(errorData);
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`✅ CORS 代理服务器已启动`);
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`💚 健康检查: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});
