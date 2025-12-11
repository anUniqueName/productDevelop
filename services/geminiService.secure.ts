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

    // 清理 config 对象，只保留需要的属性，避免循环引用
    const cleanConfig: JewelryConfig = {
      material: config.material,
      craftsmanship: config.craftsmanship,
      chainType: config.chainType,
      extraElements: config.extraElements,
      audience: config.audience,
      miscPrompts: config.miscPrompts,
      creativityStrength: config.creativityStrength,
      aspectRatio: config.aspectRatio,
      resolution: config.resolution,
      minRanking: config.minRanking,
      minSearchVolume: config.minSearchVolume,
      minSales: config.minSales,
      maxPPC: config.maxPPC,
    };

    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: cleanConfig,
        referenceImage,
        promptConfig,
      }),
    });

    if (!response.ok) {
      // 尝试解析JSON错误,如果失败则读取原始文本
      let errorMessage = 'Generation failed';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        // 如果不是JSON,读取原始文本
        const text = await response.text();
        console.error("Non-JSON error response:", text);
        errorMessage = `Server error (${response.status}): ${text.substring(0, 200)}`;
      }
      throw new Error(errorMessage);
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

