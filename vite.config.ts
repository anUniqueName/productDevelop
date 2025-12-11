import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // OpenRouter API 配置
        'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
        // 提示词配置类型
        'process.env.PROMPT_CONFIG_TYPE': JSON.stringify(env.PROMPT_CONFIG_TYPE),
        // 保留旧的 Google API 配置(备用)
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // 开发模式配置
        'import.meta.env.VITE_DEV_MODE_SKIP_AUTH': JSON.stringify(env.VITE_DEV_MODE_SKIP_AUTH),
        // 钉钉 OAuth 配置（仅用于前端显示，实际认证在后端）
        'import.meta.env.DINGTALK_APP_KEY': JSON.stringify(env.DINGTALK_APP_KEY),
        'import.meta.env.DINGTALK_REDIRECT_URI': JSON.stringify(env.DINGTALK_REDIRECT_URI),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
