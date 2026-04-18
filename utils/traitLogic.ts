/**
 * Handles the mapping of seed pairs to traits with fallback logic.
 */

import { TraitMapping } from '@/types/trait';

export const getTraitFromSeed = (
  pair: string, 
  mapping: TraitMapping
): { name: string; code: string; description?: string } => {
  
  // Explicitly check for empty, single digit, or "00"
  // This triggers "AI Decide" mode
  if (!pair || pair === "00" || pair === "0" || pair === "") {
    return { name: "AI Decide", code: "00" };
  }

  const normalizedPair = pair.padStart(2, '0');

  // 1. Direct Match
  if (mapping[normalizedPair]) {
    const rawTrait = mapping[normalizedPair];
    if (typeof rawTrait === "string") {
      return { name: rawTrait, code: normalizedPair };
    }
    return { name: rawTrait.name, code: normalizedPair, description: rawTrait.description };
  }

  // 2. Out of Range / No Match: Pseudo-random valid selection
  // Convert keys to an array to pick a valid one based on the seed number
  const validKeys = Object.keys(mapping);
  if (validKeys.length > 0) {
    const seedNum = parseInt(normalizedPair, 10);
    // Use modulo to wrap the number around the length of valid traits
    const randomIndex = seedNum % validKeys.length;
    const selectedKey = validKeys[randomIndex];
    
    const rawTrait = mapping[selectedKey];
    if (typeof rawTrait === "string") {
      return { name: rawTrait, code: selectedKey };
    }
    return { name: rawTrait.name, code: selectedKey, description: rawTrait.description };
  }

  // 3. Absolute Fallback
  return { name: "AI Decide", code: "00" };
};

export const updateSeedWithTrait = (
  currentSeed: string,
  index: number,
  newPair: string,
  maxLength: number
): string => {
  const base = currentSeed.padEnd(maxLength, '0').split('');
  const charIndex = index * 2;
  
  base[charIndex] = newPair[0];
  base[charIndex + 1] = newPair[1];
  
  return base.join('');
};