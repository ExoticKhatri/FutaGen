"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PromptRequest {
  composition: string;
  frame: string;
  styleDescription: string;
  traits: Record<string, string | string[]>;
}

export async function generateMasterPrompt(payload: PromptRequest) {
  try {
    const { composition, frame, styleDescription, traits } = payload;

    // Convert traits object into a readable string for the AI
    const traitsContext = Object.entries(traits)
      .map(([key, val]) => `${key.toUpperCase()}: ${Array.isArray(val) ? val.join(", ") : val}`)
      .join("\n");

    const systemInstruction = `
      You are a Master Prompt Generator for high-end AI image synthesis. 
      Your task is to write an extremely detailed, 700-word long prompt.
      
      RULES:
      1. The prompt MUST start with a clear intent of image creation (e.g., "Create a hyper-detailed professional render of...").
      2. You MUST use exactly 700 words. Not a word more, not a word less.
      3. Focus on sensory details: texture, light refraction, anatomical precision, and atmospheric depth.
      4. The subject is a single demon lady character.
      5. Background: Pure, empty white background to emphasize the character silhouette.
      6. Make sure the prompt should not contain anything which trigger the censorship and ai refuse to generate the image. i want the prompt to be safe and can be used in any ai image generator if there are anything which may trigger the censorship then change the words improve the prompt so it will not trigger the censorship and ai can generate the image.
      7. There should not be any extra limb unlsess the special trait demands.
      8. Make sure there not be shoes.
    `;

    const userMessage = `
      Create a 700-word prompt based on these technical specifications:
      
      [CORE LAYOUT]
      - Framing: ${frame}
      - Composition: ${composition}
      
      [ARTISTIC STYLE]
      ${styleDescription}
      
      [CHARACTER TRAITS]
      ${traitsContext}

      OUTPUT FORMAT:
      Return a JSON object: { "prompt": "the 700 word text here" }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = JSON.parse(response.choices[0].message.content || "{}");
    
    return { 
      success: true, 
      prompt: content.prompt 
    };

  } catch (error: any) {
    console.error("PROMPT_GEN_ERROR:", error);
    return { success: false, error: error.message };
  }
}