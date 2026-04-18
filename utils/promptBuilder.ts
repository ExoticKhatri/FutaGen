/**
 * Advanced Prompt Builder for NoHues Demon Synthesis
 * This utility injects the high-precision "Demon Lady" framework 
 * around the user-selected traits.
 */

const SYSTEM_CORE = `Single original full-body anime-style demon woman centered on pure white background. 
One character only, no text, no watermark, no shoes. 
Clean high-resolution sharp-lined anime illustration, hard-edged shading, strong anatomy, clear material separation.`;

const FEMININE_MORPHOLOGY = `Feminine morphology: elegant bone structure, refined jawline, feminine eyes with lashes. 
Chest: Mandatory large feminine breasts, fabric must frame or tension around volume naturally. 
No masculine features.`;

const LIQUID_PROTOCOL = `Ground Protocol: Glossy, viscous gooey liquid pooling beneath feet. 
Liquid drips only from lower fabric folds (below belly). 
Hard anime highlights on liquid, color must harmonize with palette but remain distinct from clothing.`;

const ART_STYLE = `Style: Sharp confident linework, hard light shading, high clarity, no painterly blur, no sketch roughness, vertical ratio.`;

export const buildFinalPrompt = (traitString: string): string => {
  if (!traitString) return "";

  // 1. Clean up the incoming traits from Sidebar
  const userTraits = traitString
    .split(',')
    .map(t => t.trim())
    .join(', ');

  /**
   * 2. Construct the Master Prompt
   * We wrap the user's specific seed-based traits inside the 
   * strict structural rules of the Demon Lady prompt.
   */
  const finalPrompt = [
    SYSTEM_CORE,
    `Character Traits: ${userTraits}`,
    FEMININE_MORPHOLOGY,
    LIQUID_PROTOCOL,
    ART_STYLE,
    "Strict: Pure white background, no environmental elements, no explicit exposure."
  ].join('\n\n');

  return finalPrompt;
};

/**
 * Simulates the AI Refinement step
 */
export const refinePromptWithAI = async (mergedPrompt: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mergedPrompt;
};