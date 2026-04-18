/**
 * Handles the mapping of seed pairs to traits with fallback logic.
 */

export const getTraitFromSeed = (
  pair: string, 
  mapping: Record<string, string>
): { name: string; code: string } => {
  
  // Explicitly check for empty, single digit, or "00"
  // This triggers "AI Decide" mode
  if (!pair || pair === "00" || pair === "0" || pair === "") {
    return { name: "AI Decide", code: "00" };
  }

  const normalizedPair = pair.padStart(2, '0');

  // 1. Direct Match
  if (mapping[normalizedPair]) {
    return { name: mapping[normalizedPair], code: normalizedPair };
  }

  // 2. Out of Range / No Match: Pseudo-random valid selection
  // Convert keys to an array to pick a valid one based on the seed number
  const validKeys = Object.keys(mapping);
  if (validKeys.length > 0) {
    const seedNum = parseInt(normalizedPair, 10);
    // Use modulo to wrap the number around the length of valid traits
    const randomIndex = seedNum % validKeys.length;
    const selectedKey = validKeys[randomIndex];
    
    return { name: mapping[selectedKey], code: selectedKey };
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