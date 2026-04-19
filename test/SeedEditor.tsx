"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Hash, RefreshCcw } from 'lucide-react';
import { CategoryKey } from '@/types/traits';
import { fillIncompleteSeed } from '@/utils/seedGen';
import { TRAIT_CONFIG } from '@/utils/config';

interface SeedEditorProps {
  seed: string;
  onSeedChange: (newSeed: string) => void;
  onRandomize: () => void;
}

export default function SeedEditor({ seed, onSeedChange, onRandomize }: SeedEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursor, setCursor] = useState<number | null>(null);

  // Formatting logic
  const getFormattedSeed = (raw: string) => {
    if (!raw) return "";
    const segments: string[] = [];
    const defs = TRAIT_CONFIG.categoryDefinitions;

    Object.entries(defs).forEach(([, def]) => {
      const [start, end] = def.seedIndex;
      if (start > 47) return; 
      const chunk = raw.substring(start, end + 1);
      if (chunk) segments.push(chunk);
    });

    const switchChar = raw[TRAIT_CONFIG.specialTraits.switchIndex] || '0';
    const specialSlots: string[] = [];
    for (let i = 1; i <= TRAIT_CONFIG.specialTraits.maxSlots; i++) {
      const slotKey = `specialSlot${i}` as CategoryKey;
      const def = defs[slotKey];
      if (def) {
        const chunk = raw.substring(def.seedIndex[0], def.seedIndex[1] + 1);
        if (chunk) specialSlots.push(chunk);
      }
    }

    const allSegments = [...segments, switchChar, ...specialSlots];
    return allSegments.join("-");
  };

  // Restore cursor position after render
  useEffect(() => {
    if (textareaRef.current && cursor !== null) {
      textareaRef.current.setSelectionRange(cursor, cursor);
    }
  }, [seed, cursor]);

  const parseFormattedSeed = (formatted: string): string => {
    // Remove hyphens to get raw character sequence
    const cleaned = formatted.replace(/[^a-z0-9]/gi, "").toLowerCase();
    // Take exactly first 64 characters
    return cleaned.substring(0, 64);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const selectionStart = textarea.selectionStart;

    // Extract raw seed from formatted input
    const rawValue = parseFormattedSeed(textarea.value);
    
    // Only update if we have a valid seed length or if the user is still typing
    // This prevents updates when the seed is incomplete
    if (rawValue.length > 0) {
      setCursor(selectionStart);
      
      // Auto-fill incomplete seeds with random characters
      // This ensures TraitEditor always gets a complete 64-char seed
      const completeSeed = rawValue.length < 64 ? fillIncompleteSeed(rawValue) : rawValue;
      onSeedChange(completeSeed);
    }
  };

  return (
    <div className="p-4 border-b border-zinc-900 bg-black">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Hash size={12} className="text-teal-500" />
          <label className="text-[10px] uppercase text-zinc-600 font-bold tracking-[0.2em]">
            Entropy Seed
          </label>
        </div>
        
        <button 
          onClick={onRandomize}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-teal-950/10 border border-teal-900/30 hover:bg-teal-900 hover:text-white transition-all group"
        >
          <RefreshCcw size={10} className="text-teal-500 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-[9px] uppercase font-bold text-teal-600 group-hover:text-white">Regen</span>
        </button>
      </div>

      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={getFormattedSeed(seed)}
          onChange={handleChange}
          className="w-full bg-[#050505] border border-zinc-800 rounded p-3 text-[12px] font-mono text-teal-500/80 leading-relaxed uppercase outline-none focus:border-teal-900 transition-colors resize-none h-24 custom-scrollbar selection:bg-teal-900/40"
          spellCheck={false}
          placeholder="PASTE_64_CHAR_SEED_HERE..."
        />
        <div className="absolute bottom-2 right-2 flex gap-3 pointer-events-none">
           <span className="text-[8px] text-zinc-800 uppercase font-bold">Base-36</span>
           <span className="text-[8px] text-zinc-800 uppercase font-bold">{seed.length}/64</span>
        </div>
      </div>
    </div>
  );
}