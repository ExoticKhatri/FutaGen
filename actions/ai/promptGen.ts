"use server";

import OpenAI from "openai";

interface PromptRequest {
  composition:        string;
  frame:              string;
  styleId?:           string;
  styleDescription:   string;
  backgroundDesc:     string;
  backgroundId?:      string;
  traits:             Record<string, string | string[]>;
}

interface StyleConfig {
  label:      string;
  tail:       string;
  reference:  string;
  guidelines: string;
}

// "Pure white background." is intentionally removed from all tails — injected dynamically below
const STYLE_CONFIGS: Record<string, StyleConfig> = {
  glistening_anime: {
    label: "Glistening Anime",
    tail: "Masterpiece Quality: Modern premium anime illustration, sleek glistening style, perfectly crisp and bold clean black digital outlines (crisp line art, NOT sketchy), rich cel-shading with soft internal gradients, high-specular reflective glossy highlights on skin, hair, and eyes. Saturated vibrant colors, wet glistening sheen, highly defined dripping liquid/slime/viscous elements with glossy shine and glass-like transparency, extremely clean and sharp professional digital illustration quality.",
    reference: `TARGET AESTHETIC — the final image must look like this description:
A sleek, professional anime character. Her skin is rendered with detailed, smooth cel-shading and rich color gradients, adorned with realistic glossy highlights and a wet, reflective glistening sheen. Her linework consists of bold, perfectly clean black outlines that are extremely sharp and crisp digital line-art with zero sketchiness. Colors are highly saturated, vivid, and beautifully intense. Her hair has highly detailed glossy highlights and reflections suggesting a polished, almost liquid volume. Her minimal outfit is rendered with clean fabric folds, accompanied by highly defined dripping liquid, slime, or viscous elements that glisten under cinematic light, showcasing glossy highlights and transparent glass-like properties.
The overall impression is: sleek, polished, glistening, high-contrast, modern anime illustration.
NOT: sketchy lines, messy outlines, loose painterly washes, gritty textures, faded color palettes, realistic human photography.`,
    guidelines: `STYLE LANGUAGE RULES:
- Use terms like: "bold clean black digital outlines", "crisp line art", "highly reflective glistening highlights", "glossy skin", "wet glistening sheen", "glass-like transparency", "vibrant saturated colors", "rich cel-shading with soft internal gradients", "perfectly sharp professional digital illustration".
- AVOID: "sketchy lines", "fuzzy edges", "dark gritty comic book style", "loose paint washes", "watercolor blending".`,
  },
  anime_suzume: {
    label: "Suzume Anime",
    tail: "Masterpiece Quality: Makoto Shinkai / Suzume-style anime, soft luminous cel shading with smooth gradient transitions, clean precise linework with gentle weight variation (NOT harsh or thick outlines), high-saturation vibrant color palette with warm cinematic light bloom, soft skin highlights, subtle ambient glow, clear material separation. NOT dark comic style. NOT gritty. Soft, luminous, clean.",
    reference: `TARGET AESTHETIC — the final image must look like this description:
A breathtaking, cinematic anime character illustration in the signature style of Makoto Shinkai. The entire scene is bathed in a luminous, warm cinematic light bloom, creating a soft and emotional mood. The linework is extremely thin, clean, and delicate, with gentle weight variation that feels hand-drawn yet incredibly precise. Shading is a beautiful blend of soft-edged cel shading and gorgeous ambient light gradients. Colors are vibrant and highly saturated but natural, featuring warm golden hour atmosphere, soft lens flares. Skin and hair are detailed with soft, gentle specular highlights and subtle rim lighting, evoking a feeling of warm sunlight filtering through.
The overall impression is: soft, luminous, atmospheric, cinematic, clean, warm, and emotionally resonant.
NOT: thick black outlines, heavy cel shading, high-gloss wet textures, dark comic shadows, gritty textures, hand-painted watercolor bleeding.`,
    guidelines: `STYLE LANGUAGE RULES:
- Use terms like: "thin precise hand-drawn linework", "soft luminous cel shading", "cinematic light bloom", "warm golden hour atmosphere", "glowing highlights", "soft skin gradients", "highly saturated but natural colors", "atmospheric lens flares", "emotional key visual aesthetics".
- AVOID: "bold clean black outlines", "thick outlines", "dripping liquid", "wet glistening sheen", "harsh high-contrast shadows", "heavy black ink", "rough sketchy lines".`,
  },
  retro_90s_anime: {
    label: "Retro 90s Anime",
    tail: "Masterpiece Quality: Retro 1990s anime aesthetic, hand-painted cel animation look, subtle film grain, warm chromatic aberration, soft focus, dark charcoal hand-inked line art with natural weight variations, classic geometric triangle highlights on hair, vintage analog animation cell textures.",
    reference: `TARGET AESTHETIC — the final image must look like this description:
A classic, nostalgic 1990s hand-painted cel anime character. The visual style has a distinct analog feel, complete with subtle film grain, chromatic aberration, and a soft focus. Linework is done in dark charcoal hand-inked outlines with natural weight variations and slight hand-drawn imperfections. Shading consists of clean, retro hand-painted cel colors with distinct hard edges and simple two-tone shading. The color palette uses slightly warm, rich, yet naturally organic analog tones characteristic of vintage animation cells. Hair has classic geometric triangle highlight shapes, and eyes are drawn in the iconic detailed 90s style with large clean iris segments.
The overall impression is: 1990s retro anime, hand-painted cel animation, nostalgia, vintage analog aesthetic.
NOT: modern digital gradients, glossy wet surfaces, ultra-clean vector linework, photorealism, heavy 3D shading, neon glowing cyber-effects.`,
    guidelines: `STYLE LANGUAGE RULES:
- Use terms like: "vintage 1990s hand-painted cel animation aesthetic", "warm analog tones", "subtle film grain", "soft chromatic aberration", "hand-inked charcoal linework", "hard-edged cel shading", "classic geometric highlight shapes", "retro anime visual style".
- AVOID: "modern digital gradients", "high-specular glistening highlights", "dripping slime", "vector line art", "halftone dot textures", "photorealism".`,
  },
  classic_manga: {
    label: "Classic Manga",
    tail: "Masterpiece Quality: Authentic black and white Japanese manga page, professional ink illustration, sharp black pen outlines, detailed halftone screentones, cross-hatching, solid black ink shadows, high-contrast monochrome, expressive ink eyes. ZERO COLOR.",
    reference: `TARGET AESTHETIC — the final image must look like this description:
A stunning, high-contrast professional black and white manga illustration page of a single character on a clean background. The entire artwork is rendered using only black ink, crisp white space, and detailed screentone dot patterns. Linework consists of highly detailed, sharp black pen strokes with beautiful line-weight variation. Shading is achieved through precise cross-hatching, solid black fills, and delicate halftone dot textures (screentones) of varying densities. There is no color whatsoever—only pure monochrome brilliance. Eyes are incredibly expressive with deep black ink details and high-contrast white reflections.
The overall impression is: authentic black and white manga page, professional ink illustration, high-contrast monochrome.
NOT: any form of color, digital color gradients, soft watercolor washes, realistic gray shading, photorealistic details.`,
    guidelines: `STYLE LANGUAGE RULES:
- Use terms like: "professional black and white manga page", "sharp black ink outlines", "detailed halftone screentones", "cross-hatching", "solid black ink shadows", "high-contrast monochrome", "expressive ink eyes".
- AVOID: "color", "vibrant colors", "pastel", "digital gradients", "glistening highlights", "watercolor washes", "realistic gray shading", "photorealistic".`,
  },
  comic_ink: {
    label: "Comic Ink",
    tail: "Masterpiece Quality: western comic book style, bold confident ink outlines, dynamic line weight variation, flat color fills with solid black shadows, strong graphic composition, high contrast, professional comic art quality.",
    reference: `TARGET AESTHETIC — the final image must look like this description:
A bold and graphic western comic book style illustration. The character is defined by heavy, confident black ink brush strokes and outlines with dynamic line weight variation. Shading consists of stark black shadow fills (heavy inks) and clean flat color blocks with minimal gradients. Colors are punchy, highly saturated, and reminiscent of professional superhero and modern fantasy comic book graphic art.
The overall impression is: bold graphic illustration, heavy comic book inks, high contrast, flat pop colors.
NOT: soft anime gradients, glistening wet textures, watercolor washes, sketchy unrefined lines, realistic human photography.`,
    guidelines: `STYLE LANGUAGE RULES:
- Use terms like: "bold confident ink brush outlines", "heavy solid black shadows", "flat pop color fills", "high-contrast graphic composition", "professional superhero comic book style".
- AVOID: "glistening wet sheen", "soft cel-shading", "gradient fills", "delicate anime features", "photorealism".`,
  },
  concept_sketch: {
    label: "Concept Sketch",
    tail: "Masterpiece Quality: technical concept art, pure black ink linework, clean silhouette, zero shading, professional character design sheet finish.",
    reference: `TARGET AESTHETIC — the final image must look like this description:
A minimalist, highly precise character concept art design sheet on a clean background. The artwork is completely unshaded, consisting purely of clean, elegant, and intricate black ink outlines of varying line weights. Every detail is focused on capturing the perfect silhouette, anatomical precision, and detailed costume construction. There is zero color, zero shading, zero cross-hatching, and zero gradients.
The overall impression is: minimalist design sheet, pure clean black linework, anatomical precision.
NOT: colored rendering, gray shading, digital painting, watercolor washes, realistic photography, bold comic fills.`,
    guidelines: `STYLE LANGUAGE RULES:
- Use terms like: "pure black ink outlines", "intricate line weight", "elegant linework", "zero shading", "clean silhouette", "character design sheet style", "minimalist art".
- AVOID: "any colors", "gray scale shading", "cel shading", "gradient fills", "wet textures", "screentones".`,
  },
  watercolor: {
    label: "Watercolor Fantasy",
    tail: "Masterpiece Quality: soft watercolor fantasy illustration, flowing paint washes, visible paper texture, delicate color bleeding at edges, loose expressive brushwork with clean ink outlines, Japanese fantasy illustration quality.",
    reference: `TARGET AESTHETIC — the final image must look like this description:
A delicate, dreamy Japanese watercolor fantasy illustration on a textured cold-press paper background. The style features flowing watercolor paint washes with beautiful organic color bleeding at the edges and visible paper grain textures. Linework is soft and loose, drawn with fine ink pen lines that are occasionally dissolved or broken by the paint. Shading is soft, painterly, and ambient, relying on the natural transparency and blending of the watercolor pigments rather than digital gradients. Colors are soft, rich, and slightly muted, with a magical, whimsical fantasy feel.
The overall impression is: traditional hand-painted watercolor, organic texture, delicate paper bleeding, whimsical fantasy.
NOT: bold black digital outlines, plastic glistening textures, wet slime, hard-edged cel shading, high-contrast comic inks, photorealism.`,
    guidelines: `STYLE LANGUAGE RULES:
- Use terms like: "flowing watercolor paint washes", "organic color bleeding", "cold-press paper texture", "loose delicate ink outlines", "transparent pigment layering", "whimsical fantasy illustration".
- AVOID: "bold black digital outlines", "glossy wet sheen", "hard-edged cel shading", "flat vector colors".`,
  },
  ultra_realistic: {
    label: "Cinematic Photo",
    tail: "Masterpiece Quality: hyper-realistic photography, 85mm lens f/1.8, visible skin texture, Chiaroscuro lighting, 8K resolution, cinematic color grading.",
    reference: `TARGET AESTHETIC — the final image must look like this description:
A hyper-realistic, stunning photographic portrait of a fantasy character captured on a professional high-end camera. The lighting is dramatic Chiaroscuro, casting natural, deep shadows and soft, rich highlights across the face and body. Shot with a high-end 85mm f/1.8 prime lens, creating a pin-sharp focus on the character's face with a buttery, out-of-focus background. The image showcases flawless, hyper-detailed skin texture (with fine pores, natural peach fuzz, and subtle imperfections), realistic wet eye reflections, and individual strands of hair. Colors are professionally color-graded with natural skin tones and organic lighting.
The overall impression is: 8K hyper-realistic photograph, cinematic lighting, extreme anatomical and textural detail.
NOT: anime line-art, digital cel shading, cartoon outlines, flat illustration styles, black ink strokes, watercolor painting.`,
    guidelines: `STYLE LANGUAGE RULES:
- Use terms like: "hyper-realistic photography", "cinematic Chiaroscuro lighting", "visible skin pores", "fine textures", "85mm prime lens depth of field", "natural reflections", "organic color grading".
- AVOID: "outlines", "linework", "cel shading", "flat colors", "cartoon styles", "drawing", "painting".`,
  },
};

export async function generateMasterPrompt(payload: PromptRequest, customApiKey?: string) {
  try {
    const apiKey = customApiKey;
    if (!apiKey) {
      return { success: false, error: "OpenAI API Key is missing. Please set it in Settings.", rawInput: "" };
    }
    const openai = new OpenAI({ apiKey });
    const { composition, frame, styleId, styleDescription, backgroundDesc, backgroundId, traits } = payload;

    const traitsContext = Object.entries(traits)
      .filter(([, val]) => (Array.isArray(val) ? val.length > 0 : val))
      .map(([key, val]) => `  ${key.toUpperCase()}: ${Array.isArray(val) ? val.join(", ") : val}`)
      .join("\n");

    const config = STYLE_CONFIGS[styleId ?? ""] ?? STYLE_CONFIGS["glistening_anime"];
    const styleName = config.label;

    const isWhiteBg = !backgroundId || backgroundId === 'plain_white';
    const bgRule = isWhiteBg
      ? `- Background: pure white only — no setting, no environment, no floor, no shadows, nothing behind the character.`
      : `- Background: follow the provided background description exactly; generate a rich atmospheric environment that complements the character's traits and art style.`;

    // Append "Pure white background." to the quality tail only when applicable
    const qualityTail = isWhiteBg
      ? `${config.tail} Pure white background.`
      : config.tail;

    const systemInstruction = `
You are an expert AI image prompt engineer specialising in anime and fantasy character art.

YOUR TASK: Write a single, high-quality image generation prompt for a demon lady character rendered in **${styleName}** style.

CRITICAL — STYLE IDENTITY:
The VERY FIRST words of your prompt MUST be: "${styleName} style:" — this is mandatory so the image model immediately locks onto the correct artistic rendering mode.

STRUCTURE — follow this order exactly:
1. Opening: "${styleName} style:" then shot type (${composition}), frame ratio (${frame}), one character only, no text, no watermark, no shoes.
2. SKIN — colour, texture, how light interacts with it according to the ${styleName} style.
3. FACE — describe the specific face trait in vivid detail rendered in ${styleName} style.
4. HAIR — style, movement, length, texture as it would appear in ${styleName} rendering.
5. HORNS — shape, material, colour gradient, size.
6. BODY — physique, proportions, anatomy quality (strong, defined, clear structure).
7. OUTFIT — minimal fantasy costume covering roughly 20–30% of the body; describe fabric, material effects, any drip/glow/liquid effects appropriate to ${styleName}.
8. SPECIAL TRAITS — if any are listed, integrate them naturally into the description.
9. POSE — dynamic or elegant; describe body language and energy.
10. BACKGROUND — use this description exactly: ${backgroundDesc}
11. QUALITY TAIL — end with the style-specific masterpiece quality tags (provided below).

RULES:
- 500–650 words. Not shorter, not longer.
${bgRule}
- No nudity, no explicit content. The outfit is minimal fantasy costume, not absence of clothing.
- No shoes / footwear of any kind.
- No extra limbs unless a SPECIAL trait explicitly demands it.
- Never use words: revealing, skin-tight, naked, nude, exposed, explicit.
- One character only — never mention multiple figures.
- Write in flowing, vivid prose (not bullet points).
- Every artistic detail (linework, shading, textures, lighting) MUST be described using the vocabulary specific to ${styleName} — not generic terms.
- ${config.guidelines}

QUALITY TAIL TO APPEND VERBATIM AT THE END:
${qualityTail}

${config.reference}
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
      temperature: 0.80,
    });

    const content = JSON.parse(response.choices[0].message.content || "{}");

    return { success: true, prompt: content.prompt as string, rawInput: userMessage };
  } catch (error: any) {
    console.error("PROMPT_GEN_ERROR:", error);
    return { success: false, error: error.message as string, rawInput: "" };
  }
}
