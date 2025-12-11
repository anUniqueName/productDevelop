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
    console.log("[Generate] Request received");

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      console.error("[Generate] OPENROUTER_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[Generate] Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { config, referenceImage, promptConfig } = body;

    if (!config) {
      console.error("[Generate] Missing config in request");
      return new Response(
        JSON.stringify({ error: "Missing config" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[Generate] API Key exists:", !!apiKey);
    console.log("[Generate] Config received:", {
      material: config.material,
      aspectRatio: config.aspectRatio,
      hasReference: !!referenceImage
    });

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

    console.log("[Generate] Calling OpenRouter API...");

    let response;
    try {
      response = await openai.chat.completions.create({
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
    } catch (apiError: any) {
      console.error("[Generate] OpenRouter API call failed:", apiError);
      return new Response(
        JSON.stringify({
          error: "OpenRouter API call failed",
          message: apiError.message || String(apiError),
          details: apiError.response?.data || null
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[Generate] API response received");

    // Extract image from response
    const message = response.choices[0]?.message;
    if (message && (message as any).images && Array.isArray((message as any).images)) {
      const images = (message as any).images;
      if (images.length > 0) {
        const imageUrl = images[0].image_url.url;
        console.log("[Generate] Image generated successfully");
        return new Response(
          JSON.stringify({ imageUrl }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    console.error("[Generate] No image in response");
    throw new Error('No image generated in API response');
  } catch (error: any) {
    console.error("[Generate] Unexpected error:", error);

    // 生产环境不返回敏感信息
    const isProduction = Deno.env.get("DENO_ENV") === "production";

    return new Response(
      JSON.stringify({
        error: "Failed to generate image",
        message: isProduction ? "图片生成失败,请稍后重试" : (error.message || String(error)),
        ...(isProduction ? {} : { stack: error.stack })
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

