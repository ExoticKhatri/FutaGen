// utils/promptGen.ts

const SYSTEM_CORE = `Single original full-body anime-style demon woman centered on pure white background. 
One character only, no text, no watermark, no shoes. 
Clean high-resolution sharp-lined anime illustration, hard-edged shading, strong anatomy, clear material separation.`;

const FEMININE_MORPHOLOGY = `Feminine morphology: elegant bone structure, refined jawline, feminine eyes with lashes. 
Chest: Mandatory large feminine breasts, fabric must frame or tension around volume naturally. 
No masculine features.`;

const LIQUID_PROTOCOL = `Ground Protocol: Glossy, viscous gooey liquid pooling beneath feet. 
Liquid drips only from lower fabric folds (below belly). 
Hard anime highlights on liquid.`;

const ART_STYLE = `Style: Sharp confident linework, hard light shading, high clarity, no painterly blur, no sketch roughness, vertical ratio.`;

/**
 * Internal helper to build the trait-based raw content
 */
function buildRawBase(traitString: string): string {
  if (!traitString) return "";
  const userTraits = traitString.split(',').map(t => t.trim()).join(', ');

  return [
    SYSTEM_CORE,
    `Character Traits: ${userTraits}`,
    FEMININE_MORPHOLOGY,
    LIQUID_PROTOCOL,
    ART_STYLE,
    "Strict: Pure white background, no environmental elements, no explicit exposure."
  ].join('\n\n');
}

/**
 * THIS IS THE FINAL SYSTEM PROMPT
 * It combines the structure AND the instructions into one string.
 */
export function generateFinalSystemPrompt(traitString: string): string {
  const baseContent = buildRawBase(traitString);
  if (!baseContent) return "";

  return `
      You are a specialized prompt engineer for high-end anime image generation.
      Your goal is to take the following system base prompt and convert it into a seamless, highly descriptive cohesive prompt.

      STRICT RULES:
      1. Start the prompt EXACTLY with: "Create a single, original, according to frame anime-style demon character centered on a pure white background."
      2. Include: "The image must contain only one character, no text, no watermark, no shoes, and no environmental elements beyond a subtle ground contact surface formed by liquid."
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
  return `
      You are a specialized prompt engineer for high-end anime image generation.
      Your goal is to take the following system base prompt and convert it into a seamless, highly descriptive cohesive prompt.

      STRICT RULES:
      1. Start the prompt EXACTLY with: "Create a single, original, full-body anime-style demon character centered on a pure white background."
      2. Include: "The image must contain only one character, no text, no watermark, no shoes, and no environmental elements beyond a subtle ground contact surface formed by liquid."
      3. Describe: "clean, high-resolution, sharp-lined, vibrant anime illustration, hard-edged shading, strong anatomy, clear material separation, vertical ratio."
      4. Append EXACTLY at the end: "Use any provided reference images STRICTLY FOR ART INSPIRATION ONLY (line quality, rendering finish, shading discipline). Do not copy pose, proportions, anatomy, clothing structure, horn shapes, facial features, or any identifiable design elements from references."
      5. Seamlessly integrate the traits provided between the start and end instructions, expanding them with descriptive adjectives appropriate for high-quality anime art.
      6. If character is interacting with a prop (like a seat), include the prop in the prompt so she isn't floating.
      7. Clothing: Minimalist, covering only 20-30% of the body. Translucency is acceptable.
      
      SYSTEM PROMPT TO INTEGRATE: 
      ---
      ${systemPrompt}
      ---
    `.trim();
}