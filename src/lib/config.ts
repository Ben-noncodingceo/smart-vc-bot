/**
 * Application Configuration
 *
 * 修改这些设置来配置代理和其他选项
 */

// 检测是否在生产环境
const isProduction = window.location.hostname !== 'localhost' &&
                     window.location.hostname !== '127.0.0.1';

// CORS 代理配置
export const USE_PROXY = true; // 始终启用代理

// 生产环境代理 URL - 使用 Cloudflare Pages Functions（自动部署）
const PRODUCTION_PROXY_URL = '/api/proxy';

// 开发环境代理 URL
const DEVELOPMENT_PROXY_URL = 'http://localhost:3001/api/proxy';

// 根据环境自动选择代理 URL
export const PROXY_URL = isProduction ? PRODUCTION_PROXY_URL : DEVELOPMENT_PROXY_URL;

/**
 * 使用说明：
 *
 * 如果遇到 CORS 错误：
 * 1. 启动 CORS 代理服务器：cd cors-proxy && npm install && npm start
 * 2. 设置 USE_PROXY = true
 * 3. 确保 PROXY_URL 指向正确的代理地址
 * 4. 重新启动前端应用
 *
 * 如果使用支持 CORS 的 API（如 DeepSeek）：
 * 1. 保持 USE_PROXY = false
 * 2. 直接使用即可
 */
