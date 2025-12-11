/**
 * 图片分析 API (Deno 版本)
 * POST /api/analyze
 */

import OpenAI from "https://esm.sh/openai@4.77.3";

export async function handleAnalyze(req: Request): Promise<Response> {
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
    const { base64Image, promptConfig } = body;

    if (!base64Image) {
      return new Response(
        JSON.stringify({ error: "Missing base64Image" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[Analyze] API Key exists:", !!apiKey);
    console.log("[Analyze] API Key prefix:", apiKey?.substring(0, 10) + "...");

    // 使用 OpenRouter API
    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const { systemRole, fields } = promptConfig?.analysisPrompt || {
      systemRole: "Analyze this jewelry design image.",
      fields: {
        designConcept: "设计理念描述 (用中文回答)",
        style: "风格描述 (用中文回答)",
        audience: "目标用户 (用中文回答)",
        emotionalPoint: "情感卖点 (用中文回答)",
        scenario: "使用场景 (用中文回答)",
        corePoint: "核心特点 (用中文回答)",
      }
    };

    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: base64Image } },
            {
              type: "text",
              text: `${systemRole}
              CRITICAL: All field VALUES must be in CHINESE (Simplified).
              Return a pure JSON object with the following fields:
              - designConcept: ${fields.designConcept}
              - style: ${fields.style}
              - audience: ${fields.audience}
              - emotionalPoint: ${fields.emotionalPoint}
              - scenario: ${fields.scenario}
              - corePoint: ${fields.corePoint}

              IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks.`
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response");
    }

    // Clean JSON string from Markdown code blocks
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }
    cleanedContent = cleanedContent.trim();

    const analysis = JSON.parse(cleanedContent);

    return new Response(
      JSON.stringify(analysis),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Analyze Error:", error);

    // 生产环境不返回敏感信息
    const isProduction = Deno.env.get("DENO_ENV") === "production";

    return new Response(
      JSON.stringify({
        error: "Failed to analyze image",
        message: isProduction ? "图片分析失败,请稍后重试" : error.message,
        ...(isProduction ? {} : { stack: error.stack })
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

