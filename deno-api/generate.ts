/**
 * 图片生成 API (Deno 版本)
 * POST /api/generate
 */

import OpenAI from "https://esm.sh/openai@4.77.3";

export async function handleGenerate(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { config, referenceImage, promptConfig } = body;

    if (!config) {
      return new Response(
        JSON.stringify({ error: "Missing config" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[Generate] API Key exists:", !!apiKey);
    console.log("[Generate] API Key prefix:", apiKey?.substring(0, 10) + "...");

    // 使用 OpenRouter API
    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const { systemRole, outputRequirements, productSpecificGuidelines } = promptConfig?.generationPrompt || {
      systemRole: "Generate a jewelry design image.",
      outputRequirements: "Create a high-quality product image.",
      productSpecificGuidelines: "Follow jewelry design best practices."
    };

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
        return new Response(
          JSON.stringify({ imageUrl }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    throw new Error('No image generated');
  } catch (error: any) {
    console.error("Generate Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate image", 
        message: error.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

