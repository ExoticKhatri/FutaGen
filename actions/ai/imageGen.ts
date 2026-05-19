"use server";

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// gpt-image-1 supported sizes (dall-e-3 was retired 2026-05-12)
type ImageSize = "1024x1024" | "1536x1024" | "1024x1536" | "auto";

const FRAME_SIZE_MAP: Record<string, ImageSize> = {
  landscape:    "1536x1024",
  portrait:     "1024x1536",
  "three-four": "1024x1536",
  square:       "1024x1024",
  "four-three": "1024x1024",
  auto:         "auto",
};

// gpt-image-1 max prompt length
const MAX_PROMPT_CHARS = 3900;

export async function generateImage(prompt: string, frame: string) {
  const size: ImageSize = FRAME_SIZE_MAP[frame] ?? "1024x1024";
  const safePrompt = prompt.length > MAX_PROMPT_CHARS
    ? prompt.slice(0, MAX_PROMPT_CHARS)
    : prompt;

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: safePrompt,
      n: 1,
      size,
      quality: "medium",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image data in API response");

    return { success: true, imageUrl: `data:image/png;base64,${b64}` };
  } catch (error: any) {
    const detail: string =
      error?.error?.message
      ?? error?.message
      ?? "Unknown error";
    const status: number | undefined = error?.status;
    return { success: false, error: status ? `[${status}] ${detail}` : detail };
  }
}
