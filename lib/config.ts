/**
 * Global Configuration for Seed Engine
 */

export const FEATURE_FLAGS = {
  // When true: fetches per-trait descriptions from Supabase before generating the prompt.
  // When false: passes trait titles directly — faster and works with null descriptions.
  USE_TRAIT_DESCRIPTIONS: false,
};

export const GENERATOR_CONFIG = {
  SEED: {
    // Characters consumed to encode ONE character's full trait set
    // (9 standard traits x 2 + 1 special_count + 3 special slots x 2 = 25).
    // Total seed length = UNIT_LENGTH * characterCount.
    UNIT_LENGTH: 25,
    MIN_CHARACTERS: 1,
    MAX_CHARACTERS: 4,
  // Defines where each trait starts *within a single character's block*
  // and how many characters it consumes. Shift by (characterIndex * UNIT_LENGTH)
  // to locate a given character's block inside the full seed.
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
    id: 'glistening_anime',
    label: 'Glistening Anime',
    description: 'Modern premium anime illustration style. Features bold, perfectly clean black digital outlines (crisp line art) with rich cel-shading, smooth gradient transitions, and highly reflective, glistening highlights. The character has detailed glossy skin, specular highlights on hair and eyes, and vibrant, saturated colors. Wet surfaces, metallic details, and dripping liquid elements are rendered with high shine and realistic glass/slime-like transparency.',
  },
  {
    id: 'anime_suzume',
    label: 'Suzume Anime',
    description: 'Soft luminous Japanese anime style inspired by Makoto Shinkai. Clean precise linework with gentle weight variation, smooth cel shading with gradient transitions, high-saturation vibrant colors, warm cinematic light bloom, professional anime key visual quality.',
  },
  {
    id: 'retro_90s_anime',
    label: 'Retro 90s Anime',
    description: 'Nostalgic 1990s hand-painted cel anime aesthetic. Features warm organic colors, subtle film grain, chromatic aberration, and soft focus. Dark charcoal hand-inked line art with natural weight variations, classic geometric triangle highlights on hair, and vintage analog animation cell textures.',
  },
  {
    id: 'classic_manga',
    label: 'Classic Manga',
    description: 'Traditional professional black and white Japanese manga page style. Expressive character ink drawing with sharp black pen strokes and beautiful line-weight variation. Shaded entirely using detailed halftone dot textures (screentones), dense cross-hatching, and deep solid black ink fills. Zero color.',
  },
  {
    id: 'comic_ink',
    label: 'Comic Ink',
    description: 'Western comic book style. Bold confident ink outlines with dynamic line weight variation. Flat color fills with solid black shadows. Strong graphic composition, high contrast. Professional superhero / fantasy comic art quality.',
  },
  {
    id: 'concept_sketch',
    label: 'Concept Sketch',
    description: 'Minimalist concept art linework. Pure black ink outlines on white. Zero shading, focusing entirely on silhouette and anatomical precision with intricate line weight. Professional character design sheet style.',
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    description: 'Soft watercolor fantasy illustration. Flowing paint washes with visible paper texture, delicate color bleeding at edges. Loose expressive brushwork with clean ink outlines. Japanese fantasy illustration quality.',
  },
  {
    id: 'ultra_realistic',
    label: 'Cinematic Photo',
    description: 'Hyper-realistic photography style. Shot on 85mm lens f/1.8. Visible skin texture, natural eye reflections, Chiaroscuro lighting, 8K resolution, cinematic color grading.',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Minimalist cartoon illustration. Bold clean outlines, flat solid colors, zero texture, zero shading gradients. Every feature reduced to its simplest iconic shape — strong readable silhouette, like a timeless memorable cartoon character. Easy to read at a glance.',
  },
],

BACKGROUNDS: [
  {
    id: 'plain_white',
    label: 'Pure White',
    description: 'Pure clinical white background. Completely empty, zero props, zero shadows, zero environment. All focus on the character.',
  },
  {
    id: 'auto',
    label: 'AI Select',
    description: 'AI chooses the most fitting background to complement the character\'s traits and art style. Create an atmospheric, thematically appropriate backdrop.',
  },
],
};