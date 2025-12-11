# AI BP 智能投研助手

一个纯前端的智能BP/企业介绍分析工具，支持多个大模型供应商。

## 功能特点

- 🤖 支持多个LLM供应商（豆包/DeepSeek/ChatGPT/通义）
- 📄 支持PDF、PPTX、DOCX文件解析（≤10MB）
- 📊 10个维度的企业分析
- 💬 AI对话功能
- 📤 支持导出JSON和Markdown格式
- 🔒 API Key仅在本地浏览器存储，不经后端

## 分析维度

1. 行业Market Cap
2. 行业最新前沿发展情况
3. 国际相似上市公司（含最近3年核心数据）
4. 企业目前阶段
5. 企业Revenue按年情况
6. 企业盈利情况、潜在盈利情况
7. 企业政策风险概率
8. 企业投资价值（高/中/低）
9. 相似企业过去一年融资投资案例
10. 高科技行业科研文献（如适用）

## 技术栈

- React 18
- TypeScript
- Vite
- Ant Design
- React Router
- Zustand
- pdfjs-dist
- mammoth
- jszip

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 部署

本项目为纯前端应用，可部署到：
- Cloudflare Pages
- Vercel
- GitHub Pages
- Netlify

## 安全说明

⚠️ **重要提示**: 由于是纯前端应用，API Key会在浏览器中直接调用第三方API，存在一定的安全风险。生产环境建议使用后端代理方式。

## License

MIT
