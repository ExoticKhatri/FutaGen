// utils/seedGen.ts

import { GENERATOR_CONFIG } from './config';

export const generateEntropySeed = (): string => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  const length = GENERATOR_CONFIG.seed.maxLength;
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Fill an incomplete seed with random characters to reach the required length
 * @param incompleteSeed - Partial seed (less than 64 chars)
 * @returns Complete 64-character seed with random fill
 */
export const fillIncompleteSeed = (incompleteSeed: string): string => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  const targetLength = GENERATOR_CONFIG.seed.maxLength;
  
  if (incompleteSeed.length >= targetLength) {
    return incompleteSeed.substring(0, targetLength);
  }
  
  let result = incompleteSeed;
  for (let i = incompleteSeed.length; i < targetLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

export const isValidSeed = (seed: string): boolean => {
  const regex = new RegExp(`^[a-z0-9]{${GENERATOR_CONFIG.seed.minLength}}$`, 'i');
  return regex.test(seed);
};