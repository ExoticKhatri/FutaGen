"use server";

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PromptRequest {
  composition:        string;
  frame:              string;
  styleId?:           string;
  styleDescription:   string;
  backgroundDesc:     string;
  traits:             Record<string, string | string[]>;
}

// ── Style-specific quality tail tags ─────────────────────────────────────────

const STYLE_TAIL: Record<string, string> = {
  glistening_anime:
    "Masterpiece Quality: Modern premium anime illustration, sleek glistening style, " +
    "perfectly crisp and bold clean black digital outlines (crisp line art, NOT sketchy), " +
    "rich cel-shading with soft internal gradients, high-specular reflective glossy highlights " +
    "on skin, hair, and eyes. Saturated vibrant colors, wet glistening sheen, highly defined " +
    "dripping liquid/slime/viscous elements with glossy shine and glass-like transparency, " +
    "extremely clean and sharp professional digital illustration quality. Pure white background.",
  anime_suzume:
    "Masterpiece Quality: Makoto Shinkai / Suzume-style anime, soft luminous cel shading " +
    "with smooth gradient transitions, clean precise linework with gentle weight variation " +
    "(NOT harsh or thick outlines), high-saturation vibrant color palette with warm cinematic " +
    "light bloom, soft skin highlights, subtle ambient glow, clear material separation. " +
    "NOT dark comic style. NOT gritty. Soft, luminous, clean.",
  watercolor:
    "Masterpiece Quality: soft watercolor fantasy illustration, flowing paint washes, " +
    "visible paper texture, delicate color bleeding at edges, " +
    "loose expressive brushwork with clean ink outlines, Japanese fantasy illustration quality.",
  comic_ink:
    "Masterpiece Quality: western comic book style, bold confident ink outlines, " +
    "dynamic line weight variation, flat color fills with solid black shadows, " +
    "strong graphic composition, high contrast, professional comic art quality.",
  concept_sketch:
    "Masterpiece Quality: technical concept art, pure black ink linework, " +
    "clean silhouette, zero shading, professional character design sheet finish.",
  ultra_realistic:
    "Masterpiece Quality: hyper-realistic photography, 85mm lens f/1.8, " +
    "visible skin texture, Chiaroscuro lighting, 8K resolution, cinematic color grading.",
};

// ── Reference prompt template (Glistening Anime style) ───────────────────────
// This is the gold-standard structure the AI must follow for all styles.

const REFERENCE_EXAMPLE = `
TARGET AESTHETIC — the final image must look like this description:
A sleek, professional anime character standing on a pure white background. Her skin is rendered with detailed,
smooth cel-shading and rich color gradients, adorned with realistic glossy highlights and a wet, reflective glistening sheen.
Her linework consists of bold, perfectly clean black outlines that are extremely sharp and crisp digital line-art with zero sketchiness.
Colors are highly saturated, vivid, and beautifully intense. Her hair has highly detailed glossy highlights and reflections suggesting a polished,
almost liquid volume. Her minimal outfit is rendered with clean fabric folds, accompanied by highly defined dripping liquid, slime, or viscous
elements that glisten under cinematic light, showcasing glossy highlights and transparent glass-like properties.
The overall impression is: sleek, polished, glistening, high-contrast, modern anime illustration.
NOT: sketchy lines, messy outlines, loose painterly washes, gritty textures, faded color palettes, realistic human photography.
`;

// ── Main generator ────────────────────────────────────────────────────────────

export async function generateMasterPrompt(payload: PromptRequest) {
  try {
    const { composition, frame, styleId, styleDescription, backgroundDesc, traits } = payload;

    const traitsContext = Object.entries(traits)
      .filter(([, val]) => (Array.isArray(val) ? val.length > 0 : val))
      .map(([key, val]) => `  ${key.toUpperCase()}: ${Array.isArray(val) ? val.join(", ") : val}`)
      .join("\n");

    const qualityTail = STYLE_TAIL[styleId ?? ""] ?? STYLE_TAIL["glistening_anime"];

    const systemInstruction = `
You are an expert AI image prompt engineer specialising in anime and fantasy character art.

YOUR TASK: Write a single, high-quality image generation prompt for a demon lady character.

STRUCTURE — follow this order exactly:
1. Opening line: shot type (${composition}), frame ratio (${frame}), white background, one character only, no text, no watermark, no shoes.
2. SKIN — colour, texture, how light interacts with it.
3. FACE — describe the specific face trait in vivid detail.
4. HAIR — style, movement, length, texture.
5. HORNS — shape, material, colour gradient, size.
6. BODY — physique, proportions, anatomy quality (strong, defined, clear structure).
7. OUTFIT — minimal fantasy costume covering roughly 20–30% of the body; describe fabric, material effects, any drip/glow/liquid effects.
8. SPECIAL TRAITS — if any are listed, integrate them naturally into the description.
9. POSE — dynamic or elegant; describe body language and energy.
10. BACKGROUND — use this description exactly: ${backgroundDesc}
11. QUALITY TAIL — end with the style-specific masterpiece quality tags (provided below).

RULES:
- 350–450 words. Not shorter, not longer.
- Pure white background — never describe a setting, environment, or floor.
- No nudity, no explicit content. The outfit is minimal fantasy costume, not absence of clothing.
- No shoes / footwear of any kind.
- No extra limbs unless a SPECIAL trait explicitly demands it.
- Never use words: revealing, skin-tight, naked, nude, exposed, explicit.
- One character only — never mention multiple figures.
- Write in flowing, vivid prose (not bullet points).
- STYLE LANGUAGE: When describing any visual quality for the Glistening Anime style, use words like:
  "bold clean black digital outlines", "crisp line art", "highly reflective glistening highlights",
  "glossy skin", "wet glistening sheen", "glass-like transparency", "vibrant saturated colors",
  "rich cel-shading with soft internal gradients", "perfectly sharp professional digital illustration".
  AVOID: "sketchy lines", "fuzzy edges", "dark gritty comic book style", "loose paint washes".

QUALITY TAIL TO APPEND VERBATIM AT THE END:
${qualityTail}

${REFERENCE_EXAMPLE}
`;

    const userMessage = `
Generate the prompt now using these character specifications:

[FRAME & COMPOSITION]
- Ratio: ${frame}
- Shot type: ${composition}

[BACKGROUND]
${backgroundDesc}

[ARTISTIC STYLE]
${styleDescription}

[CHARACTER TRAITS]
${traitsContext}

OUTPUT FORMAT — return only this JSON:
{ "prompt": "the full prompt text here" }
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user",   content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.75,
    });

    const content = JSON.parse(response.choices[0].message.content || "{}");

    return { success: true, prompt: content.prompt as string, rawInput: userMessage };
  } catch (error: any) {
    console.error("PROMPT_GEN_ERROR:", error);
    return { success: false, error: error.message as string, rawInput: "" };
  }
}
