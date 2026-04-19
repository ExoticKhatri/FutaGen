"use client";

import React, { useMemo, useEffect } from 'react';
import { Dna, Binary } from 'lucide-react';
import { TraitData, CategoryKey } from '@/types/traits';
import { resolveTraitTree, updateSeedAtSegment, getParentTraits, findSeedValueForTraitId, ResolutionResult } from '@/utils/traitsEngine';
import { TRAIT_CONFIG } from '@/utils/config';
import { logicLibrary } from '@/data/logic';
import { displayLibrary } from '@/data/display';
import TraitDropdown from './TraitDropdown';

interface TraitEditorProps {
  seed: string;
  onSeedChange: (newSeed: string) => void;
  onTraitsReady: (traits: Omit<TraitData, 'frame'>) => void;
}

export default function TraitEditor({ seed, onSeedChange, onTraitsReady }: TraitEditorProps) {
  // Compute traits from seed without storing in state - fixes cascading render warning
  const res = useMemo<ResolutionResult | null>(() => {
    if (seed && seed.length === 64) {
      return resolveTraitTree(seed, logicLibrary);
    }
    return null;
  }, [seed]);

  // Notify parent when traits are ready
  useEffect(() => {
    if (res) {
      onTraitsReady(res.traits);
    }
  }, [res, onTraitsReady]);

  const handleManualSelect = (key: CategoryKey, newId: string) => {
    if (!res) return;
    
    const def = TRAIT_CONFIG.categoryDefinitions[key];
    if (!def) return;
    
    // Get the currently active filters for this category
    const catFilters = res.filters[key];
    
    // Validate that the selected ID is legal
    const variants = logicLibrary[key] || [];
    const validatedId = findSeedValueForTraitId(key, newId, variants, catFilters);
    
    // Update the seed with the validated ID
    const updatedSeed = updateSeedAtSegment(seed, key, validatedId);
    onSeedChange(updatedSeed);
  };

  if (!res) return <div className="p-10 text-zinc-800">Initializing...</div>;

  const { traits, filters, resolvedSlots } = res as ResolutionResult;

  // Helper to check if an ID is allowed by the current resolution
  const isOptionLegal = (cat: CategoryKey, id: string) => {
    const catFilters = filters[cat];
    const isWhitelisted = catFilters.whitelists.length > 0 
      ? catFilters.whitelists.some(list => list.includes(id))
      : true;
    const isBlacklisted = catFilters.blacklists.some(list => list.includes(id));
    return isWhitelisted && !isBlacklisted;
  };

  // Helper to get the current value for a trait (handles special slots)
  const getTraitValue = (traitKey: CategoryKey): string => {
    // Check if this is a special slot by checking against max slots
    const slotMatch = traitKey.match(/specialSlot(\d+)/);
    if (slotMatch) {
      const slotNum = parseInt(slotMatch[1]);
      if (slotNum >= 1 && slotNum <= TRAIT_CONFIG.specialTraits.maxSlots) {
        return resolvedSlots[traitKey as keyof typeof resolvedSlots];
      }
    }
    
    const resolvedValue = traits[traitKey as keyof Omit<TraitData, 'frame'>];
    return Array.isArray(resolvedValue) ? (resolvedValue[0] || "000") : (resolvedValue as string);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#080808]">
      <div className="px-4 py-2 bg-zinc-950/50 border-b border-zinc-900 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Dna size={12} className="text-teal-500" />
          <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Biological Mapping</span>
        </div>
                <div className="flex items-center gap-2">
           <Binary size={10} className="text-teal-950" />
           <span className="text-[8px] font-mono text-zinc-800 truncate max-w-62.5">{seed}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {Object.entries(TRAIT_CONFIG.categoryDefinitions).map(([key, def]) => {
          const traitKey = key as CategoryKey;
          const activeId = getTraitValue(traitKey);
          const options = Object.values(displayLibrary[traitKey] || {});
          const isCurrentIllegal = !isOptionLegal(traitKey, activeId);
          
          // Get parent traits that affect this trait
          const parentTraits = getParentTraits(traitKey);
          const parentKey = parentTraits.length > 0 ? parentTraits[0] : undefined;
          const parentDisplayName = parentKey ? TRAIT_CONFIG.categoryDefinitions[parentKey].displayName : undefined;

          return (
            <TraitDropdown
              key={key}
              traitDef={def}
              activeId={activeId}
              options={options}
              isLegal={(id: string) => isOptionLegal(traitKey, id)}
              isCurrentIllegal={isCurrentIllegal}
              onChange={(newId: string) => handleManualSelect(traitKey, newId)}
              dependsOn={parentTraits}
              dependentDisplayName={parentDisplayName}
            />
          );
        })}
      </div>
    </div>
  );
}