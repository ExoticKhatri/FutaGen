import { CategoryKey, VariantLogic, TraitData } from '../types/traits';
import { TRAIT_CONFIG } from './config';

// Added return type to include filters for the UI
export interface ResolutionResult {
  traits: Omit<TraitData, 'frame'>;
  filters: Record<CategoryKey, { whitelists: string[][], blacklists: string[][] }>;
  resolvedSlots: {
    specialSlot1: string;
    specialSlot2: string;
    specialSlot3: string;
  };
}

export const resolveVariantId = (
  seedSegment: string,
  allVariants: VariantLogic[],
  activeFilters: { whitelists: string[][]; blacklists: string[][] }
): string => {
  const seedValue = parseInt(seedSegment, 36);
  const legalList = allVariants.filter((v) => {
    const isWhitelisted = activeFilters.whitelists.length > 0 
      ? activeFilters.whitelists.some(list => list.includes(v.id))
      : true;
    const isBlacklisted = activeFilters.blacklists.some(list => list.includes(v.id));
    return isWhitelisted && !isBlacklisted;
  });

  if (legalList.length === 0) return allVariants[0]?.id || "000";
  return legalList[seedValue % legalList.length].id;
};

export const resolveTraitTree = (
  seed: string, 
  logicLibrary: Record<CategoryKey, VariantLogic[]>
): ResolutionResult => {
  const resolved: Partial<Record<CategoryKey, string>> = {};
  const globalFilters: Record<CategoryKey, { whitelists: string[][], blacklists: string[][] }> = {} as Record<CategoryKey, { whitelists: string[][], blacklists: string[][] }>;

  Object.keys(TRAIT_CONFIG.categoryDefinitions).forEach(key => {
    globalFilters[key as CategoryKey] = { whitelists: [], blacklists: [] };
  });

  // 1. Core Resolution - Sort entries to ensure deterministic order
  const sortedEntries = Object.entries(TRAIT_CONFIG.categoryDefinitions).sort(([keyA], [keyB]) => {
    // Resolve in seed index order (left to right) for determinism
    const defA = TRAIT_CONFIG.categoryDefinitions[keyA as CategoryKey];
    const defB = TRAIT_CONFIG.categoryDefinitions[keyB as CategoryKey];
    return defA.seedIndex[0] - defB.seedIndex[0];
  });

  sortedEntries.forEach(([key, def]) => {
    const catKey = key as CategoryKey;
    const [start, end] = def.seedIndex;
    const segment = seed.substring(start, end + 1);
    
    const variants = logicLibrary[catKey] || [];
    const id = resolveVariantId(segment, variants, globalFilters[catKey]);
    resolved[catKey] = id;

    const chosenVariant = variants.find(v => v.id === id);
    if (chosenVariant?.hasDependency) {
      if (chosenVariant.whitelist) {
        Object.entries(chosenVariant.whitelist).forEach(([targetCat, list]) => {
          globalFilters[targetCat as CategoryKey].whitelists.push(list as string[]);
        });
      }
      if (chosenVariant.blacklist) {
        Object.entries(chosenVariant.blacklist).forEach(([targetCat, list]) => {
          globalFilters[targetCat as CategoryKey].blacklists.push(list as string[]);
        });
      }
    }
  });

  // 2. Special Traits Logic - Fixed for deterministic behavior
  const switchDigit = seed[TRAIT_CONFIG.specialTraits.switchIndex] || '0';
  const qty = parseInt(switchDigit, 36) % 4;
  
  // Get the resolved slot values (always returned for UI)
  const slots: string[] = [];
  for (let i = 1; i <= TRAIT_CONFIG.specialTraits.maxSlots; i++) {
    const slotKey = `specialSlot${i}` as CategoryKey;
    slots.push(resolved[slotKey] || '000');
  }
  
  // Build special array: include non-'000' slots up to qty limit
  const nonEmptySlots = slots.filter(slot => slot !== '000');
  const specials = nonEmptySlots.slice(0, qty);

  const traits = {
    mood: resolved.mood!,
    bodyType: resolved.bodyType!,
    shoulders: resolved.shoulders!,
    chest: resolved.chest!,
    arms: resolved.arms!,
    waist: resolved.waist!,
    hips: resolved.hips!,
    legs: resolved.legs!,
    skinType: resolved.skinType!,
    hairStyle: resolved.hairStyle!,
    hairColor: resolved.hairColor!,
    faceGeo: resolved.faceGeo!,
    eyes: resolved.eyes!,
    expression: resolved.expression!,
    pose: resolved.pose!,
    clothing: resolved.clothing!,
    special: specials.length > 0 ? specials : null,
  } as Omit<TraitData, 'frame'>;

  // Build resolvedSlots object dynamically based on maxSlots
  const resolvedSlotsObj: Record<string, string> = {};
  for (let i = 1; i <= TRAIT_CONFIG.specialTraits.maxSlots; i++) {
    const slotKey = `specialSlot${i}` as CategoryKey;
    resolvedSlotsObj[slotKey] = resolved[slotKey] || '000';
  }
  
  return { 
    traits, 
    filters: globalFilters,
    resolvedSlots: resolvedSlotsObj as Record<'specialSlot1' | 'specialSlot2' | 'specialSlot3', string>
  };
};

export const updateSeedAtSegment = (
  currentSeed: string,
  category: CategoryKey,
  newId: string
): string => {
  const def = TRAIT_CONFIG.categoryDefinitions[category];
  if (!def) return currentSeed;
  const [start, end] = def.seedIndex;
  const segmentLength = (end - start) + 1;
  const paddedId = newId.padStart(segmentLength, '0').substring(0, segmentLength);
  return currentSeed.substring(0, start) + paddedId + currentSeed.substring(end + 1);
};

/**
 * Find which parent trait(s) are applying filters to a given trait
 */
export const getParentTraits = (
  traitKey: CategoryKey
): CategoryKey[] => {
  const parents: CategoryKey[] = [];
  
  // Check all categories to see if they have dependencies that affect this trait
  Object.entries(TRAIT_CONFIG.categoryDefinitions).forEach(([parentKey, parentDef]) => {
    const parentCatKey = parentKey as CategoryKey;
    if (parentDef.impacts?.includes(traitKey)) {
      parents.push(parentCatKey);
    }
  });
  
  return parents;
};

/**
 * Find a valid seed value for a given trait ID that will resolve to that ID
 * This ensures that when we manually select a trait, the seed will consistently resolve to that selection
 */
export const findSeedValueForTraitId = (
  traitKey: CategoryKey,
  desiredId: string,
  allVariants: VariantLogic[],
  activeFilters: { whitelists: string[][]; blacklists: string[][] }
): string => {
  // First check if the desired ID is legal
  const isWhitelisted = activeFilters.whitelists.length > 0 
    ? activeFilters.whitelists.some(list => list.includes(desiredId))
    : true;
  const isBlacklisted = activeFilters.blacklists.some(list => list.includes(desiredId));
  
  if (!isWhitelisted || isBlacklisted) {
    // If not legal, find the first legal variant
    const legalVariants = allVariants.filter((v) => {
      const isWl = activeFilters.whitelists.length > 0 
        ? activeFilters.whitelists.some(list => list.includes(v.id))
        : true;
      const isBl = activeFilters.blacklists.some(list => list.includes(v.id));
      return isWl && !isBl;
    });
    
    if (legalVariants.length > 0) {
      // Use the first legal variant
      return legalVariants[0].id;
    }
    
    // Fallback to first variant if no legal options found
    return allVariants[0]?.id || "000";
  }
  
  // If desired ID is legal, return it
  return desiredId;
};