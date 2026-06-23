"use server";

import OpenAI from "openai";

// ── Style configs ─────────────────────────────────────────────────────────────

interface StyleConfig {
  label:      string;
  tail:       string;
  reference:  string;
  guidelines: string;
}

// "Pure white background." is intentionally omitted from tails — injected dynamically in Stage 2
const STYLE_CONFIGS: Record<string, StyleConfig> = {
  glistening_anime: {
    label: "Glistening Anime",
    tail: "Masterpiece Quality: Modern premium anime illustration, sleek glistening style, perfectly crisp and bold clean black digital outlines (crisp line art, NOT sketchy), rich cel-shading with soft internal gradients, high-specular reflective glossy highlights on skin, hair, and eyes. Saturated vibrant colors, wet glistening sheen, highly defined dripping liquid/slime/viscous elements with glossy shine and glass-like transparency, extremely clean and sharp professional digital illustration quality.",
    reference: `TARGET AESTHETIC:
A sleek, professional anime character. Her skin is rendered with smooth cel-shading and rich color gradients, adorned with glossy highlights and a wet, reflective glistening sheen. Linework is bold, perfectly clean black outlines — extremely sharp crisp digital line-art, zero sketchiness. Colors are highly saturated, vivid, and beautifully intense. Her hair has highly detailed glossy highlights suggesting a polished, almost liquid volume. Outfit is rendered with clean fabric folds accompanied by highly defined dripping liquid/slime/viscous elements that glisten with glossy highlights and transparent glass-like properties.
Overall impression: sleek, polished, glistening, high-contrast, modern anime illustration.
NOT: sketchy lines, messy outlines, loose painterly washes, gritty textures, faded colors, realistic photography.`,
    guidelines: `STYLE VOCABULARY:
USE: "bold clean black digital outlines", "crisp line art", "highly reflective glistening highlights", "glossy skin", "wet glistening sheen", "glass-like transparency", "vibrant saturated colors", "rich cel-shading with soft internal gradients", "perfectly sharp professional digital illustration".
AVOID: "sketchy lines", "fuzzy edges", "dark gritty comic style", "loose paint washes", "watercolor blending".`,
  },
  anime_suzume: {
    label: "Suzume Anime",
    tail: "Masterpiece Quality: Makoto Shinkai / Suzume-style anime, soft luminous cel shading with smooth gradient transitions, clean precise linework with gentle weight variation (NOT harsh or thick outlines), high-saturation vibrant color palette with warm cinematic light bloom, soft skin highlights, subtle ambient glow, clear material separation. NOT dark comic style. NOT gritty. Soft, luminous, clean.",
    reference: `TARGET AESTHETIC:
A breathtaking cinematic anime character in the style of Makoto Shinkai. The scene is bathed in luminous warm cinematic light bloom. Linework is extremely thin, clean, and delicate with gentle weight variation — hand-drawn yet incredibly precise. Shading is a beautiful blend of soft-edged cel shading and gorgeous ambient light gradients. Colors are vibrant, highly saturated but natural, with warm golden hour atmosphere and soft lens flares. Skin and hair have soft gentle specular highlights and subtle rim lighting.
Overall impression: soft, luminous, atmospheric, cinematic, clean, warm, emotionally resonant.
NOT: thick black outlines, heavy cel shading, high-gloss wet textures, dark comic shadows, gritty textures.`,
    guidelines: `STYLE VOCABULARY:
USE: "thin precise hand-drawn linework", "soft luminous cel shading", "cinematic light bloom", "warm golden hour atmosphere", "glowing highlights", "soft skin gradients", "highly saturated but natural colors", "atmospheric lens flares".
AVOID: "bold clean black outlines", "thick outlines", "dripping liquid", "wet glistening sheen", "harsh high-contrast shadows", "heavy black ink".`,
  },
  retro_90s_anime: {
    label: "Retro 90s Anime",
    tail: "Masterpiece Quality: Retro 1990s anime aesthetic, hand-painted cel animation look, subtle film grain, warm chromatic aberration, soft focus, dark charcoal hand-inked line art with natural weight variations, classic geometric triangle highlights on hair, vintage analog animation cell textures.",
    reference: `TARGET AESTHETIC:
A classic nostalgic 1990s hand-painted cel anime character. The visual style has a distinct analog feel — subtle film grain, chromatic aberration, soft focus. Linework is dark charcoal hand-inked outlines with natural weight variations and slight hand-drawn imperfections. Shading is clean retro hand-painted cel colors with distinct hard edges and simple two-tone shading. Warm, rich, naturally organic analog tones. Hair has classic geometric triangle highlight shapes, eyes drawn in the iconic detailed 90s style.
Overall impression: 1990s retro anime, hand-painted cel animation, nostalgia, vintage analog.
NOT: modern digital gradients, glossy wet surfaces, ultra-clean vector linework, photorealism, neon cyber-effects.`,
    guidelines: `STYLE VOCABULARY:
USE: "vintage 1990s hand-painted cel animation aesthetic", "warm analog tones", "subtle film grain", "soft chromatic aberration", "hand-inked charcoal linework", "hard-edged cel shading", "classic geometric highlight shapes".
AVOID: "modern digital gradients", "high-specular glistening highlights", "dripping slime", "vector line art", "photorealism".`,
  },
  classic_manga: {
    label: "Classic Manga",
    tail: "Masterpiece Quality: Authentic black and white Japanese manga page, professional ink illustration, sharp black pen outlines, detailed halftone screentones, cross-hatching, solid black ink shadows, high-contrast monochrome, expressive ink eyes. ZERO COLOR.",
    reference: `TARGET AESTHETIC:
A stunning high-contrast professional black and white manga illustration page. Rendered using only black ink, crisp white space, and detailed screentone dot patterns. Linework consists of sharp black pen strokes with beautiful line-weight variation. Shading is achieved through precise cross-hatching, solid black fills, and delicate halftone dot screentones. No color whatsoever — pure monochrome brilliance. Eyes are incredibly expressive with deep black ink details.
Overall impression: authentic black and white manga page, professional ink illustration, high-contrast monochrome.
NOT: any color, digital gradients, watercolor washes, realistic gray shading, photorealism.`,
    guidelines: `STYLE VOCABULARY:
USE: "professional black and white manga page", "sharp black ink outlines", "detailed halftone screentones", "cross-hatching", "solid black ink shadows", "high-contrast monochrome".
AVOID: "color", "vibrant colors", "digital gradients", "glistening highlights", "watercolor washes", "photorealistic".`,
  },
  comic_ink: {
    label: "Comic Ink",
    tail: "Masterpiece Quality: western comic book style, bold confident ink outlines, dynamic line weight variation, flat color fills with solid black shadows, strong graphic composition, high contrast, professional comic art quality.",
    reference: `TARGET AESTHETIC:
A bold graphic western comic book style illustration. Heavy, confident black ink brush strokes and outlines with dynamic line weight variation. Shading consists of stark black shadow fills and clean flat color blocks with minimal gradients. Colors are punchy, highly saturated, reminiscent of professional superhero and fantasy comic graphic art.
Overall impression: bold graphic illustration, heavy comic book inks, high contrast, flat pop colors.
NOT: soft anime gradients, glistening wet textures, watercolor washes, sketchy unrefined lines.`,
    guidelines: `STYLE VOCABULARY:
USE: "bold confident ink brush outlines", "heavy solid black shadows", "flat pop color fills", "high-contrast graphic composition", "professional superhero comic book style".
AVOID: "glistening wet sheen", "soft cel-shading", "gradient fills", "delicate anime features".`,
  },
  concept_sketch: {
    label: "Concept Sketch",
    tail: "Masterpiece Quality: technical concept art, pure black ink linework, clean silhouette, zero shading, professional character design sheet finish.",
    reference: `TARGET AESTHETIC:
A minimalist highly precise character concept art design sheet on a clean background. Completely unshaded — purely clean elegant black ink outlines of varying line weights. Every detail focused on perfect silhouette, anatomical precision, and detailed costume construction. Zero color, zero shading, zero cross-hatching, zero gradients.
Overall impression: minimalist design sheet, pure clean black linework, anatomical precision.
NOT: colored rendering, gray shading, digital painting, watercolor washes, bold comic fills.`,
    guidelines: `STYLE VOCABULARY:
USE: "pure black ink outlines", "intricate line weight", "elegant linework", "zero shading", "clean silhouette", "character design sheet style", "minimalist art".
AVOID: "any colors", "gray scale shading", "cel shading", "gradient fills", "wet textures".`,
  },
  watercolor: {
    label: "Watercolor Fantasy",
    tail: "Masterpiece Quality: soft watercolor fantasy illustration, flowing paint washes, visible paper texture, delicate color bleeding at edges, loose expressive brushwork with clean ink outlines, Japanese fantasy illustration quality.",
    reference: `TARGET AESTHETIC:
A delicate dreamy Japanese watercolor fantasy illustration on textured cold-press paper. Flowing watercolor paint washes with beautiful organic color bleeding at the edges and visible paper grain textures. Linework is soft and loose with fine ink pen lines occasionally dissolved by the paint. Shading is soft, painterly, and ambient. Colors are soft, rich, and slightly muted with a magical whimsical feel.
Overall impression: traditional hand-painted watercolor, organic texture, delicate paper bleeding, whimsical fantasy.
NOT: bold black digital outlines, plastic glistening textures, wet slime, hard-edged cel shading, photorealism.`,
    guidelines: `STYLE VOCABULARY:
USE: "flowing watercolor paint washes", "organic color bleeding", "cold-press paper texture", "loose delicate ink outlines", "transparent pigment layering", "whimsical fantasy illustration".
AVOID: "bold black digital outlines", "glossy wet sheen", "hard-edged cel shading", "flat vector colors".`,
  },
  ultra_realistic: {
    label: "Cinematic Photo",
    tail: "Masterpiece Quality: hyper-realistic photography, 85mm lens f/1.8, visible skin texture, Chiaroscuro lighting, 8K resolution, cinematic color grading.",
    reference: `TARGET AESTHETIC:
A hyper-realistic stunning photographic portrait captured on a professional high-end camera. Dramatic Chiaroscuro lighting casting natural deep shadows and soft rich highlights. Shot with an 85mm f/1.8 prime lens — pin-sharp focus on the face with buttery out-of-focus background. Flawless hyper-detailed skin texture (fine pores, natural peach fuzz, subtle imperfections), realistic wet eye reflections, individual hair strands. Professionally color-graded with natural skin tones.
Overall impression: 8K hyper-realistic photograph, cinematic lighting, extreme anatomical and textural detail.
NOT: anime line-art, digital cel shading, cartoon outlines, flat illustration styles, black ink strokes, watercolor painting.`,
    guidelines: `STYLE VOCABULARY:
USE: "hyper-realistic photography", "cinematic Chiaroscuro lighting", "visible skin pores", "fine textures", "85mm prime lens depth of field", "natural reflections", "organic color grading".
AVOID: "outlines", "linework", "cel shading", "flat colors", "cartoon styles", "drawing", "painting".`,
  },
  minimal: {
    label: "Minimal",
    tail: "Masterpiece Quality: minimalist cartoon illustration, bold clean black outlines, flat solid colors, zero shading, zero texture, simple iconic shapes, strong memorable silhouette, easy-to-read character design.",
    reference: `TARGET AESTHETIC:
A clean minimalist cartoon character illustration. Linework is bold, confident, and uniform — simple closed outlines with no texture or weight variation. Zero shading, zero gradients, zero rendering detail. Colors are flat solid fills chosen for instant readability: limited palette of 3–5 bold, distinct colors. Every body part — face, hair, outfit, horns — is reduced to its most iconic geometric shape. Eyes are simple dots or small shapes. Hair is a clean solid silhouette. The character reads instantly as a strong recognizable figure even at thumbnail size, like a timeless cartoon mascot.
Overall impression: flat minimalist cartoon, bold solid outlines, 4-color palette, zero detail, strong silhouette readability.
NOT: shading, gradients, texture, painterly strokes, fine linework, cel shading highlights, photorealism, detailed rendering, multiple tones per area.`,
    guidelines: `STYLE VOCABULARY:
USE: "minimalist cartoon illustration", "bold uniform outlines", "flat solid colors", "zero shading", "simple iconic shapes", "limited color palette", "strong silhouette", "geometric simplified forms", "clean readable design".
AVOID: "shading", "gradients", "cel shading", "textures", "detailed linework", "photorealism", "painterly", "highlights", "shadow rendering", "complex details".`,
  },
};

// ── Safety word replacement map ───────────────────────────────────────────────

const SAFETY_REPLACEMENTS: Array<[RegExp, string]> = [
  // Phrases (checked before single words)
  [/\bbare breasts?\b/gi,               "chest"],
  [/\bbare chest\b/gi,                  "visible chest"],
  [/\bbare skin\b/gi,                   "visible skin"],
  [/\bbare (torso|midriff|abdomen|stomach)\b/gi, "visible $1"],
  // Single words
  [/\bnude\b/gi,                        "costumed"],
  [/\bnaked\b/gi,                       "minimally dressed"],
  [/\btopless\b/gi,                     "minimally dressed"],
  [/\bbottomless\b/gi,                  "wearing minimal lower attire"],
  [/\bundressed\b/gi,                   "costumed"],
  [/\bundressing\b/gi,                  "posing"],
  [/\bexposed\b/gi,                     "visible"],
  [/\brevealing\b/gi,                   "minimal"],
  [/\bskin-tight\b/gi,                  "form-fitting"],
  [/\bskintight\b/gi,                   "form-fitting"],
  [/\bexplicit\b/gi,                    "bold"],
  [/\berotic\b/gi,                      "captivating"],
  [/\bsexual\b/gi,                      "fantasy"],
  [/\bnsfw\b/gi,                        ""],
  [/\baroused\b/gi,                     "composed"],
  [/\bseductive\b/gi,                   "alluring"],
  [/\bsensual\b/gi,                     "elegant"],
  [/\bintimate\b/gi,                    "close"],
  [/\bprovocative\b/gi,                 "striking"],
  [/\blascivious\b/gi,                  "striking"],
  [/\blustful\b/gi,                     "intense"],
  [/\bnipples?\b/gi,                    "chest details"],
  [/\bgenitals?\b/gi,                   "lower body"],
  [/\bgroin\b/gi,                       "hip area"],
  [/\bcrotch\b/gi,                      "hip area"],
  [/\bbuttocks\b/gi,                    "figure"],
  [/\bcleavage\b/gi,                    "neckline"],
];

// ── Shared result type ────────────────────────────────────────────────────────

export interface PromptStageResult {
  success:   boolean;
  prompt?:   string;
  error?:    string;
  rawInput?: string;
}

// ── Input types ───────────────────────────────────────────────────────────────

export interface CharacterPromptInput {
  composition:   string;
  frame:         string;
  backgroundDesc: string;
  traits:        Record<string, string | string[]>;
}

export interface ArtStyleInput {
  draft:      string;
  styleId:    string;
  isWhiteBg:  boolean;
}

export interface SafetyInput {
  draft: string;
}

// ── Stage 1: Build character description ─────────────────────────────────────

export async function buildCharacterPrompt(
  input: CharacterPromptInput,
  customApiKey?: string,
): Promise<PromptStageResult> {
  if (!customApiKey) return { success: false, error: "OpenAI API Key is missing. Please set it in Settings." };

  const { composition, frame, backgroundDesc, traits } = input;

  const traitsContext = Object.entries(traits)
    .filter(([, val]) => (Array.isArray(val) ? val.length > 0 : val))
    .map(([key, val]) => `  ${key.toUpperCase()}: ${Array.isArray(val) ? val.join(", ") : val}`)
    .join("\n");

  const system = `You are an expert fantasy character description writer for AI image generation.

Write a vivid, detailed image generation prompt for a demon lady character.

STRUCTURE — follow this exact order:
1. Opening: shot type (${composition}), frame ratio (${frame}), single character only, no text, no watermarks, no shoes.
2. SKIN — colour, tone, texture, how light sits on it.
3. FACE — the specific face traits described vividly and precisely.
4. HAIR — style, movement, length, volume, colour.
5. HORNS — shape, material, colour gradient, size.
6. BODY — physique, proportions, anatomy.
7. OUTFIT — minimal fantasy costume covering roughly 20–30% of the body; fabric, material, decorative elements.
8. SPECIAL TRAITS — integrate naturally if any are listed.
9. POSE — body language, energy, expression.
10. BACKGROUND — describe this setting exactly: ${backgroundDesc}

RULES:
- Write in flowing vivid prose — no bullet points.
- The outfit is always a minimal fantasy costume — never an absence of clothing. Always clothed.
- No footwear of any kind.
- One character only — never mention multiple figures.
- No extra limbs unless a SPECIAL trait explicitly demands it.
- Use natural visual descriptive language — do NOT inject any art style terms at this stage.
- FORBIDDEN WORDS — never use any of: nude, naked, exposed, revealing, skin-tight, explicit, erotic, sexual, nsfw, undressed, seductive, sensual, intimate, provocative, topless, bottomless, nipples, genitals, cleavage.
- Instead use: form-fitting, decorative, minimal, ceremonial, fantasy-armored, elegant, sleek, stylized.

OUTPUT FORMAT — return only this JSON:
{ "prompt": "the character description" }`;

  const user = `Generate the character description now using these specifications:

[FRAME & COMPOSITION]
- Ratio: ${frame}
- Shot type: ${composition}

[BACKGROUND]
${backgroundDesc}

[CHARACTER TRAITS]
${traitsContext}`;

  try {
    const openai = new OpenAI({ apiKey: customApiKey });
    const res = await openai.chat.completions.create({
      model:           "gpt-4o",
      messages:        [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" },
      temperature:     0.80,
    });
    const content = JSON.parse(res.choices[0].message.content || "{}");
    return { success: true, prompt: content.prompt as string, rawInput: user };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Stage 1 failed" };
  }
}

// ── Stage 2: Apply art style ──────────────────────────────────────────────────

export async function applyArtStyle(
  input: ArtStyleInput,
  customApiKey?: string,
): Promise<PromptStageResult> {
  if (!customApiKey) return { success: false, error: "OpenAI API Key is missing. Please set it in Settings." };

  const { draft, styleId, isWhiteBg } = input;
  const config    = STYLE_CONFIGS[styleId] ?? STYLE_CONFIGS["glistening_anime"];
  const styleName = config.label;
  const qualityTail = isWhiteBg ? `${config.tail} Pure white background.` : config.tail;

  const system = `You are an art direction specialist for ${styleName} illustration.

TASK: Take the character description below and REWRITE it so every visual element is described in ${styleName} rendering vocabulary.

WHAT TO CHANGE:
- How skin texture, tone, and highlights are described → translate to ${styleName} style.
- Linework, shading, shadows, lighting → use ${styleName}-specific terms.
- Material surfaces, fabric effects, hair volume → reframe in ${styleName} vocabulary.
- The opening line MUST begin with exactly: "${styleName} style:"

WHAT NOT TO CHANGE:
- The character's traits (face shape, horn type, hair colour, body type, outfit type).
- Pose, expression, and energy.
- Background description.
- Overall narrative structure and prose flow.

${config.reference}

${config.guidelines}

QUALITY TAIL — append this verbatim at the very end of your rewritten prompt:
${qualityTail}

OUTPUT FORMAT — return only this JSON:
{ "prompt": "the style-locked prompt" }`;

  const user = `ORIGINAL CHARACTER DESCRIPTION:
${draft}

Rewrite this fully in ${styleName} style now.`;

  try {
    const openai = new OpenAI({ apiKey: customApiKey });
    const res = await openai.chat.completions.create({
      model:           "gpt-4o",
      messages:        [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" },
      temperature:     0.70,
    });
    const content = JSON.parse(res.choices[0].message.content || "{}");
    return { success: true, prompt: content.prompt as string };
  } catch (err: any) {
    return { success: false, error: err.message ?? "Stage 2 failed" };
  }
}

// ── Stage 3: Safety sanitizer ─────────────────────────────────────────────────

export async function sanitizePrompt(
  input: SafetyInput,
  customApiKey?: string,
): Promise<PromptStageResult> {
  if (!customApiKey) return { success: false, error: "OpenAI API Key is missing. Please set it in Settings." };

  // Fast deterministic pass first
  let cleaned = input.draft;
  for (const [pattern, replacement] of SAFETY_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  const system = `You are a content safety specialist for AI image generation systems (DALL-E, Midjourney, Stable Diffusion).

TASK: Review the image generation prompt below and neutralize anything that could trigger content policy violations.

WHAT TO FIX:
- Body descriptions that read as sexual, explicit, or adult in nature — rephrase as artistic/anatomical/fantasy.
- Any phrasing implying nudity, explicit content, or sexual context.
- Descriptions of body parts in a sexual or suggestive context — reframe as artistic visual forms.

WHAT TO KEEP INTACT:
- All art style terms, rendering vocabulary, and quality tags.
- Character fantasy traits, outfit description, pose, and background.
- The overall meaning and narrative — make only the minimum changes needed.

COMMON SAFE REPLACEMENTS:
- "nude / naked" → "costumed / minimally dressed"
- "exposed / revealing" → "visible / minimal"
- "sensual / erotic" → "elegant / captivating"
- "skin-tight" → "form-fitting"
- Body parts in sexual context → artistic anatomical descriptions

If the prompt is already clean and safe, return it exactly unchanged.

OUTPUT FORMAT — return only this JSON:
{ "prompt": "the sanitized prompt", "changes": ["list what was changed, or empty array if nothing"] }`;

  const user = `REVIEW THIS PROMPT:
${cleaned}`;

  try {
    const openai = new OpenAI({ apiKey: customApiKey });
    const res = await openai.chat.completions.create({
      model:           "gpt-4o",
      messages:        [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" },
      temperature:     0.25,
    });
    const content = JSON.parse(res.choices[0].message.content || "{}");
    return { success: true, prompt: content.prompt as string };
  } catch (err: any) {
    // If AI fails, return the deterministic-cleaned version rather than erroring
    return { success: true, prompt: cleaned };
  }
}
