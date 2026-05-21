"use client";

import { Wand2 } from 'lucide-react';

interface PromptLoadingProps {
  status: string;
  message: string;
}

const STATUS_LABELS: Record<string, string> = {
  fetching_traits:   'FETCHING_TRAIT_DB',
  generating_prompt: 'ASSEMBLING_PROMPT',
};

const ASSEMBLY_ROWS = [
  { label: 'SKIN',    w: 92 },
  { label: 'FACE',    w: 85 },
  { label: 'HAIR',    w: 100 },
  { label: 'HORNS',   w: 78 },
  { label: 'BODY',    w: 95 },
  { label: 'OUTFIT',  w: 88 },
  { label: 'POSE',    w: 72 },
  { label: 'MOOD',    w: 96 },
  { label: 'SPECIAL', w: 60 },
];

export default function PromptLoading({ status, message }: PromptLoadingProps) {
  return (
    <div className="flex flex-col gap-4 w-full px-1">

      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-accent/15 pb-2.5">
        <Wand2 size={12} className="text-accent shrink-0" strokeWidth={1.5} />
        <span className="text-[9px] text-accent tracking-[0.25em] flex-1 truncate">
          {STATUS_LABELS[status] ?? status}
        </span>
        <span className="text-accent text-[11px] leading-none animate-pulse">▋</span>
      </div>

      {/* Trait assembly rows — each fades in sequentially */}
      <div className="space-y-2.5">
        {ASSEMBLY_ROWS.map(({ label, w }, i) => (
          <div
            key={label}
            className="flex items-center gap-2"
            style={{
              opacity: 0,
              animation: 'fadeIn 0.25s ease forwards',
              animationDelay: `${i * 0.13}s`,
            }}
          >
            <span className="text-[8px] text-white/20 w-11 shrink-0 tracking-wider font-mono">
              {label}
            </span>
            <div className="flex-1 h-[2px] bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent/55 rounded-full animate-pulse"
                style={{ width: `${w}%`, animationDelay: `${i * 0.09}s` }}
              />
            </div>
            <span className="text-[7px] text-accent/40 shrink-0 tracking-widest font-mono">OK</span>
          </div>
        ))}
      </div>

      {/* Status message */}
      <p
        className="text-[8px] text-white/25 normal-case leading-relaxed border-t border-white/5 pt-2.5 italic"
        style={{ opacity: 0, animation: 'fadeIn 0.3s ease forwards', animationDelay: '1.3s' }}
      >
        {message}
      </p>
    </div>
  );
}
