/**
 * traits.ts
 * Type definitions for the Seed-Based Character Generator
 */

// 1. Define the specific segments of the 64-char seed for type safety
export type Base36Segment = string; // Specifically a 3-character string (e.g., "0af")
export type Base10Mapping = number; // The decimal equivalent (0 to 46,655)

// 2. Define the individual Trait Structure
export interface TraitVariant {
  /** The Primary Key in Supabase */
  id: string;

  /** The decimal value mapped from the seed segment */
  base10_map: Base10Mapping;

  /** The 3-character base36 string (e.g., '001' through 'zzz') */
  base36_map: Base36Segment;

  /** The name of the variant (e.g., "Curved Obsidian Horns") */
  title: string;

  /** Lore or physical description of the trait */
  description: string;
}

// 3. Define the categories to keep track of which trait is which
export type TraitCategory = 
  | 'body'
  | 'eyes'
  | 'face'
  | 'hair'
  | 'horns'
  | 'mood'
  | 'outfit'
  | 'pose'
  | 'skin'
  | 'special';

export const TRAIT_CATEGORIES: TraitCategory[] = [
  'body',
  'eyes',
  'face',
  'hair',
  'horns',
  'mood',
  'outfit',
  'pose',
  'skin',
  'special'
];

// 4. A helper type for when you fetch a full character build
export type CharacterBuild = Record<TraitCategory, TraitVariant>;

/**
 * Quick Utility Function Example:
 * To convert your 3-char seed segment to the base10_map
 */
export const segmentToBase10 = (segment: string): number => {
  return parseInt(segment, 36);
};