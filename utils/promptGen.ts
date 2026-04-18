// utils/promptGen.ts

const SYSTEM_CORE = `Single original anime-style demon woman centered on pure white background. 
One character only, no text, no watermark, no shoes. 
Clean high-resolution sharp-lined anime illustration, hard-edged shading, strong anatomy, clear material separation.`;

const FEMININE_MORPHOLOGY = `Feminine morphology: elegant bone structure, refined jawline, feminine eyes with lashes. 
Chest: Mandatory large feminine breasts, fabric must frame or tension around volume naturally. 
No masculine features.`;

const ART_STYLE = `Style: Sharp confident linework, hard light shading, high clarity, no painterly blur, no sketch roughness, vertical ratio.`;

/**
 * Defines the specific camera and environment logic based on framing
 */
const GET_FRAMING_PROTOCOL = (framing: string) => {
  // 1. FULL BODY
  if (framing.includes("head to toe") || framing.includes("full body")) {
    return {
      camera: "Full-body shot encompassing the entire character from head to toe.",
      environment: `Ground Protocol: Glossy, viscous jade-tinted liquid pooling beneath feet. 
      Liquid drips only from lower fabric folds. Hard anime highlights on liquid.`
    };
  }
  // 2. MEDIUM (WAIST/THIGHS)
  if (framing.includes("waist up") || framing.includes("thighs")) {
    return {
      camera: "Medium shot, framed from the mid-thighs up to allow for focus on torso and expression.",
      environment: "No ground elements visible. Minor viscous droplets falling from lower edges of clothing."
    };
  }
  // 3. CLOSE-UP (BELLY)
  if (framing.includes("head to belly")) {
    return {
      camera: "Medium close-up shot, framed from the navel up, emphasizing facial features and upper body anatomy.",
      environment: "Background remains pure clinical white. No liquid pooling."
    };
  }
  // 4. EXTREME CLOSE-UP (PORTRAIT)
  return {
    camera: "Extreme close-up portrait, focusing strictly on the head, neck, and upper chest area.",
    environment: "Focus on micro-details: skin texture, iris depth, and sharp hair strands. No lower body elements."
  };
};

/**
 * Internal helper to build the trait-based raw content
 */
function buildRawBase(traitString: string): string {
  if (!traitString) return "";

  // Extract framing to handle logic, then remove it from the traits list to keep it clean
  const traitArray = traitString.split(',').map(t => t.trim());
  const framingTrait = traitArray.find(t => t.startsWith('framing=')) || "framing=head to toe";
  const framingValue = framingTrait.split('=')[1];
  
  // Filter out the framing tag from the descriptive traits
  const userTraits = traitArray
    .filter(t => !t.startsWith('framing='))
    .join(', ');

  const protocol = GET_FRAMING_PROTOCOL(framingValue);

  return [
    SYSTEM_CORE,
    `Camera Framing: ${protocol.camera}`,
    `Character Traits: ${userTraits}`,
    FEMININE_MORPHOLOGY,
    protocol.environment,
    ART_STYLE,
    "Strict: Pure white background, no environmental elements, no explicit exposure."
  ].join('\n\n');
}

/**
 * THIS IS THE FINAL SYSTEM PROMPT
 */
export function generateFinalSystemPrompt(traitString: string): string {
  const baseContent = buildRawBase(traitString);
  if (!baseContent) return "";

  // Identify current framing for the "Start Exactly" rule
  const isFullBody = traitString.includes("full body") || traitString.includes("head to toe");
  const frameText = isFullBody ? "full-body" : "dynamic-framed";

  return `
      You are a specialized prompt engineer for high-end anime image generation.
      Your goal is to take the following system base prompt and convert it into a seamless, highly descriptive cohesive prompt.

      STRICT RULES:
      1. Start the prompt EXACTLY with: "Create a single, original, ${frameText} anime-style demon character centered on a pure white background."
      2. Include: "The image must contain only one character, no text, no watermark, no shoes, and no environmental elements."
      3. Describe: "clean, high-resolution, sharp-lined, vibrant anime illustration, hard-edged shading, strong anatomy, clear material separation, vertical ratio."
      4. Append EXACTLY at the end: "Use any provided reference images STRICTLY FOR ART INSPIRATION ONLY (line quality, rendering finish, shading discipline). Do not copy pose, proportions, anatomy, clothing structure, horn shapes, facial features, or any identifiable design elements from references."
      5. Seamlessly integrate the traits provided between the start and end instructions, expanding them with descriptive adjectives appropriate for high-quality anime art.
      6. If character is interacting with a prop (like a seat), include the prop in the prompt so she isn't floating.
      7. Clothing: Minimalist, covering only 20-30% of the body. Translucency is acceptable.
      
      SYSTEM PROMPT TO INTEGRATE:
      ---
      ${baseContent}
      ---
`.trim();
}

/**
 * Wraps the system prompt with the meta-instructions for the AI
 */
export function prepareAIInstruction(systemPrompt: string): string {
  // We reuse the core logic to keep the engineer persona consistent
  return `
      You are a specialized prompt engineer for high-end anime image generation.
      Your goal is to take the following system base prompt and convert it into a seamless, highly descriptive cohesive prompt.

      STRICT RULES:
      1. Start the prompt EXACTLY with: "Create a single, original, anime-style demon character centered on a pure white background."
      2. Include: "The image must contain only one character, no text, no watermark, no shoes, and no environmental elements."
      3. Describe: "clean, high-resolution, sharp-lined, vibrant anime illustration, hard-edged shading, strong anatomy, clear material separation, vertical ratio."
      4. Append EXACTLY at the end: "Use any provided reference images STRICTLY FOR ART INSPIRATION ONLY. Do not copy design elements from references."
      5. Seamlessly integrate traits into a natural description.
      
      SYSTEM PROMPT TO INTEGRATE: 
      ---
      ${systemPrompt}
      ---
    `.trim();
}