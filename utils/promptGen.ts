import { getPromptSequence } from '@/utils/newpromptgen';
import { GENERATOR_CONFIG } from '@/utils/config';

const defaultAspectRatio = GENERATOR_CONFIG.aspectRatio.options.find(
  (option) => option.id === GENERATOR_CONFIG.aspectRatio.default
);

/**
 * MASTER GENERATOR
 * This function calls the 6-layer sequencer, assembles the layers, 
 * and wraps them in the final AI Engineering instructions.
 */
export function generateAIReadyPrompt(traitString: string): string {
  // 1. Get the 6-layer sequence from our new utility
  const sequence = getPromptSequence(traitString);

  // 2. Assemble the 6 parts into a clean, readable structured block
  const structuredContent = [
    `[LAYER 1: ANCHOR]\n${sequence.anchor}`,
    `[LAYER 2: ANATOMY]\n${sequence.anatomy}`,
    `[LAYER 3: WARDROBE]\n${sequence.wardrobe}`,
    `[LAYER 4: POSE]\n${sequence.pose}`,
    `[LAYER 5: ENVIRONMENT]\n${sequence.environment}`,
    `[LAYER 6: THE FINISH]\n${sequence.finish}`,
  ].join('\n\n');

  // 3. Wrap in the Persona/System Instructions
  return `
You are a specialized prompt engineer for high-end anime image generation.
Your goal is to take the following 6-layer structured brief and understand it clearly to convert it into a single, seamless, highly descriptive cohesive prompt.

STRICT RULES:
1. START the prompt with the text provided in LAYER 1 (You can make changes in it for better integration).
2. INTEGRATE Layers 2, 3, and 4 into a flowing, descriptive character study. Ensure the character is rendered as a complete entity; do not truncate, erase, or fade out body parts that extend beyond the frame.
3. APPLY Layer 5 only if valid elements are present; otherwise, maintain a pure white background.
4. APPEND LAYER 6 EXACTLY at the end of the final prompt.
5. CLOTHING: Maintain the "Minimalist (20-30%)" rule and ensure the liquid dripping logic from the prompt brief is preserved.
6. STYLE: Adhere strictly to the "Suzume-style" vibrant, hard-lined aesthetic described in the final layer.
7. ANATOMY SAFETY: The prompt must not cause the generation of multiple limbs or extra body parts unless explicitly requested in the traits.
8. COMPLIANCE: If traits risk triggering content filters, use abstract or artistic descriptors to maintain the design intent while remaining within safety guidelines.
9. ANATOMICAL CONTINUITY: For close-up or portrait framing, ensure the character's anatomy remains naturally integrated; the body should appear to continue realistically off-canvas rather than appearing as a severed or floating bust.
10. TARGET ASPECT RATIO: Optimize the final prompt for a ${defaultAspectRatio?.promptLabel ?? 'vertical 9:16'} composition unless explicitly overridden elsewhere.
STRUCTURED BRIEF TO CONVERT:

---
${structuredContent}
---

Use any provided reference images STRICTLY FOR ART INSPIRATION ONLY (line quality, shading discipline). Do not copy pose, anatomy, or identifiable design elements.

OUTPUT:
- A single, cohesive 700-word long detailed prompt that seamlessly integrates all 6 layers and NOT A SINGLE WORD OTHER THEN THE PROMT.
- The prompt should be clear, vivid, and optimized for generating a high-quality anime-style image based on the provided traits.

`.trim();
}