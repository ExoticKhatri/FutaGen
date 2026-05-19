"use client";

import React, { useState, useImperativeHandle, forwardRef, useEffect, useCallback, useRef } from 'react';
import { Hash, RefreshCcw } from 'lucide-react';
import { GENERATOR_CONFIG } from '@/lib/config';
import { generateRandomSeed } from '@/utils/seedGen';

interface SeedEditorProps {
  onSeedUpdate: (newSeed: string) => void;
  currentSeed?: string; // Accept the external seed from ControlPanel
  disable?: boolean;
}

const SeedEditor = forwardRef((props: SeedEditorProps, ref) => {
  const { onSeedUpdate, currentSeed, disable = false } = props; 
  const { MAX_LENGTH } = GENERATOR_CONFIG.SEED;
  
  // Initialize with currentSeed if available, otherwise empty
  const [internalSeed, setInternalSeed] = useState(currentSeed || "");

  const onSeedUpdateRef = useRef(onSeedUpdate);
  
  useEffect(() => {
    onSeedUpdateRef.current = onSeedUpdate;
  }, [onSeedUpdate]);

  /**
   * SYNC LOOP:
   * This effect listens for changes to 'currentSeed' coming from the parent.
   * If a trait selector updates the seed, this will update the text area.
   */
  // Tracks the last seed value we received from the parent so we can diff
  // without adding internalSeed to the dep array (which would cause a loop).
  const lastExternalSeed = useRef(currentSeed ?? "");

  useEffect(() => {
    if (currentSeed !== undefined && currentSeed !== lastExternalSeed.current) {
      lastExternalSeed.current = currentSeed;
      setInternalSeed(currentSeed);
    }
  }, [currentSeed]);

  const handleRandomize = useCallback(() => {
    if (disable) return;
    
    const newSeed = generateRandomSeed();
    setInternalSeed(newSeed);
    onSeedUpdateRef.current(newSeed);
  }, [disable]); 

  useImperativeHandle(ref, () => ({
    triggerRandomize: () => {
      handleRandomize();
    }
  }));

  // Only trigger initial randomize if the seed is currently empty
  useEffect(() => {
    if (!internalSeed && !disable) {
      handleRandomize();
    }
  }, [handleRandomize, internalSeed, disable]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, MAX_LENGTH);
    
    setInternalSeed(rawValue);
    onSeedUpdate(rawValue);
  };

  return (
    <section className={`relative group w-full`} >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Hash size={12} className={disable ? "text-zinc-600" : "text-accent"} />
          <h2 className="text-[10px] uppercase text-white/90 font-bold tracking-[0.2em]">
            Entropy Hash
          </h2>
        </div>
        {/* Counter UI to show seed length status */}
        <span className="text-[9px] font-mono text-white/20">
          {internalSeed.length} / {MAX_LENGTH}
        </span>
      </div>

      <div className={`relative overflow-hidden rounded-sm border transition-all ${
        disable 
          ? 'border-white/5 bg-black/20 cursor-not-allowed' 
          : 'border-white/5 bg-black/40 focus-within:border-accent/30'
      }`}>
        <textarea
          value={internalSeed}
          onChange={handleChange}
          disabled={disable}
          className="w-full h-22 bg-transparent p-4 pb-12 text-[13px] font-mono text-accent leading-relaxed uppercase outline-none resize-none selection:bg-accent/20 disabled:cursor-not-allowed custom-scrollbar"
          spellCheck={false}
          placeholder={disable ? "SYSTEM_LOCKED..." : "AWAITING_SYSTEM_SEED..."}
        />

        <div className="absolute bottom-2 right-2 z-10">
          <button 
            type="button"
            onClick={handleRandomize}
            disabled={disable}
            title={disable ? "System Locked" : "Internal Randomize"}
            className={`p-2 transition-all group rounded-sm shadow-2xl ${
              disable 
                ? 'bg-zinc-800/50 text-zinc-600 border-zinc-800 cursor-not-allowed' 
                : 'bg-accent/5 border border-accent/10 hover:bg-accent hover:text-black'
            }`}
          >
            <RefreshCcw 
              size={14} 
              className={disable ? "" : "group-hover:rotate-180 transition-transform duration-700 ease-in-out"} 
            />
          </button>
        </div>
      </div>
    </section>
  );
});

SeedEditor.displayName = "SeedEditor";
export default SeedEditor;