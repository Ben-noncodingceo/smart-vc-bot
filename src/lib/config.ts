/**
 * Application Configuration
 *
 * 修改这些设置来配置代理和其他选项
 */

// CORS 代理配置
export const USE_PROXY = true; // 设为 true 启用代理
export const PROXY_URL = 'http://localhost:3001/api/proxy';

// 开发模式（如果需要可以手动设置）
export const DEV_MODE = true;

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
