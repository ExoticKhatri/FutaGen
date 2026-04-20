import { displayLibrary as loreLibrary } from '@/data/lore';
import { CategoryKey, TraitData } from '@/types/traits';
import { GENERATOR_CONFIG, TRAIT_CONFIG } from '@/utils/config';

export interface ResolvedTraitDetail {
  key: string;
  label: string;
  id: string;
  description: string;
}

const orderedScalarKeys: Array<Exclude<keyof TraitData, 'special' | 'frame'>> = [
  'mood',
  'bodyType',
  'shoulders',
  'chest',
  'arms',
  'waist',
  'hips',
  'legs',
  'skinType',
  'hairStyle',
  'hairColor',
  'faceGeo',
  'eyes',
  'expression',
  'pose',
  'clothing',
];

const frameGuidance: Record<TraitData['frame'], string> = {
  full: 'Compose a full-body view from head to toe and keep the whole silhouette naturally visible inside the scene.',
  mid: 'Compose a mid-shot that shows the character from roughly thigh or waist upward while preserving natural body continuation below the crop.',
  close: 'Compose a close-up portrait with the anatomy continuing naturally beyond the crop, never as a floating bust.',
  extreme: 'Compose an extreme close-up with strong facial presence while keeping the visible anatomy coherent and naturally connected off-canvas.',
};

const defaultAspectRatio = GENERATOR_CONFIG.aspectRatio.options.find(
  (option) => option.id === GENERATOR_CONFIG.aspectRatio.default
);

function getLoreDescription(category: CategoryKey, id: string): string {
  const library = loreLibrary[category];
  if (!library) {
    return 'Description not found.';
  }

  const entry = Object.values(library).find((variant) => variant.id === id);
  return entry?.description ?? 'Description not found.';
}

export function resolveTraitDetails(data: TraitData): ResolvedTraitDetail[] {
  const items: ResolvedTraitDetail[] = [];

  for (const key of orderedScalarKeys) {
    const id = data[key];
    items.push({
      key,
      label: TRAIT_CONFIG.categoryDefinitions[key].displayName,
      id,
      description: getLoreDescription(key, id),
    });
  }

  data.special?.forEach((id, index) => {
    const specialKey = `specialSlot${index + 1}` as CategoryKey;
    items.push({
      key: specialKey,
      label: TRAIT_CONFIG.categoryDefinitions[specialKey].displayName,
      id,
      description: getLoreDescription(specialKey, id),
    });
  });

  return items;
}

export function generateAIInstructionPrompt(data: TraitData): string {
  const resolvedTraits = resolveTraitDetails(data);

  const resolvedTraitBlock = resolvedTraits
    .map((item) => `- ${item.label} (${item.key})\n  ${item.description}`)
    .join('\n');

  const specialRule = data.special?.length
    ? `Special traits are active. Integrate each special feature naturally without duplicating anatomy or overwhelming the silhouette.`
    : 'No special traits are active. Do not invent extra mutations or accessory traits.';

  return `You are a specialized prompt engineer for high-end anime image generation.
Your job is to convert the mapped character data below into one seamless, production-ready final image prompt for a single demon lady.

STRICT RULES:
1. Write one cohesive final prompt of about 600 words, which should always start like this "Create a single, original, ${data.frame} anime-style demon lady character centered on a pure white background. One character only, no text, no watermark, no shoes..
2. Treat the mapped data and resolved trait descriptions as the source of truth. Do not invent contradictory features.
3. The subject must always be exactly one demon lady and nothing else. Never describe multiple characters, twins, mirrored bodies, clones, reflections that read as a second person, or background figures.
4. Respect the provided frame value exactly: ${data.frame}.
5. ${frameGuidance[data.frame]}
6. Merge all selected traits into one complete demon-lady character study with consistent anatomy, materials, mood, silhouette, and presence.
7. Keep the character as one single subject only, with no duplicate bodies, extra limbs, repeated facial features, detached anatomy, or secondary creature forms unless a selected trait explicitly requires it.
8. Preserve anatomical continuity when the framing is cropped. The body must continue naturally beyond the edge of the image.
9. Keep clothing visually minimal when the selected clothing trait suggests a sparse design, but describe it with tasteful, art-directed language.
10. If a trait could trigger safety issues, keep the visual intent through abstract, stylized, or high-fashion phrasing rather than explicit wording.
11. Use a pure white background unless the mapped pose or trait combination clearly requires a minimal environmental support element.
12. Use the default aspect ratio of ${defaultAspectRatio?.promptLabel ?? 'vertical 9:16'} unless explicitly overridden elsewhere.
13. The art direction must feel Suzume-like in energy: confident hard anime line art, clean decisive contours, visually vibrant color design, crisp cel-shaded separation, luminous atmospheric clarity, cinematic composition, and polished high-end illustration discipline.
14. Emphasize elegant, readable shape language and high visual clarity over noisy rendering, painterly blur, sketchiness, or muddy textures.
15. Do not output section headers, bullet points, JSON, or analysis. Output only the final image-generation prompt.

TRAIT DESCRIPTIONS:
---
${resolvedTraitBlock}
---

ADDITIONAL DIRECTION:
- Interpret the mood, pose, face, eyes, and expression together so the character feels psychologically coherent.
- Interpret body type, shoulders, chest, arms, waist, hips, and legs together so the physique reads as one believable design.
- Interpret hair style, hair color, skin type, clothing, and special traits together so materials and color relationships stay intentional.
- Keep the final composition optimized for a ${defaultAspectRatio?.promptLabel ?? 'vertical 9:16'} canvas.
- ${specialRule}
- The final prose should strongly reinforce that this is one visually striking demon lady rendered with confident anime linework and vibrant, cinematic clarity.
- Use confident anime-art phrasing with strong line discipline, clean material separation, vivid color design, crisp cel shading, bold readable forms, and cinematic clarity.

OUTPUT:
Return a single, detailed final prompt which should be exactly 650-700 words long.`;
}