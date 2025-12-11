/**
 * 提示词配置文件
 * 可以根据不同的产品类型自定义分析和生成提示词
 */

export interface PromptConfig {
  // 产品类型名称
  productType: string;
  
  // 图片分析提示词
  analysisPrompt: {
    systemRole: string;
    fields: {
      designConcept: string;
      style: string;
      audience: string;
      emotionalPoint: string;
      scenario: string;
      corePoint: string;
    };
  };
  
  // 图片生成提示词
  generationPrompt: {
    systemRole: string;
    outputRequirements: string;
    productSpecificGuidelines: string;
  };
}

// 珠宝设计配置（默认）
export const jewelryPromptConfig: PromptConfig = {
  productType: "珠宝设计",
  
  analysisPrompt: {
    systemRole: "Analyze this jewelry design image. Provide a structured analysis.",
    fields: {
      designConcept: "Brief design idea/inspiration (用中文回答)",
      style: "The aesthetic style (e.g. Vintage, Modern) (用中文回答)",
      audience: "Target demographic (用中文回答)",
      emotionalPoint: "Why would a customer buy this? (Emotional hook) (用中文回答)",
      scenario: "Where would this be worn? (用中文回答)",
      corePoint: "The single most important feature to replicate or focus on during development. (用中文回答)",
    },
  },
  
  generationPrompt: {
    systemRole: "Act as a world-class high-jewelry designer.",
    outputRequirements: `CRITICAL OUTPUT REQUIREMENTS (AMAZON MAIN IMAGE STANDARD):
- Background: PURE WHITE background (Hex #FFFFFF). No shadows, no gradients, no props.
- Composition: The jewelry piece must occupy exactly 85% of the image frame.
- The entire product must be clearly visible and centered.
- Lighting: High-resolution, professional studio photography lighting with softbox reflections.
- SURFACE FINISH (CRITICAL): ULTRA-HIGH POLISH, Mirror Finish. All metal surfaces must be perfectly smooth, reflective, and free of noise or grain.
- DETAILS: Exquisite macro details. Gemstones must have perfect cut, clarity, and brilliance. Museum-quality rendering.`,
    productSpecificGuidelines: "Create a photorealistic, high-quality jewelry design rendering.",
  },
};

// 通用产品设计配置
export const genericPromptConfig: PromptConfig = {
  productType: "产品设计",
  
  analysisPrompt: {
    systemRole: "Analyze this product design image. Provide a structured analysis.",
    fields: {
      designConcept: "Brief design idea/inspiration (用中文回答)",
      style: "The aesthetic style (e.g. Modern, Minimalist, Industrial) (用中文回答)",
      audience: "Target demographic and use case (用中文回答)",
      emotionalPoint: "Why would a customer buy this? (Emotional hook) (用中文回答)",
      scenario: "Where/how would this be used? (用中文回答)",
      corePoint: "The single most important feature to replicate or focus on during development. (用中文回答)",
    },
  },
  
  generationPrompt: {
    systemRole: "Act as a world-class product designer.",
    outputRequirements: `CRITICAL OUTPUT REQUIREMENTS (E-COMMERCE STANDARD):
- Background: PURE WHITE background (Hex #FFFFFF). No shadows, no gradients, no props.
- Composition: The product must occupy exactly 85% of the image frame.
- The entire product must be clearly visible and centered.
- Lighting: High-resolution, professional studio photography lighting.
- SURFACE FINISH: Clean, professional finish appropriate for the product type.
- DETAILS: High-quality rendering with accurate materials and textures.`,
    productSpecificGuidelines: "Create a photorealistic, high-quality product design rendering.",
  },
};

// 服装设计配置
export const fashionPromptConfig: PromptConfig = {
  productType: "服装设计",
  
  analysisPrompt: {
    systemRole: "Analyze this fashion design image. Provide a structured analysis.",
    fields: {
      designConcept: "Brief design concept/inspiration (用中文回答)",
      style: "Fashion style (e.g. Streetwear, Haute Couture, Casual) (用中文回答)",
      audience: "Target demographic and occasion (用中文回答)",
      emotionalPoint: "Why would a customer buy this? (Emotional appeal) (用中文回答)",
      scenario: "Where would this be worn? (用中文回答)",
      corePoint: "The single most important design element to focus on. (用中文回答)",
    },
  },
  
  generationPrompt: {
    systemRole: "Act as a world-class fashion designer.",
    outputRequirements: `CRITICAL OUTPUT REQUIREMENTS (FASHION E-COMMERCE STANDARD):
- Background: PURE WHITE background (Hex #FFFFFF). Clean and minimal.
- Composition: The garment must be clearly visible, either on a model or flat lay.
- Lighting: Professional fashion photography lighting.
- DETAILS: Accurate fabric textures, colors, and draping.`,
    productSpecificGuidelines: "Create a photorealistic, high-quality fashion design rendering.",
  },
};

// 当前使用的配置（可以通过环境变量切换）
export const getCurrentPromptConfig = (): PromptConfig => {
  const configType = process.env.PROMPT_CONFIG_TYPE || 'jewelry';
  
  switch (configType) {
    case 'generic':
      return genericPromptConfig;
    case 'fashion':
      return fashionPromptConfig;
    case 'jewelry':
    default:
      return jewelryPromptConfig;
  }
};

