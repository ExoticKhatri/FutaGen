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
    id: 'anime_suzume',
    label: 'Suzume Anime',
    description: 'Soft luminous Japanese anime style inspired by Makoto Shinkai. Clean precise linework with gentle weight variation, smooth cel shading with gradient transitions, high-saturation vibrant colors, warm cinematic light bloom, professional anime key visual quality.',
  },
  {
    id: 'webtoon',
    label: 'Webtoon',
    description: 'Korean webtoon / manhwa digital art style. Crisp clean outlines, flat cel shading with minimal shadows, high-saturation vibrant color palette, expressive simplified features. Professional Korean digital manhwa quality.',
  },
  {
    id: 'dark_fantasy',
    label: 'Dark Fantasy',
    description: 'Epic dark fantasy illustration. Rich painterly rendering with dramatic Chiaroscuro lighting, deep shadows, vibrant accent colors against darkness, detailed atmospheric quality. Resembles Magic: The Gathering card art or high-end TTRPG illustration.',
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    description: 'Soft watercolor fantasy illustration. Flowing paint washes with visible paper texture, delicate color bleeding at edges. Loose expressive brushwork with clean ink outlines. Japanese fantasy illustration quality.',
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
    id: 'ultra_realistic',
    label: 'Cinematic Photo',
    description: 'Hyper-realistic photography style. Shot on 85mm lens f/1.8. Visible skin texture, natural eye reflections, Chiaroscuro lighting, 8K resolution, cinematic color grading.',
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    description: 'High-contrast monochromatic aesthetic. Stark silhouettes, deep blacks, negative space, clean digital finish with no unnecessary decorative elements.',
  },
],

BACKGROUNDS: [
  {
    id: 'plain_white',
    label: 'White',
    description: 'Pure clinical white background. Completely empty, zero props, zero shadows, zero environment. All focus on the character.',
  },
  {
    id: 'auto',
    label: 'Auto',
    description: 'AI chooses the most fitting background to complement the character\'s traits and art style. Create an atmospheric, thematically appropriate backdrop.',
  },
  {
    id: 'dark_void',
    label: 'Dark Void',
    description: 'Deep pure black void background with subtle volumetric depth. No environment, no props, just rich absolute darkness.',
  },
  {
    id: 'cosmic',
    label: 'Cosmic',
    description: 'Deep cosmic space background. Distant galaxies, ethereal nebula glow in violet and indigo, soft starfield with gentle lens flare.',
  },
  {
    id: 'hellscape',
    label: 'Hellscape',
    description: 'Dramatic demonic hellscape background. Distant ember and lava glow on the horizon, cracked obsidian ground with heat haze, atmospheric crimson and orange smog.',
  },
  {
    id: 'misty_forest',
    label: 'Misty Forest',
    description: 'Ethereal ancient forest at night. Soft ambient moonlight filters through massive dark trees, low-lying ground fog, bioluminescent particles drifting through air.',
  },
  {
    id: 'moonlit_night',
    label: 'Moonlit',
    description: 'Open moonlit night sky. Full moon casting soft silver-blue light, minimal atmospheric clouds, distant horizon glow.',
  },
  {
    id: 'throne_room',
    label: 'Throne Room',
    description: 'Grand gothic throne room. Dark stone pillars with subtle candlelight, high vaulted ceiling lost in shadow, ornate obsidian floor.',
  },
  {
    id: 'cherry_blossom',
    label: 'Sakura',
    description: 'Soft Japanese cherry blossom garden. Delicate pink petals drifting through warm sunlight, blurred sakura trees, gentle spring atmosphere.',
  },
],
};