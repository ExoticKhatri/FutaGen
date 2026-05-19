/**
 * Global Configuration for Seed Engine
 */

export const GENERATOR_CONFIG = {
  SEED: {
    MAX_LENGTH: 64,
    MIN_LENGTH: 64,
  // Defines where each trait starts and how many characters it consumes
    TRAIT_MAP: {
      body:    { offset: 0,  length: 2 },
      eyes:    { offset: 2,  length: 2 },
      face:    { offset: 4,  length: 2 },
      hair:    { offset: 6,  length: 2 },
      horns:   { offset: 8,  length: 2 },
      mood:    { offset: 10, length: 2 },
      outfit:  { offset: 12, length: 2 },
      pose:    { offset: 14, length: 2 },
      skin:    { offset: 16, length: 2 },
      // SPECIAL LOGIC: 
      // char at index 18 decides "How many" special traits (0-3)
      // pairs starting from index 19 are the potential special traits
      special_count:   { offset: 18, length: 1 }, 
      special_slots: [
        { offset: 19, length: 2 },
        { offset: 21, length: 2 },
        { offset: 23, length: 2 },
      ]
    },
  },

  COMPOSITIONS: [
    { id: 'full_body', label: 'Full Body' },
    { id: 'mid_shot', label: 'Head to Knees' },
    { id: 'portrait', label: 'Head to Hips'},
    { id: 'close_up', label: 'Extreme Closeup'},
  ],

  FRAMES: [
    { id: 'auto', label: 'Auto', ratio: 'AUTO' },
    { id: 'landscape', label: 'Landscape', ratio: '16:9' },
    { id: 'four-three', label: 'Standard', ratio: '4:3' },
    { id: 'square', label: 'Square', ratio: '1:1' },
    { id: 'three-four', label: 'Classic', ratio: '3:4' },
    { id: 'portrait', label: 'Vertical', ratio: '9:16' },
  ],
  
ART_STYLES: [
  { 
    id: 'anime_suzume', 
    label: 'Suzume Aesthetic', 
    description: 'High-fidelity Japanese anime style inspired by Makoto Shinkai. Features vast cinematic skies, dramatic backlighting, lens flares, and vibrant colors. Character features are clean with subtle cell shading and expressive, glowing eyes. Backgrounds have a painterly, luminous quality with high contrast.' 
  },
  { 
    id: 'concept_sketch', 
    label: 'Technical Sketch', 
    description: 'Minimalist concept art line-work. Pure black ink outlines on a textured white or parchment background. Zero shading, focusing entirely on silhouette, anatomical precision, and intricate line weight. Professional character design sheet style, clean and sharp strokes.' 
  },
  { 
    id: '3d_model', 
    label: 'V-Ray Render', 
    description: 'High-end 3D character render. Features subsurface scattering on skin, realistic hair physics, and complex material shaders (latex, silk, or obsidian). Lighting is 3-point studio setup with soft global illumination. Output resembles a high-budget cinematic video game asset or Octane Render.' 
  },
  { 
    id: 'ultra_realistic', 
    label: 'Cinematic Realism', 
    description: 'Hyper-realistic photography style. Shot on 85mm lens, f/1.8. Features visible skin pores, realistic peach fuzz, and natural eye reflections. Lighting is moody and atmospheric (Chiaroscuro), emphasizing raw texture and depth. 8k resolution, photorealistic textures, and cinematic color grading.' 
  },
  { 
    id: 'minimalist', 
    label: 'Minimalist Dark', 
    description: 'High-contrast monochromatic aesthetic. Focuses on stark silhouettes and negative space. Features sharp edges, deep blacks, and a clean digital finish with no unnecessary decorative elements.' 
  },
],
};