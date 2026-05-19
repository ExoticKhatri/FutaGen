"use server";

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// gpt-image-2 supports custom sizes: width & height must be divisible by 16,
// aspect ratio between 1:3 and 3:1. Safe max before experimental tier: 2560px per axis.
const FRAME_SIZE_MAP: Record<string, string> = {
  landscape:    "2560x1440", // 16:9
  "four-three": "2560x1920", // 4:3
  square:       "2048x2048", // 1:1
  "three-four": "1920x2560", // 3:4
  portrait:     "1440x2560", // 9:16
  auto:         "auto",
};

const MAX_PROMPT_CHARS = 3900;

export async function generateImage(prompt: string, frame: string) {
  const size = FRAME_SIZE_MAP[frame] ?? "2048x2048";
  const safePrompt = prompt.length > MAX_PROMPT_CHARS
    ? prompt.slice(0, MAX_PROMPT_CHARS)
    : prompt;

  try {
    const response = await openai.images.generate({
      model:   "gpt-image-2",
      prompt:  safePrompt,
      n:       1,
      size:    size as Parameters<typeof openai.images.generate>[0]["size"],
      quality: "high",
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
