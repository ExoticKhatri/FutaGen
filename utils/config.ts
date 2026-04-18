// @/config/generator.ts

export const GENERATOR_CONFIG = {
  // Change this to add or remove mutation slots
  MAX_SPECIAL_SLOTS: 2,
  
  // Possible seed lengths for randomization
  SEED_LENGTHS: [14, 16, 18],
};

/**
 * Logic to calculate derived lengths based on current configuration
 * @param baseTraitsCount The number of traits in BASE_TRAIT_CONFIG
 */
export const getDerivedLengths = (baseTraitsCount: number) => {
  const minLength = baseTraitsCount * 2;
  const maxLength = minLength + (GENERATOR_CONFIG.MAX_SPECIAL_SLOTS * 2);
  return { minLength, maxLength };
};