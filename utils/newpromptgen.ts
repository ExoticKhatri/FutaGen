// utils/newpromptgen.ts

export interface PromptSequence {
  anchor: string;
  anatomy: string;
  wardrobe: string;
  pose: string;
  environment: string;
  finish: string;
}

/**
 * Parses the raw DNA trait string into a searchable map
 */
function parseTraits(traitString: string): Record<string, string> {
  const traits: Record<string, string> = {};
  traitString.split(',').forEach(t => {
    const [key, val] = t.trim().split('=');
    if (key && val) traits[key.toLowerCase()] = val;
  });
  return traits;
}

export function getPromptSequence(traitString: string): PromptSequence {
  const traits = parseTraits(traitString);

    const LIQUID_PROTOCOL = `Ground Protocol: A glossy, viscous, semi-translucent gooey liquid pools beneath the feet. The liquid is a vibrant, contrasting neon-ether hue, distinct from the character's skin and clothing colors. Thick droplets are seen dripping exclusively from the lowest folds and hemline of the garment, clinging to the fabric edges before falling. The substance features sharp, high-contrast specular highlights and realistic surface tension, appearing as a separate elemental fluid.`;

    // Layer 1: Anchor (Dynamic based on framing)
    const framing = traits['framing'] || "full body head to toe framing";
    const rawFraming = traits['framing'] || "full-body shot, framed from head to toe";
  
  const anchor = `Create a single, original, ${rawFraming} anime-style demon lady character centered on a pure white background. One character only, no text, no watermark, no shoes.`;

  // Layer 2: Anatomy (DNA Traits)
  const anatomy = [
    traits['skin'] && `Skin: ${traits['skin']}`,
    traits['face'] && `Face: ${traits['face']}`,
    traits['hair'] && `Hair: ${traits['hair']}`,
    traits['horn'] && `Horns: ${traits['horn']}`,
    traits['body'] && `Body: ${traits['body']}`,
    traits['mutation'] && `Mutations: ${traits['mutation']}`,
  ].filter(Boolean).join(', ') || "Default demonic anatomy";

  // Layer 3: Wardrobe (DNA Traits)
  const wardrobe = traits['cloth'] || "Minimalist covering";

  // Layer 4: Pose (DNA Traits)
  const pose = traits['pose'] || "Standing naturally";

// Layer 5: Environment (Dynamic based on Framing)
  let environment = "Background: Pure clinical white. Only include props if the character's pose explicitly requires physical support (e.g., a seat for sitting).";
  
  // Apply Liquid Protocol only for full-length shots
  if (framing.includes("full body") || framing.includes("head to toe")) {
    environment += ` ${LIQUID_PROTOCOL}`;
  } else {
    environment += "";
}
    

  // Layer 6: The Finish (Vibrant "Suzume" Style)
  const finish = `Masterpiece Quality: Suzume-style aesthetic, ultra-vibrant color palette, cinematic lighting, sharp-edged cel shading, confident hard linework, strong anatomy, clear material separation, high-clarity finish, vertical ratio, no painterly blur.`;

  return {
    anchor,
    anatomy,
    wardrobe,
    pose,
    environment,
    finish
  };
}