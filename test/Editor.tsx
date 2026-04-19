"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { TraitData } from '@/types/traits';
import { generateEntropySeed } from '@/utils/seedGen';
import SeedEditor from '@/test/SeedEditor';
import FrameEditor from '@/test/FrameEditor';
import TraitEditor from '@/test/TraitsEditor';

interface EditorProps {
  onDataChange: (data: TraitData) => void;
  triggerKey: number;
}

export default function Editor({ onDataChange, triggerKey }: EditorProps) {
  // 1. Initialize with empty string to avoid hydration mismatch
  // Seed will be generated only on client in useEffect
  const [currentSeed, setCurrentSeed] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [frame, setFrame] = useState<TraitData['frame']>('full');
  const [mappedTraits, setMappedTraits] = useState<Omit<TraitData, 'frame'> | null>(null);
  
  // Ref to track if we've already handled the current triggerKey to prevent loops
  const lastTriggerRef = useRef(triggerKey);

  const handleRandomize = useCallback(() => {
    const newSeed = generateEntropySeed();
    setCurrentSeed(newSeed);
  }, []);

  // 2. Initialize seed only on client to avoid hydration mismatch
  // This runs once when component mounts on the client
  useEffect(() => {
    // Generate and set the initial seed only once on the client
    // This is safe for hydration initialization despite the lint warning
    // eslint-disable-next-line
    setCurrentSeed(generateEntropySeed());
    setIsHydrated(true);
  }, []);

  // 3. Sync with global randomize trigger 
  // We only call this if the triggerKey actually changed from the last known value
  useEffect(() => {
    if (isHydrated && triggerKey !== lastTriggerRef.current) {
      handleRandomize();
      lastTriggerRef.current = triggerKey;
    }
  }, [triggerKey, handleRandomize, isHydrated]);

  // 4. Push final combined data to parent
  // We use a separate effect to notify the parent when internal state settles
  useEffect(() => {
    if (isHydrated && mappedTraits) {
      onDataChange({
        ...mappedTraits,
        frame: frame,
      } as TraitData);
    }
  }, [mappedTraits, frame, onDataChange, isHydrated]);

  return (
    <div className="w-full h-full bg-[#080808] border border-zinc-900 rounded shadow-2xl flex flex-col overflow-hidden">
      
      {/* TOP ROW: Seed and Frame Side-by-Side */}
      <div className="grid grid-cols-2 border-b border-zinc-900">
        <div className="border-r border-zinc-900">
          <SeedEditor 
            seed={currentSeed} 
            onSeedChange={setCurrentSeed}
            onRandomize={handleRandomize}      
          />
        </div>
        <div>
          <FrameEditor 
            currentFrame={frame} 
            onFrameChange={setFrame} 
          />
        </div>
      </div>

      {/* BOTTOM SECTION: Trait Editor taking full space */}
      <div className="flex-1 flex flex-col min-h-0">
        <TraitEditor 
          seed={currentSeed} 
          onSeedChange={setCurrentSeed} 
          onTraitsReady={setMappedTraits} 
        />
      </div>

    </div>
  );
}