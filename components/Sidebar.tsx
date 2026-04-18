"use client";

import { useState, useEffect, useCallback } from 'react';
import SeedInput from './SeedInput';
import FrameSelector from './FrameSelector';
import TraitSelector, { BASE_TRAIT_CONFIG, MAX_SPECIAL_SLOTS } from './TraitSelector';
import { specialTraits } from '@/data/special';
import { getTraitFromSeed } from '@/utils/traitLogic';
import { TraitMapping } from '@/types/trait';

const MIN_LENGTH = BASE_TRAIT_CONFIG.length * 2;
const MAX_LENGTH = MIN_LENGTH + (MAX_SPECIAL_SLOTS * 2);

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
  const [frameValue, setFrameValue] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSeed(createRandomSeed());
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (mounted && generaterandom > 0) {
      const frame = requestAnimationFrame(() => {
        setSeed(createRandomSeed());
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [generaterandom, mounted]);

  useEffect(() => {
    if (!mounted || !seed || !onChange) return;

    const workingSeed = seed.padEnd(MAX_LENGTH, "0");
    const traits: string[] = [];

    // Parse Core Traits
    BASE_TRAIT_CONFIG.forEach((t, i) => {
      const pair = workingSeed.substring(i * 2, i * 2 + 2);
      const resolved = getTraitFromSeed(pair, t.mapping);
      if (resolved.name !== "00") {
        let traitString = `${t.label}=${resolved.name}`;
        if (resolved.description) traitString += ` - [Details: ${resolved.description}]`;
        traits.push(traitString);
      }
    });

    // Parse Mutations - Fixed the 'any' error by using TraitMapping
    for (let i = 0; i < MAX_SPECIAL_SLOTS; i++) {
      const idx = BASE_TRAIT_CONFIG.length + i;
      const pair = workingSeed.substring(idx * 2, idx * 2 + 2);
      const resolved = getTraitFromSeed(pair, specialTraits as TraitMapping);
      
      if (resolved.name !== "00" && pair !== "00") {
        let traitString = `mutation=${resolved.name}`;
        if (resolved.description) traitString += ` - [Details: ${resolved.description}]`;
        traits.push(traitString);
      }
    }

    if (frameValue) traits.push(`framing=${frameValue}`);
    onChange(traits.join(",\n"));
  }, [seed, mounted, onChange, frameValue]);

  const generateRandomSeedLocal = useCallback(() => {
    setSeed(createRandomSeed());
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-black animate-pulse" />;
  }

  return (
    <div className={`flex flex-col h-full space-y-4 transition-all duration-500 ${disable ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
      <SeedInput 
        seed={seed} 
        disable={disable} 
        maxLength={MAX_LENGTH} 
        onSeedChange={setSeed} 
        onRandomize={generateRandomSeedLocal} 
      />

      <FrameSelector 
        disable={disable} 
        onFrameChange={setFrameValue} 
      />
      
      <TraitSelector
        seed={seed}
        disable={disable}
        maxLength={MAX_LENGTH}
        onSeedChange={setSeed}
      />
    </div>
  );
}