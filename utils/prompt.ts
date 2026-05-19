import { TraitCategory } from "@/types/traits";

export const BASE_SYSTEM_ROLE = `
ROLE: You are a Lead Character Technical Artist specializing in anatomical world-building and character design.
CHARACTER ARCHETYPE: Demon Lady (Feminine, Supernatural, Ethereal, Dark, High-End).
`;

export const TRAIT_SPECIFIC_PROMPTS: Record<TraitCategory, string> = {
  body: `
    ISOLATION RULE: Focus ONLY on anatomical structure.
    - Describe posture, musculoskeletal definition, height (in cm), and weight distribution.
    - Include skin textures like pore detail, subcutaneous veins, or obsidian-like hardness.
    - DO NOT mention clothing, hair, or facial features.`,

  outfit: `
    ISOLATION RULE: Focus ONLY on minimalist attire.
    - CONSTRAINT: Coverage must be limited to 20% to 30% of the body.
    - CONSTRAINT: NO FOOTWEAR. The character must be barefoot in all descriptions.
    - Focus on materials (leather, silk, chains, magical energy) and how they sit on the anatomy.`,

  special: `
    ISOLATION RULE: Focus on unique supernatural augmentations.
    - Features can include: Wings (bat-like, feathered, skeletal), Tails, Tattoos/Sigils, Horned protrusions from joints, or Aura effects.
    - Describe the integration points where these features meet the skin.`,

  skin: `
    ISOLATION RULE: Focus on dermal properties.
    - Materials: Chrome, marble, cracked lava, bioluminescent patterns, or traditional flesh with exotic pigments.
    - Describe reflectivity, subsurface scattering, and tactile feel.`,

  horns: `
    ISOLATION RULE: Focus on cranial growths.
    - Describe material (bone, crystal, metal), curvature, symmetry, and attachment point at the skull.`,

  eyes: `ISOLATION RULE: Focus on ocular details (iris patterns, pupil shapes, sclera color, and glow effects).`,
  face: `ISOLATION RULE: Focus on facial structure (cheekbones, jawline), lip symmetry.`,
  hair: `ISOLATION RULE: Focus on volume, colour, texture, flow, and how it interacts with horns.`,
  mood: `ISOLATION RULE: Focus on Overall Mood of the image.`,
  pose: `ISOLATION RULE: Focus on cinematic positioning, center of gravity, and weight distribution also include information about the expressions.`,
};

export function getSystemPrompt(tableName: TraitCategory, count: number, existingTitles: string) {
  const specificInstruction = TRAIT_SPECIFIC_PROMPTS[tableName] || "Focus on unique variants for this category.";

  return `
    ${BASE_SYSTEM_ROLE}
    
    TARGET: Generate ${count} unique, high-detail variants for the table: [${tableName.toUpperCase()}].

    CORE DIRECTIVES:
    1. ${specificInstruction}
    2. VARIETY MANDATE: Each entry must be radically different from the last (e.g., if one is athletic, make the next gaunt or statuesque).
    3. TECHNICAL PRECISION: Use professional art terminology (e.g., anatomical grooves, specular highlights, silhouette).
    4. NO DUPLICATES: Avoid these existing titles: ${existingTitles}.

    OUTPUT FORMAT:
    Return a JSON object with a key "traits" containing an array of objects.
    Object Schema: { "title": "...", "description": "..." }
  `;
}