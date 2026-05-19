"use server";

import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { fetchAllFromTable } from "../db_fetch";
import { TraitCategory } from "@/types/traits";
import { getSystemPrompt } from "@/utils/prompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAITraits(
  tableName: TraitCategory,
  count: number,
  customPrompt: string
) {
  try {
    // 1. Fetch existing context for uniqueness
    const { data: existingData } = await fetchAllFromTable(tableName);
    const existingTitles = existingData?.map(d => d.title).join(", ") || "None";

    // 2. Retrieve the specialized system prompt from our library
    const systemPrompt = getSystemPrompt(tableName, count, existingTitles);

    // 3. Construct user message with custom instructions as priority
    const userMessage = customPrompt 
      ? `IMPORTANT INSTRUCTIONS: ${customPrompt}\n\nTask: Generate ${count} high-fidelity variants for ${tableName}.`
      : `Generate ${count} high-fidelity variants for ${tableName}.`;

    // 4. Request from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from AI");

    const parsed = JSON.parse(content);
    const finalData = Array.isArray(parsed) ? parsed : (parsed.traits || parsed.data || Object.values(parsed)[0]);

    // 5. Save to local storage for audit
    const fileName = `${tableName}_${Date.now()}.json`;
    const dirPath = path.join(process.cwd(), "data/generated");
    
    await fs.mkdir(dirPath, { recursive: true });
    
    const filePath = path.join(dirPath, fileName);
    await fs.writeFile(filePath, JSON.stringify(finalData, null, 2));

    return { 
      success: true, 
      count: finalData.length, 
      path: filePath, 
      data: finalData 
    };

  } catch (error: any) {
    console.error("AI_GEN_ERROR:", error);
    return { success: false, error: error.message };
  }
}