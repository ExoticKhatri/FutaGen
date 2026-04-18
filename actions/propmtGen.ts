"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function refinePromptWithAI(basePrompt: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Server Error: GEMINI_API_KEY is missing in environment variables.");
    return basePrompt;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const systemInstruction = `
      You are a specialized prompt engineer for high-end anime image generation.
      Your goal is to take character traits and convert them into a professional, descriptive prompt.

      STRICT RULES:
      1. Start the prompt EXACTLY with: "Create a single, original, full-body anime-style demon character centered on a pure white background."
      2. Include: "The image must contain only one character, no text, no watermark, no shoes, and no environmental elements beyond a subtle ground contact surface formed by liquid."
      3. Describe: "clean, high-resolution, sharp-lined, vibrant anime illustration, hard-edged shading, strong anatomy, clear material separation, vertical ratio."
      4. Append EXACTLY at the end: "Use any provided reference images STRICTLY FOR ART INSPIRATION ONLY (line quality, rendering finish, shading discipline). Do not copy pose, proportions, anatomy, clothing structure, horn shapes, facial features, or any identifiable design elements from references."
      5. Seamlessly integrate the following user traits between the start and end instructions, expanding them with descriptive adjectives appropriate for high-quality anime art.
      6. If character is interacting with something like seated on somthing then show then include that prop also in the prompt the resultent image should not be like the character is seated on.
      7. make sure the clothing should always be minimal and should not be covering more then 20 to 30 percent of the body if its a trnsparent then its fine.
      
      USER TRAITS TO INTEGRATE: ${basePrompt}
    `;

    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    const refinedText = response.text();

    return refinedText.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return basePrompt; // Fallback to raw prompt if AI fails
  }
}