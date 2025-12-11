import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { config, referenceImage, promptConfig } = req.body;

    if (!config) {
      return res.status(400).json({ error: 'Missing config' });
    }

    // Initialize OpenAI client with OpenRouter
    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const { systemRole, outputRequirements, productSpecificGuidelines } = promptConfig?.generationPrompt || {
      systemRole: "Act as a world-class jewelry designer.",
      outputRequirements: "CRITICAL OUTPUT REQUIREMENTS:\n- Background: PURE WHITE background (Hex #FFFFFF).\n- Composition: The jewelry must occupy exactly 85% of the image frame.\n- Lighting: Professional studio photography lighting with soft shadows.\n- DETAILS: Ultra-high-quality rendering with accurate gemstone reflections and metal luster.",
      productSpecificGuidelines: "Create a photorealistic, high-quality jewelry rendering suitable for e-commerce."
    };

    // Construct the prompt
    const textPrompt = `
      ${systemRole}
      ${productSpecificGuidelines}
      
      Design Specifications:
      - Material: ${config.material}
      - Craftsmanship: ${config.craftsmanship}
      - Chain/Structure: ${config.chainType}
      - Extra Elements: ${config.extraElements}
      - Target Audience: ${config.audience}
      - Additional Instructions: ${config.miscPrompts || 'None'}
      
      ${outputRequirements}
      
      Image Size: ${config.resolution}
      Aspect Ratio: ${config.aspectRatio}
    `;

    // Prepare message content
    let messageContent: any[] = [{ type: "text", text: textPrompt }];
    
    if (referenceImage) {
      messageContent.unshift({
        type: "image_url",
        image_url: { url: referenceImage }
      });
    }

    const response = await openai.chat.completions.create({
      model: 'google/gemini-3-pro-image-preview',
      messages: [
        {
          role: "user",
          content: messageContent
        }
      ],
      modalities: ["image", "text"],
      image_config: {
        aspect_ratio: config.aspectRatio
      }
    } as any);

    // Extract image from response
    const message = response.choices[0]?.message;
    if (message && (message as any).images && Array.isArray((message as any).images)) {
      const images = (message as any).images;
      if (images.length > 0) {
        const imageUrl = images[0].image_url.url;
        return res.status(200).json({ imageUrl });
      }
    }

    throw new Error('No image generated');

  } catch (error: any) {
    console.error('Generation Error:', error);
    return res.status(500).json({ 
      error: 'Generation failed', 
      message: error.message 
    });
  }
}

