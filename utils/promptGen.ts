import { getPromptSequence } from '@/utils/newpromptgen';

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
1. START the prompt EXACTLY with the text provided in LAYER 1 modify it as you like.
2. INTEGRATE Layers 2, 3, and 4 into a flowing, descriptive character study.
3. APPLY Layer 5 only if valid elements are present; otherwise, maintain a pure white background.
4. APPEND LAYER 6 EXACTLY at the end of the final prompt.
5. CLOTHING: Maintain the "Minimalist (20-30%)" rule and ensure the liquid dripping logic from the prompt brief is preserved.
6. STYLE: Adhere strictly to the anime like, hard-lined aesthetic described in the final layer.
7. Make sure the prompt created should not make ai to generate multiple limbs or extra body parts unless the trait explicitly demands it
8. Make sure the prompt should not be rejected by ai for violating content policy. If there are traits that are likely to trigger content filters, modify the wording to be more abstract and less explicit while still conveying the intended design.

OUTPUT:
- A single, cohesive prompt that seamlessly integrates all 6 layers.
- The prompt should be clear, vivid, and optimized for generating a high-quality anime-style image based on the provided traits.

STRUCTURED BRIEF TO CONVERT:
---
${structuredContent}
---

Use any provided reference images STRICTLY FOR ART INSPIRATION ONLY (line quality, shading discipline). Do not copy pose, anatomy, or identifiable design elements.
`.trim();
}