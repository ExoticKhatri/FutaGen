"use client";

import { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, Hash, LayoutGrid, Sparkles } from 'lucide-react';
import { getTraitFromSeed, updateSeedWithTrait } from '@/utils/traitLogic';

import { hairTraits } from '@/data/hair';
import { skinTraits } from '@/data/skin';
import { hornTraits } from '@/data/horn';
import { faceTraits } from '@/data/face';
import { bodyTraits } from '@/data/body';
import { clothTraits } from '@/data/cloth';
import { poseTraits } from '@/data/pose';
import { specialTraits } from '@/data/special';

const BASE_TRAIT_CONFIG = [
  { id: 'hair', label: 'hair', mapping: hairTraits },
  { id: 'skin', label: 'skin', mapping: skinTraits },
  { id: 'horn', label: 'horn', mapping: hornTraits },
  { id: 'face', label: 'face', mapping: faceTraits },
  { id: 'body', label: 'body', mapping: bodyTraits },
  { id: 'cloth', label: 'cloth', mapping: clothTraits },
  { id: 'pose', label: 'pose', mapping: poseTraits },
];

const MAX_SPECIAL_SLOTS = 2;
const MIN_LENGTH = BASE_TRAIT_CONFIG.length * 2;
const MAX_LENGTH = MIN_LENGTH + (MAX_SPECIAL_SLOTS * 2);

// Move the logic outside the component to keep it pure
const createRandomSeed = () => {
  const possibleLengths = [14, 16, 18];
  const randomLength = possibleLengths[Math.floor(Math.random() * possibleLengths.length)];
  let result = "";
  for (let i = 0; i < randomLength; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
};

interface SidebarProps {
  disable: boolean;
  generaterandom: number;
  onChange?: (result: string) => void;
}

export default function Sidebar({ disable, generaterandom, onChange }: SidebarProps) {
  const [seed, setSeed] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSeed(createRandomSeed());
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Watch for the generaterandom prop to trigger a new random seed
  useEffect(() => {
    if (mounted && generaterandom > 0) {
      const frame = requestAnimationFrame(() => {
        setSeed(createRandomSeed());
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [generaterandom, mounted]);

  // Whenever seed changes, parse the traits and instantly report back
  useEffect(() => {
    if (!mounted || !seed || !onChange) return;

    const workingSeed = seed.padEnd(MAX_LENGTH, "0");
    const traits: string[] = [];

    BASE_TRAIT_CONFIG.forEach((t, i) => {
      const pair = workingSeed.substring(i * 2, i * 2 + 2);
      const resolved = getTraitFromSeed(pair, t.mapping);
      if (resolved.name !== "00") {
        let traitString = `${t.label}=${resolved.name}`;
        if (resolved.description) {
          traitString += ` - [Details: ${resolved.description}]`;
        }
        traits.push(traitString);
      }
    });

    for (let i = 0; i < MAX_SPECIAL_SLOTS; i++) {
      const idx = BASE_TRAIT_CONFIG.length + i;
      const pair = workingSeed.substring(idx * 2, idx * 2 + 2);
      const resolved = getTraitFromSeed(pair, specialTraits);
      if (resolved.name !== "00" && pair !== "00") {
        let traitString = `mutation=${resolved.name}`;
        if (resolved.description) {
          traitString += ` - [Details: ${resolved.description}]`;
        }
        traits.push(traitString);
      }
    }

    onChange(traits.join(",\n"));
  }, [seed, mounted, onChange]);

  const generateRandomSeedLocal = useCallback(() => {
    setSeed(createRandomSeed());
  }, []);

  // Prevent rendering the seed-dependent UI until mounted to avoid mismatch
  if (!mounted) {
    return <div className="w-full h-full bg-black animate-pulse" />;
  }

  return (
    <div className={`flex flex-col h-full space-y-4 transition-all duration-500 ${disable ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-zinc-500">
            <Hash size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">DNA Seed</span>
          </div>
          <span className="text-[9px] text-zinc-700 font-mono italic">{seed.length}/{MAX_LENGTH}</span>
        </div>
        
        <div className="relative">
          <textarea
            aria-label='Seed'
            disabled={disable}
            value={seed}
            onChange={(e) => setSeed(e.target.value.replace(/\D/g, '').substring(0, MAX_LENGTH))}
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-teal-500/50 transition-all text-zinc-400 font-mono resize-none leading-relaxed no-scrollbar"
            rows={3}
          />
          <button
            aria-label="Generate Random Seed"
            onClick={generateRandomSeedLocal}
            disabled={disable}
            className="absolute right-2 top-3 text-zinc-500 hover:text-teal-500 transition-transform active:rotate-180 duration-500"
          >
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-1 no-scrollbar pb-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1 text-zinc-500 mb-2">
            <LayoutGrid size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Core Parameters</span>
          </div>
          
          {BASE_TRAIT_CONFIG.map((trait, index) => {
            const workingSeed = seed.padEnd(MAX_LENGTH, "0");
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
                  onChange={(e) => setSeed(updateSeedWithTrait(seed, index, e.target.value, MAX_LENGTH))}
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

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 px-1 text-purple-500/70 mb-2">
            <Sparkles size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Special Mutations</span>
          </div>

          {[...Array(MAX_SPECIAL_SLOTS)].map((_, i) => {
            const slotIndex = BASE_TRAIT_CONFIG.length + i;
            const workingSeed = seed.padEnd(MAX_LENGTH, "0");
            const rawPair = workingSeed.substring(slotIndex * 2, slotIndex * 2 + 2);
            const resolved = getTraitFromSeed(rawPair, specialTraits);

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
                  onChange={(e) => setSeed(updateSeedWithTrait(seed, slotIndex, e.target.value, MAX_LENGTH))}
                  className="w-full bg-purple-900/10 border border-purple-900/30 rounded-lg px-3 py-2 text-[11px] text-zinc-300 focus:outline-none focus:border-purple-500/50 appearance-none"
                >
                  <option value="00">None (00)</option>
                  {Object.entries(specialTraits).map(([code, value]) => {
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
      </div>
    </div>
  );
}