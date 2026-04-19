// types/traits.ts

/**
 * All valid categories in the 64-character Base36 seed.
 */
export type CategoryKey =
  | 'mood'
  | 'bodyType'
  | 'shoulders' | 'chest' | 'arms' | 'waist' | 'hips' | 'legs'
  | 'skinType'
  | 'hairStyle'
  | 'hairColor'
  | 'faceGeo'
  | 'eyes'
  | 'expression'
  | 'pose'
  | 'clothing'
  | 'specialSlot1' | 'specialSlot2' | 'specialSlot3';

/**
 * Defines the structural logic for a Trait Category.
 */
export interface TraitDefinition {
  displayName: string;
  seedIndex: [number, number]; // Position in the 64-char string
  dependsOn?: CategoryKey[];   // Parents that filter this trait
  impacts?: CategoryKey[];     // Children this trait filters
}

/**
 * THIN LOGIC LAYER (RAM Resident)
 * Used for seed parsing and dependency calculations.
 */
export interface VariantLogic {
  id: string;             // Base36 (e.g., "02B" or "7V")
  hasDependency: boolean; // Shortcut flag for the engine
  
  // Relational Filtering
  whitelist?: Partial<Record<CategoryKey, string[]>>;
  blacklist?: Partial<Record<CategoryKey, string[]>>;
}

/**
 * THE FRONTEND CONTENT (UI Resident)
 * Light objects for the dashboard and dropdowns.
 */
export interface VariantDisplay {
  id: string; 
  name: string;
}

/**
 * THE AI/LORE LAYER (Lazy Loaded)
 * Deep descriptions passed to AI, kept in a separate file.
 */
export interface VariantLore {
  id: string;
  description: string; 
}

/**
 * MASTER LOOKUP TABLES
 */
export interface LogicLibrary {
  categories: Record<CategoryKey, TraitDefinition>;
  variants: Record<CategoryKey, VariantLogic[]>;
}

export type DisplayLibrary = Record<string, VariantDisplay>;
export type LoreLibrary = Record<string, VariantLore>;


export interface TraitData {
  mood: string;
  bodyType: string;
  shoulders: string;
  chest: string;
  arms: string;
  waist: string;
  hips: string;
  legs: string;
  skinType: string;
  hairStyle: string;
  hairColor: string;
  faceGeo: string;
  eyes: string;
  expression: string;
  pose: string;
  clothing: string;
  /**
   * Special is a stackable feature. 
   * Can be an array of trait IDs or null if no special traits are present.
   */
  special?: string[]; 
  frame: 'full' | 'mid' | 'close' | 'extreme';
}