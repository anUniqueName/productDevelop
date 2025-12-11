/**
 * 安全版本的 Gemini Service
 * 用于 Vercel/Cloudflare 部署
 * 
 * 通过后端 API 路由调用 OpenRouter，而不是直接在浏览器中调用
 * 这样可以保护 API Key 不被暴露
 */

import { JewelryConfig, ImageAnalysis } from "../types";
import { promptConfigManager } from "../utils/promptConfigManager";

// API 基础 URL - 在生产环境中会自动使用当前域名
const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';

/**
 * 分析珠宝图片
 * 通过后端 API 调用 OpenRouter
 */
export const analyzeJewelryImage = async (base64Image: string): Promise<ImageAnalysis> => {
  try {
    // 获取当前的提示词配置
    const promptConfig = promptConfigManager.getConfig();

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        promptConfig,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Analysis failed');
    }

    const analysis = await response.json();
    return analysis as ImageAnalysis;

  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error(`图片分析失败: ${error.message}`);
  }
};

/**
 * 生成珠宝设计图
 * 通过后端 API 调用 OpenRouter
 */
export const generateJewelryDesign = async (
  config: JewelryConfig,
  referenceImage?: string | null
): Promise<string> => {
  try {
    // 获取当前的提示词配置
    const promptConfig = promptConfigManager.getConfig();

    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config,
        referenceImage,
        promptConfig,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Generation failed');
    }

    const result = await response.json();
    
    if (!result.imageUrl) {
      throw new Error('No image URL in response');
    }

    return result.imageUrl;

  } catch (error: any) {
    console.error("Generation Error:", error);
    throw new Error(`图片生成失败: ${error.message}`);
  }
};

