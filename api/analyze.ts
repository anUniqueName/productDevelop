import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Helper to clean JSON string from Markdown code blocks
const cleanJsonString = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Image, promptConfig } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: 'Missing base64Image' });
    }

    // Initialize OpenAI client with OpenRouter
    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
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

    const cleanedContent = cleanJsonString(content);
    const analysis = JSON.parse(cleanedContent);

    return res.status(200).json(analysis);

  } catch (error: any) {
    console.error('Analysis Error:', error);
    return res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message 
    });
  }
}

