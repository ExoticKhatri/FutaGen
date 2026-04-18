"use client";

import { useEffect, useState, useRef } from 'react';
import { Camera } from 'lucide-react';

const FRAME_OPTIONS = [
  { id: 'full', label: 'Full Body', value: 'full-body shot framed from head to toe' },
  { id: 'thighs', label: 'Medium', value: 'medium-wide shot framed from the thighs up' },
  { id: 'belly', label: 'Mid Close-up', value: 'medium close-up framed from the waist up' },
  { id: 'portrait', label: 'Close-up', value: 'extreme close-up portrait focusing on the head and shoulders' },
];

interface FrameSelectorProps {
  disable: boolean;
  onFrameChange: (value: string) => void;
}

export default function FrameSelector({ disable, onFrameChange }: FrameSelectorProps) {
  const [selected, setSelected] = useState(FRAME_OPTIONS[0].id);
  // Ref to track what we've already sent to the parent to avoid infinite loops
  const lastEmittedValue = useRef<string>("");

  // Sync with parent whenever 'selected' changes
  useEffect(() => {
    const current = FRAME_OPTIONS.find(f => f.id === selected);
    if (current && current.value !== lastEmittedValue.current) {
      lastEmittedValue.current = current.value;
      onFrameChange(current.value);
    }
  }, [selected, onFrameChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-zinc-500">
          <Camera size={14} className={selected ? "text-zinc-500" : ""} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Camera Framing</span>
        </div>
        <span className="text-[8px] text-zinc-700 font-mono uppercase tracking-widest bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-800/50">
          {selected}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {FRAME_OPTIONS.map((option) => {
          const isActive = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disable}
              onClick={() => setSelected(option.id)}
              className={`
                relative px-2 py-2.5 text-[10px] rounded-lg border transition-all duration-300
                uppercase tracking-tight font-bold overflow-hidden
                ${isActive 
                  ? 'bg-teal-500/5 border-teal-500/40 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)]' 
                  : 'bg-zinc-900/20 border-zinc-800/60 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-800/40'
                }
                disabled:opacity-20 disabled:cursor-not-allowed
              `}
            >
              {/* Subtle background glow for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-linear-to-br from-teal-500/10 to-transparent pointer-events-none" />
              )}
              
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}