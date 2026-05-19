import { GENERATOR_CONFIG } from "@/lib/config";

/**
 * Generates a random base36 string based on config lengths
 */
export const generateRandomSeed = (): string => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  const length = GENERATOR_CONFIG.SEED.MAX_LENGTH;
  
  return Array.from({ length }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};
