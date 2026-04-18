"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_CORE = `Single original full-body anime-style demon woman centered on pure white background. 
One character only, no text, no watermark, no shoes. 
Clean high-resolution sharp-lined anime illustration, hard-edged shading, strong anatomy, clear material separation.`;

const FEMININE_MORPHOLOGY = `Feminine morphology: elegant bone structure, refined jawline, feminine eyes with lashes. 
Chest: Mandatory large feminine breasts, fabric must frame or tension around volume naturally. 
No masculine features.`;

const LIQUID_PROTOCOL = `Ground Protocol: Glossy, viscous gooey liquid pooling beneath feet. 
Liquid drips only from lower fabric folds (below belly). 
Hard anime highlights on liquid, color must harmonize with palette but remain distinct from clothing.`;

const ART_STYLE = `Style: Sharp confident linework, hard light shading, high clarity, no painterly blur, no sketch roughness, vertical ratio.`;

export async function buildSystemPrompt(traitString: string): Promise<string> {
  if (!traitString) return "";

  const userTraits = traitString
    .split(',')
    .map(t => t.trim())
    .join(', ');

  const finalPrompt = [
    SYSTEM_CORE,
    `Character Traits: ${userTraits}`,
    FEMININE_MORPHOLOGY,
    LIQUID_PROTOCOL,
    ART_STYLE,
    "Strict: Pure white background, no environmental elements, no explicit exposure."
  ].join('\n\n');

  return finalPrompt;
}

export async function refinePromptWithAI(systemPrompt: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Server Error: GEMINI_API_KEY is missing in environment variables.");
    return systemPrompt;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemInstruction = `
      You are a specialized prompt engineer for high-end anime image generation.
      Your goal is to take the following system base prompt and convert it into a seamless, highly descriptive cohesive prompt.

      STRICT RULES:
      1. Start the prompt EXACTLY with: "Create a single, original, full-body anime-style demon character centered on a pure white background."
      2. Include: "The image must contain only one character, no text, no watermark, no shoes, and no environmental elements beyond a subtle ground contact surface formed by liquid."
      3. Describe: "clean, high-resolution, sharp-lined, vibrant anime illustration, hard-edged shading, strong anatomy, clear material separation, vertical ratio."
      4. Append EXACTLY at the end: "Use any provided reference images STRICTLY FOR ART INSPIRATION ONLY (line quality, rendering finish, shading discipline). Do not copy pose, proportions, anatomy, clothing structure, horn shapes, facial features, or any identifiable design elements from references."
      5. Seamlessly integrate the traits provided between the start and end instructions, expanding them with descriptive adjectives appropriate for high-quality anime art.
      6. If character is interacting with something like seated on somthing then show then include that prop also in the prompt the resultent image should not be like the character is seated on.
      7. make sure the clothing should always be minimal and should not be covering more then 20 to 30 percent of the body if its a transparent then its fine.
      
      SYSTEM PROMPT TO INTEGRATE: 
      ---
      ${systemPrompt}
      ---
    `;

    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    const refinedText = response.text();

    return refinedText.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return systemPrompt;
  }
}
