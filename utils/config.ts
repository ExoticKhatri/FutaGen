// utils/config.ts

import { CategoryKey, TraitDefinition } from '../types/traits';

export const GENERATOR_CONFIG = {
  // --- Seed Constraints ---
  seed: {
    minLength: 64,
    maxLength: 64,
    base: 36, // 0-9, A-Z
  },
  aspectRatio: {
    default: 'vertical',
    options: [
      { id: 'landscape', label: 'Landscape', value: '16:9', promptLabel: 'landscape 16:9' },
      { id: 'vertical', label: 'Vertical', value: '9:16', promptLabel: 'vertical 9:16' },
      { id: 'square', label: '1:1', value: '1:1', promptLabel: 'square 1:1' },
    ] as const,
  },
};


export const FRAME_CONFIG = {
  options: [
    { id: 'full', label: 'Full Body' },
    { id: 'mid', label: 'Mid Shot' },
    { id: 'close', label: 'Close Up' },
    { id: 'extreme', label: 'Extreme' },
  ] as const,
};

export const TOGGLE_CONFIG = {
  // Global generation modifiers
  settings: [
    { id: 'showFluid', label: 'Show Fluid', default: false },
    { id: 'futanari', label: 'Futanari', default: false },
  ],
};

export const TRAIT_CONFIG ={
  // --- Special Traits Configuration ---
  specialTraits: {
    switchIndex: 48, // Single character at index 48 (Position 49)
    maxSlots: 3,     // Based on our map (Slot 1, 2, 3)
  },

  /**
   * SEED MAP DEFINITION
   * Maps each CategoryKey to its exact [start, end] index in the 64-char string.
   * Total length used: 0 to 60 (Remaining 4 chars are reserved).
   */
  categoryDefinitions: {
    mood:        { displayName: 'Mood',           seedIndex: [0, 2],   impacts: ['expression', 'pose'] },
    bodyType:    { displayName: 'Body Type',      seedIndex: [3, 5],   impacts: ['shoulders', 'chest', 'arms', 'waist', 'hips', 'legs'] },
    shoulders:   { displayName: 'Shoulders',      seedIndex: [6, 8],   dependsOn: ['bodyType'] },
    chest:       { displayName: 'Chest',          seedIndex: [9, 11],  dependsOn: ['bodyType'] },
    arms:        { displayName: 'Arms',           seedIndex: [12, 14], dependsOn: ['bodyType'] },
    waist:       { displayName: 'Waist',          seedIndex: [15, 17], dependsOn: ['bodyType'] },
    hips:        { displayName: 'Hips',           seedIndex: [18, 20], dependsOn: ['bodyType'] },
    legs:        { displayName: 'Legs',           seedIndex: [21, 23], dependsOn: ['bodyType'] },
    skinType:    { displayName: 'Skin & Texture', seedIndex: [24, 26] },
    hairStyle:   { displayName: 'Hair Style',     seedIndex: [27, 29] },
    hairColor:   { displayName: 'Hair Color',     seedIndex: [30, 32] },
    faceGeo:     { displayName: 'Face Structure', seedIndex: [33, 35], impacts: ['eyes'] },
    eyes:        { displayName: 'Eyes',           seedIndex: [36, 38], dependsOn: ['faceGeo'] },
    expression:  { displayName: 'Expression',     seedIndex: [39, 41], dependsOn: ['mood'] },
    pose:        { displayName: 'Pose',           seedIndex: [42, 44], dependsOn: ['mood'] },
    clothing:    { displayName: 'Clothing',       seedIndex: [45, 47] },
    // specialQty (Switch) uses index 48
    specialSlot1: { displayName: 'Special Trait 1', seedIndex: [49, 51] },
    specialSlot2: { displayName: 'Special Trait 2', seedIndex: [52, 54] },
    specialSlot3: { displayName: 'Special Trait 3', seedIndex: [55, 57] },
  } as Record<CategoryKey, TraitDefinition>,

  /**
   * DATA SOURCE REGISTRY
   * This maps each category to its specific data file.
   * The logic will use these paths to import the Thin and Heavy data.
   */
  dataRegistry: {
    // 1. Logic Layer: Contains IDs, Whitelists, and Blacklists (RAM Resident)
    logic: {
      mood:         '@/data/logic/mood',
      bodyType:     '@/data/logic/body',
      shoulders:    '@/data/logic/shoulders',
      chest:        '@/data/logic/chest',
      arms:         '@/data/logic/arms',
      waist:        '@/data/logic/waist',
      hips:         '@/data/logic/hips',
      legs:         '@/data/logic/legs',
      skinType:     '@/data/logic/skin',
      hairStyle:    '@/data/logic/hair',
      hairColor:    '@/data/logic/hair-color',
      faceGeo:      '@/data/logic/face',
      eyes:         '@/data/logic/eyes',
      expression:   '@/data/logic/expression',
      pose:         '@/data/logic/pose',
      clothing:     '@/data/logic/clothing',
      special:      '@/data/logic/special',
    },
    // 2. Display Layer: Contains IDs and Names for the Frontend Dropdowns
    display: {
      mood:         '@/data/display/mood',
      bodyType:     '@/data/display/body',
      shoulders:    '@/data/display/shoulders',
      chest:        '@/data/display/chest',
      arms:         '@/data/display/arms',
      waist:        '@/data/display/waist',
      hips:         '@/data/display/hips',
      legs:         '@/data/display/legs',
      skinType:     '@/data/display/skin',
      hairStyle:    '@/data/display/hair',
      hairColor:    '@/data/display/hair-color',
      faceGeo:      '@/data/display/face',
      eyes:         '@/data/display/eyes',
      expression:   '@/data/display/expression',
      pose:         '@/data/display/pose',
      clothing:     '@/data/display/clothing',
      special:      '@/data/display/special',
    },
    // 3. Lore Layer: Contains Long Descriptions for AI Generation (Lazy Loaded)
    lore: {
      mood:         '@/data/lore/mood',
      bodyType:     '@/data/lore/body',
      shoulders:    '@/data/lore/shoulders',
      chest:        '@/data/lore/chest',
      arms:         '@/data/lore/arms',
      waist:        '@/data/lore/waist',
      hips:         '@/data/lore/hips',
      legs:         '@/data/lore/legs',
      skinType:     '@/data/lore/skin',
      hairStyle:    '@/data/lore/hair',
      hairColor:    '@/data/lore/hair-color',
      faceGeo:      '@/data/lore/face',
      eyes:         '@/data/lore/eyes',
      expression:   '@/data/lore/expression',
      pose:         '@/data/lore/pose',
      clothing:     '@/data/lore/clothing',
      special:      '@/data/lore/special',
    }
  }
};