"use server";

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// dall-e-3 supports only these three sizes
type DalleSize = "1024x1024" | "1792x1024" | "1024x1792";

const FRAME_SIZE_MAP: Record<string, DalleSize> = {
  landscape:    "1792x1024",
  portrait:     "1024x1792",
  "three-four": "1024x1792",
  square:       "1024x1024",
  "four-three": "1024x1024",
  auto:         "1024x1024",
};

export async function generateImage(prompt: string, frame: string) {
  const size: DalleSize = FRAME_SIZE_MAP[frame] ?? "1024x1024";

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality: "hd",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) throw new Error("No image URL returned from API");

    return { success: true, imageUrl };
  } catch (error: any) {
    return { success: false, error: error.message as string };
  }
}
