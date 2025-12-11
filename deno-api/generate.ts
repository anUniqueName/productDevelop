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
    const { prompt } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
          content: prompt,
        },
      ],
    });

    const imageUrl = response.choices[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ imageUrl }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
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

