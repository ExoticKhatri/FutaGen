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
  anime_suzume:
    "Masterpiece Quality: Makoto Shinkai / Suzume-style anime, soft luminous cel shading " +
    "with smooth gradient transitions, clean precise linework with gentle weight variation " +
    "(NOT harsh or thick outlines), high-saturation vibrant color palette with warm cinematic " +
    "light bloom, soft skin highlights, subtle ambient glow, clear material separation. " +
    "NOT dark comic style. NOT gritty. Soft, luminous, clean.",
  webtoon:
    "Masterpiece Quality: Korean webtoon / manhwa digital art, crisp clean outlines, " +
    "flat cel shading with minimal shadows, high-saturation vibrant colors, " +
    "expressive simplified features, professional manhwa studio quality.",
  dark_fantasy:
    "Masterpiece Quality: dark fantasy illustration, rich painterly Chiaroscuro lighting, " +
    "deep dramatic shadows with vibrant accent colors, atmospheric depth, " +
    "Magic the Gathering / D&D card art level of detail and craft.",
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
  minimalist:
    "Masterpiece Quality: high-contrast monochromatic design, stark silhouette, " +
    "sharp edges, deep blacks, clean digital finish.",
};

// ── Reference prompt template (Suzume style) ─────────────────────────────────
// This is the gold-standard structure the AI must follow for all styles.

const REFERENCE_EXAMPLE = `
TARGET AESTHETIC — the final image must look like this description:
A clean, professional anime character standing on a pure white background. Her skin is rendered with soft,
luminous cel shading — smooth gradient transitions from shadow to highlight with no harsh edges or banding.
Her linework is clean and precise but gentle: lines are thin and vary in weight naturally, giving the figure
a soft, polished look rather than a gritty comic-book appearance. Colors are vivid and high-saturation but
warm and harmonious, not neon or garish. Her hair flows naturally with smooth shading that suggests volume
without excessive detail. Her costume is minimal draped fabric — rendered with clean cloth folds and soft
fabric shading that clearly separates it from her skin. The horns are elegant and simple with a smooth
color gradient. The overall impression is: luminous, elegant, clean, professional anime character art —
the visual quality of a high-budget anime studio key visual or official character art sheet.
NOT: dark, gritty, harsh outlines, heavy shadows, neon colors, western comic style.
`;

// ── Main generator ────────────────────────────────────────────────────────────

export async function generateMasterPrompt(payload: PromptRequest) {
  try {
    const { composition, frame, styleId, styleDescription, backgroundDesc, traits } = payload;

    const traitsContext = Object.entries(traits)
      .filter(([, val]) => (Array.isArray(val) ? val.length > 0 : val))
      .map(([key, val]) => `  ${key.toUpperCase()}: ${Array.isArray(val) ? val.join(", ") : val}`)
      .join("\n");

    const qualityTail = STYLE_TAIL[styleId ?? ""] ?? STYLE_TAIL["anime_suzume"];

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
- STYLE LANGUAGE: When describing any visual quality for the Suzume / anime style, use words like:
  "soft luminous", "smooth gradient", "gentle cel shading", "clean precise lines", "warm ambient glow",
  "silk-smooth", "high-saturation yet harmonious", "professional anime key visual quality".
  AVOID: "sharp-edged", "harsh linework", "hard outline", "gritty", "dark comic", "stark contrast".

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
