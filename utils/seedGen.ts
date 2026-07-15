import { seedLengthForCount } from "@/lib/seedEngine";

const CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

const randomChars = (length: number): string =>
  Array.from({ length }, () => CHARS.charAt(Math.floor(Math.random() * CHARS.length))).join("");

/**
 * Generates a random base36 seed sized for `characterCount` characters
 * (UNIT_LENGTH chars per character).
 */
export const generateRandomSeed = (characterCount: number): string =>
  randomChars(seedLengthForCount(characterCount));

/**
 * Resizes an existing seed to match `characterCount`: truncates when
 * shrinking, or appends fresh random characters for the new character
 * blocks when growing — existing characters' traits are left untouched.
 */
export const resizeSeedForCharacterCount = (seed: string, characterCount: number): string => {
  const targetLength = seedLengthForCount(characterCount);
  if (seed.length === targetLength) return seed;
  if (seed.length > targetLength) return seed.slice(0, targetLength);
  return seed + randomChars(targetLength - seed.length);
};
