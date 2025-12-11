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
    const { imageUrl, prompt } = body;

    if (!imageUrl || !prompt) {
      return new Response(
        JSON.stringify({ error: "Missing imageUrl or prompt" }),
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

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const analysis = response.choices[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ analysis }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Analyze Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to analyze image", 
        message: error.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

