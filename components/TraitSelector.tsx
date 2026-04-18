"use client";

import { LayoutGrid, Sparkles } from 'lucide-react';
import { getTraitFromSeed, updateSeedWithTrait } from '@/utils/traitLogic';
import { TraitMapping } from '@/types/trait'; // Adjust this path to your types file

import { hairTraits } from '@/data/hair';
import { skinTraits } from '@/data/skin';
import { hornTraits } from '@/data/horn';
import { faceTraits } from '@/data/face';
import { bodyTraits } from '@/data/body';
import { clothTraits } from '@/data/cloth';
import { poseTraits } from '@/data/pose';
import { specialTraits } from '@/data/special';

// Exported so Sidebar can calculate MAX_LENGTH correctly
export const BASE_TRAIT_CONFIG = [
  { id: 'hair', label: 'hair', mapping: hairTraits as TraitMapping },
  { id: 'skin', label: 'skin', mapping: skinTraits as TraitMapping },
  { id: 'horn', label: 'horn', mapping: hornTraits as TraitMapping },
  { id: 'face', label: 'face', mapping: faceTraits as TraitMapping },
  { id: 'body', label: 'body', mapping: bodyTraits as TraitMapping },
  { id: 'cloth', label: 'cloth', mapping: clothTraits as TraitMapping },
  { id: 'pose', label: 'pose', mapping: poseTraits as TraitMapping },
];

export const MAX_SPECIAL_SLOTS = 2;

interface TraitSelectorProps {
  seed: string;
  disable: boolean;
  maxLength: number;
  onSeedChange: (newSeed: string) => void;
}

export default function TraitSelector({
  seed,
  disable,
  maxLength,
  onSeedChange,
}: TraitSelectorProps) {
  const workingSeed = seed.padEnd(maxLength, "0");

  return (
    <div className="space-y-6 overflow-y-auto pr-1 no-scrollbar pb-4">
      {/* Core Parameters Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1 text-zinc-500 mb-2">
          <LayoutGrid size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Core Parameters</span>
        </div>

        {BASE_TRAIT_CONFIG.map((trait, index) => {
          const rawPair = workingSeed.substring(index * 2, index * 2 + 2);
          const resolved = getTraitFromSeed(rawPair, trait.mapping);

          return (
            <div key={trait.id} className="space-y-1.5">
              <div className="flex justify-between px-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                <label>{trait.id}</label>
                <span className="font-mono text-teal-500/40">{rawPair}</span>
              </div>
              <select
                aria-label={trait.id}
                disabled={disable}
                value={resolved.code}
                onChange={(e) => onSeedChange(updateSeedWithTrait(seed, index, e.target.value, maxLength))}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-[11px] text-zinc-300 focus:outline-none focus:border-teal-500 appearance-none"
              >
                <option value="00">AI Decide (00)</option>
                {Object.entries(trait.mapping).map(([code, value]) => {
                  const displayName = typeof value === 'string' ? value : value.name;
                  return (
                    <option key={code} value={code}>{displayName} ({code})</option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>

      {/* Special Mutations Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-1 text-purple-500/70 mb-2">
          <Sparkles size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Special Mutations</span>
        </div>

        {[...Array(MAX_SPECIAL_SLOTS)].map((_, i) => {
          const slotIndex = BASE_TRAIT_CONFIG.length + i;
          const rawPair = workingSeed.substring(slotIndex * 2, slotIndex * 2 + 2);
          const resolved = getTraitFromSeed(rawPair, (specialTraits as unknown) as TraitMapping);

          return (
            <div key={`special-${i}`} className="space-y-1.5">
              <div className="flex justify-between px-1 text-[9px] font-bold uppercase tracking-widest text-purple-400/50">
                <label>Mutation Slot {i + 1}</label>
                <span className="font-mono text-purple-500/30">{rawPair}</span>
              </div>
              <select
                aria-label={`Mutation Slot ${i + 1}`}
                disabled={disable}
                value={resolved.code}
                onChange={(e) => onSeedChange(updateSeedWithTrait(seed, slotIndex, e.target.value, maxLength))}
                className="w-full bg-purple-900/10 border border-purple-900/30 rounded-lg px-3 py-2 text-[11px] text-zinc-300 focus:outline-none focus:border-purple-500/50 appearance-none"
              >
                <option value="00">None (00)</option>
                {Object.entries(specialTraits).map(([code, value]) => {
                    const displayName = typeof value === 'string' ? value : (value as {name:string}).name;
                  return (
                    <option key={code} value={code}>{displayName} ({code})</option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}