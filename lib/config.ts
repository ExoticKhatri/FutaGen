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