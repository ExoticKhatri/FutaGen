"use client";

import React from 'react';
import { Wind } from 'lucide-react';
import { GENERATOR_CONFIG } from '@/lib/config';

interface FrameSelectorProps {
  activeId: string;
  setFrame: (id: string) => void;
  disable?: boolean;
}

export default function FrameSelector({ activeId, setFrame, disable = false }: FrameSelectorProps) {
  return (
    <section className="space-y-3 w-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 ">
          <Wind size={14} className="text-accent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Image Ratio</span>
        </div>
      </div>

      <div className="flex flex-row gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {GENERATOR_CONFIG.FRAMES.map((f) => {
          const isActive = activeId === f.id;
          return (
            <button
              key={f.id}
              type="button"
              disabled={disable}
              onClick={() => setFrame(f.id)}
              className={`
                relative flex-1 min-w-[80px] py-2.5 rounded-lg border transition-all duration-300
                flex flex-col items-center justify-center gap-1 overflow-hidden
                ${isActive 
                  ? 'bg-teal-500/5 border-teal-500/40 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)]' 
                  : 'bg-zinc-900/20 border-zinc-800/60 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-800/40'
                }
                disabled:opacity-20 disabled:cursor-not-allowed
              `}
            >
              {isActive && (
                <div className="absolute inset-0 bg-linear-to-br from-teal-500/10 to-transparent pointer-events-none" />
              )}
              <span className="relative z-10 text-[9px] font-bold uppercase tracking-tight">{f.label}</span>
              <span className="relative z-10 text-[7px] font-mono opacity-50">{f.ratio}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}