import { GENERATOR_CONFIG } from "./config";
import { MappedTraits } from "@/types/data";

const { UNIT_LENGTH, MIN_CHARACTERS, MAX_CHARACTERS } = GENERATOR_CONFIG.SEED;

/** Byte offset of a per-unit `offset` inside the given character's block. */
const unitOffset = (characterIndex: number, offset: number): number =>
  characterIndex * UNIT_LENGTH + offset;

/** Total seed length required to hold `characterCount` characters. */
export function seedLengthForCount(characterCount: number): number {
  return characterCount * UNIT_LENGTH;
}

/** How many full character blocks a seed currently holds (at least MIN_CHARACTERS). */
export function characterCountForSeed(seed: string): number {
  return Math.max(MIN_CHARACTERS, Math.floor(seed.length / UNIT_LENGTH));
}

export { UNIT_LENGTH, MIN_CHARACTERS, MAX_CHARACTERS };

/**
 * DECODER: Translates one character's block of the seed into raw trait
 * segments. Returns the raw 2-char slice for each trait — use resolveTraitIndex
 * in the UI to map these to actual variant indices via modulo.
 *
 * @param characterIndex - Which character's block to decode (0-based)
 */
export function decodeSeed(seed: string, characterIndex: number = 0): MappedTraits {
  const map = GENERATOR_CONFIG.SEED.TRAIT_MAP;

  const getSlice = (offset: number, len: number) =>
    seed.substring(unitOffset(characterIndex, offset), unitOffset(characterIndex, offset) + len).toUpperCase();

  const traits: Omit<MappedTraits, 'special'> = {
    body:   getSlice(map.body.offset,   map.body.length),
    eyes:   getSlice(map.eyes.offset,   map.eyes.length),
    face:   getSlice(map.face.offset,   map.face.length),
    hair:   getSlice(map.hair.offset,   map.hair.length),
    horns:  getSlice(map.horns.offset,  map.horns.length),
    mood:   getSlice(map.mood.offset,   map.mood.length),
    outfit: getSlice(map.outfit.offset, map.outfit.length),
    pose:   getSlice(map.pose.offset,   map.pose.length),
    skin:   getSlice(map.skin.offset,   map.skin.length),
  };

  // Special Switch Logic
  const countChar = getSlice(map.special_count.offset, map.special_count.length);
  const numSpecialTraits = parseInt(countChar, 36) % 4;

  const specialTraits: string[] = [];
  for (let i = 0; i < numSpecialTraits; i++) {
    const slot = map.special_slots[i];
    specialTraits.push(getSlice(slot.offset, slot.length));
  }

  return { ...traits, special: specialTraits };
}

/**
 * MODULO RESOLVER: Converts a raw 2-char base36 seed segment into
 * a guaranteed-valid array index for a variants array of any size.
 *
 * @param rawSegment  - The 2-char string extracted from the seed (e.g. "3F")
 * @param variantCount - The number of available variants in the library
 * @returns           - A valid index in [0, variantCount)
 */
export function resolveTraitIndex(rawSegment: string, variantCount: number): number {
  if (variantCount <= 0) return 0;
  const numeric = parseInt(rawSegment, 36) || 0;
  return numeric % variantCount;
}

/**
 * STANDARD ENCODER: Updates specific characters in a seed for a
 * standard (non-special) trait key.
 *
 * @param currentSeed   - The full seed string
 * @param characterIndex - Which character's block to write into (0-based)
 * @param traitKey      - Which trait to update (must NOT be 'special')
 * @param newValue      - The exact base36_map value to write (e.g. "1A")
 */
/** Only the standard (non-array) trait entries — safe to index by key */
const STANDARD_TRAIT_MAP: Record<Exclude<keyof MappedTraits, 'special'>, { offset: number; length: number }> = {
  body:   GENERATOR_CONFIG.SEED.TRAIT_MAP.body,
  eyes:   GENERATOR_CONFIG.SEED.TRAIT_MAP.eyes,
  face:   GENERATOR_CONFIG.SEED.TRAIT_MAP.face,
  hair:   GENERATOR_CONFIG.SEED.TRAIT_MAP.hair,
  horns:  GENERATOR_CONFIG.SEED.TRAIT_MAP.horns,
  mood:   GENERATOR_CONFIG.SEED.TRAIT_MAP.mood,
  outfit: GENERATOR_CONFIG.SEED.TRAIT_MAP.outfit,
  pose:   GENERATOR_CONFIG.SEED.TRAIT_MAP.pose,
  skin:   GENERATOR_CONFIG.SEED.TRAIT_MAP.skin,
};

export function encodeSeed(
  currentSeed: string,
  characterIndex: number,
  traitKey: Exclude<keyof MappedTraits, 'special'>,
  newValue: string
): string {
  const map = STANDARD_TRAIT_MAP[traitKey];
  if (!map) return currentSeed;

  // Normalise: uppercase, then LEFT-pad with zeros to the required length.
  // padStart (not padEnd) ensures "3" → "03", not "30".
  const normalised = newValue.toUpperCase().padStart(map.length, '0');
  const seedArray   = currentSeed.split('');
  const base = unitOffset(characterIndex, map.offset);

  for (let i = 0; i < map.length; i++) {
    seedArray[base + i] = normalised[i];
  }

  return seedArray.join('');
}

/**
 * SPECIAL ENCODER: Updates one of the three special trait slots in the seed.
 *
 * @param currentSeed    - The full seed string
 * @param characterIndex - Which character's block to write into (0-based)
 * @param slotIndex      - Which special slot (0, 1, or 2)
 * @param newValue       - The exact base36_map value to write (e.g. "0Z")
 */
export function encodeSpecialSlot(
  currentSeed: string,
  characterIndex: number,
  slotIndex: number,
  newValue: string
): string {
  const slots = GENERATOR_CONFIG.SEED.TRAIT_MAP.special_slots;
  if (slotIndex < 0 || slotIndex >= slots.length) return currentSeed;

  const slot = slots[slotIndex];
  // LEFT-pad so "3" → "03", not "30".
  const normalised = newValue.toUpperCase().padStart(slot.length, '0');
  const seedArray  = currentSeed.split('');
  const base = unitOffset(characterIndex, slot.offset);

  for (let i = 0; i < slot.length; i++) {
    seedArray[base + i] = normalised[i];
  }

  return seedArray.join('');
}

/**
 * Reads the current active special-trait count from the seed (0–3)
 * for the given character's block.
 */
export function getNumSpecialTraits(seed: string, characterIndex: number = 0): number {
  const { offset, length } = GENERATOR_CONFIG.SEED.TRAIT_MAP.special_count;
  const base = unitOffset(characterIndex, offset);
  const countChar = seed.substring(base, base + length).toUpperCase();
  return parseInt(countChar, 36) % 4;
}

/**
 * SPECIAL COUNT ENCODER: Writes the number of active special traits
 * (0–3) into the given character's special_count slot.
 *
 * @param currentSeed    - The full seed string
 * @param characterIndex - Which character's block to write into (0-based)
 * @param count          - How many special slots are active (0, 1, 2, or 3)
 */
export function encodeSpecialCount(currentSeed: string, characterIndex: number, count: number): string {
  const { offset } = GENERATOR_CONFIG.SEED.TRAIT_MAP.special_count;
  const clamped = Math.max(0, Math.min(3, count));
  const seedArray = currentSeed.split("");
  seedArray[unitOffset(characterIndex, offset)] = clamped.toString(36).toUpperCase();
  return seedArray.join("");
}