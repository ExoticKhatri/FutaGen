"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function refinePromptWithAI(finalSystemPrompt: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Server Error: GEMINI_API_KEY is missing.");
    return finalSystemPrompt;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // We send the prompt exactly as it appears in your UI
    const result = await model.generateContent(finalSystemPrompt);
    const response = await result.response;
    return response.text().trim();
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return finalSystemPrompt;
  }
}