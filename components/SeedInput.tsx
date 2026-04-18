import { RefreshCcw, Hash } from 'lucide-react';

interface SeedInputProps {
  seed: string;
  disable: boolean;
  maxLength: number;
  onSeedChange: (newSeed: string) => void;
  onRandomize: () => void;
}

export default function SeedInput({
  seed,
  disable,
  maxLength,
  onSeedChange,
  onRandomize
}: SeedInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-zinc-500">
          <Hash size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">DNA Seed</span>
        </div>
        <span className="text-[9px] text-zinc-700 font-mono italic">
          {seed.length}/{maxLength}
        </span>
      </div>
      
      <div className="relative">
        <textarea
          aria-label="Seed"
          disabled={disable}
          value={seed}
          onChange={(e) => onSeedChange(e.target.value.replace(/\D/g, '').substring(0, maxLength))}
          className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-teal-500/50 transition-all text-zinc-400 font-mono resize-none leading-relaxed no-scrollbar"
          rows={3}
        />
        <button
          type="button"
          aria-label="Generate Random Seed"
          onClick={onRandomize}
          disabled={disable}
          className="absolute right-3 bottom-4 text-zinc-500 hover:text-teal-500 transition-transform active:rotate-180 duration-500 disabled:opacity-30"
        >
          <RefreshCcw size={14} />
        </button>
      </div>
    </div>
  );
}