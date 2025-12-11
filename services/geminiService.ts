import OpenAI from "openai";
import { JewelryConfig, ImageAnalysis } from "../types";
import { promptConfigManager } from "../utils/promptConfigManager";

// Helper to clean JSON string from Markdown code blocks
const cleanJsonString = (text: string): string => {
  // Remove ```json and ``` wrapping
  let clean = text.replace(/```json/g, "").replace(/```/g, "");
  // Trim whitespace
  return clean.trim();
};

export const analyzeJewelryImage = async (base64Image: string): Promise<ImageAnalysis> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    dangerouslyAllowBrowser: true, // 允许在浏览器中使用
  });

  // 获取当前的提示词配置
  const promptConfig = promptConfigManager.getConfig();
  const { systemRole, fields } = promptConfig.analysisPrompt;

  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
            {
              type: "text",
              text: `${systemRole}
            CRITICAL: All field VALUES must be in CHINESE (Simplified).

            Return a pure JSON object (no markdown formatting) with the following fields:
            - designConcept: ${fields.designConcept}
            - style: ${fields.style}
            - audience: ${fields.audience}
            - emotionalPoint: ${fields.emotionalPoint}
            - scenario: ${fields.scenario}
            - corePoint: ${fields.corePoint}

            Keep descriptions professional and concise.`,
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      try {
        const cleanedText = cleanJsonString(content);
        return JSON.parse(cleanedText) as ImageAnalysis;
      } catch (e) {
        console.error("JSON Parse Error:", e, "Raw Text:", content);
        throw new Error("Failed to parse analysis results.");
      }
    }
    throw new Error("Empty response from analysis model");

  } catch (error) {
    console.error("Analysis Error:", error);
    // Return default empty values on error to prevent app crash
    return {
      designConcept: "无法分析 (Analysis Failed)",
      style: "未知",
      audience: "未知",
      emotionalPoint: "未知",
      scenario: "未知",
      corePoint: "Please try another image",
    };
  }
};

export const generateJewelryDesign = async (
  referenceImage: string | null,
  config: JewelryConfig
): Promise<string> => {
  
  // High quality images require paid API Key selection by the user
  // This is a requirement for gemini-3-pro-image-preview
  // @ts-ignore - window.aistudio is injected by the environment
  if (window.aistudio && window.aistudio.openSelectKey) {
     // @ts-ignore
     const hasKey = await window.aistudio.hasSelectedApiKey();
     if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // We do not wait or loop here; the user will click 'Generate' again after selecting
     }
  }

  // Create OpenAI client for OpenRouter
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    dangerouslyAllowBrowser: true, // 允许在浏览器中使用
  });

  // 获取当前的提示词配置
  const promptConfig = promptConfigManager.getConfig();
  const { systemRole, outputRequirements, productSpecificGuidelines } = promptConfig.generationPrompt;

  // Construct the prompt
  const textPrompt = `
    ${systemRole}
    ${productSpecificGuidelines}

    If a reference image is provided, use it as the primary structural and aesthetic inspiration, but evolve it based on the new parameters (Derived Design).

    Design Specifications:
    - Material: ${config.material}
    - Craftsmanship: ${config.craftsmanship}
    - Chain/Structure Type: ${config.chainType}
    - Extra Decorative Elements: ${config.extraElements}
    - Target Audience/Occasion: ${config.audience}
    - Creativity/Variation Level: ${config.creativityStrength}% (Where 0% is identical to reference, 100% is completely new).
    - Additional Instructions: ${config.miscPrompts}

    Market Context (Use this to influence the style to be commercially viable):
    - Target Ranking Index: Top ${config.minRanking}
    - Min Sales Volume: ${config.minSales}+ units

    ${outputRequirements}

    Image Size: ${config.resolution}
    Aspect Ratio: ${config.aspectRatio}
  `;

  const messageContent: any[] = [{ type: "text", text: textPrompt }];

  if (referenceImage) {
    messageContent.push({
      type: "image_url",
      image_url: {
        url: referenceImage,
      },
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-3-pro-image-preview',
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
      modalities: ["image", "text"], // 必须指定 modalities 才能生成图片
      image_config: {
        aspect_ratio: config.aspectRatio,
      },
    } as any); // 使用 as any 因为 TypeScript 类型定义可能不包含这些字段

    // Extract image from response
    const message = response.choices[0]?.message;

    // OpenRouter 将图片数据放在 message.images 字段中
    if (message && (message as any).images && Array.isArray((message as any).images)) {
      const images = (message as any).images;
      if (images.length > 0) {
        const firstImage = images[0];
        if (firstImage.image_url && firstImage.image_url.url) {
          return firstImage.image_url.url;
        }
      }
    }

    // 备用：检查 content 字段
    const content = message?.content;
    if (typeof content === 'string') {
      if (content.startsWith('data:image') || content.startsWith('http')) {
        return content;
      }
    }

    console.error("No image found in response. Full message:", message);
    throw new Error("No image generated. The model may not have returned an image.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    // 1. Rate Limit / Quota Error (429)
    if (error.status === 429 || error.code === 429 || (error.message && error.message.includes("RESOURCE_EXHAUSTED"))) {
        throw new Error("⚠️ 额度已用尽 (Quota Exceeded): Please check your billing or API key quota. You may need to enable billing in Google Cloud Console.");
    }

    // 2. Permission Denied (403)
    const isPermissionError = error.status === 403 || error.code === 403 || 
                              (error.message && (
                                error.message.includes("PERMISSION_DENIED") || 
                                error.message.includes("permission") ||
                                error.message.includes("The caller does not have permission")
                              ));

    if (isPermissionError) {
        // @ts-ignore
        if (window.aistudio && window.aistudio.openSelectKey) {
             console.log("Permission denied. Requesting new key...");
             // Force re-selection of key
             // @ts-ignore
             await window.aistudio.openSelectKey();
             throw new Error("⚠️ 权限被拒绝 (Access Denied): Please select a valid paid API Key for Gemini 3 Pro.");
        }
    }

    throw error;
  }
};