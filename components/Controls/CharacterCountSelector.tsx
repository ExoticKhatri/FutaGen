import { Users } from 'lucide-react';
import { GENERATOR_CONFIG } from '@/lib/config';

interface CharacterCountSelectorProps {
  count: number;
  setCount: (count: number) => void;
  disable?: boolean;
}

export default function CharacterCountSelector({ count, setCount, disable = false }: CharacterCountSelectorProps) {
  const { MIN_CHARACTERS, MAX_CHARACTERS } = GENERATOR_CONFIG.SEED;
  const options = Array.from(
    { length: MAX_CHARACTERS - MIN_CHARACTERS + 1 },
    (_, i) => MIN_CHARACTERS + i
  );

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-2 text-zinc-500">
          <Users size={12} className={disable ? "text-zinc-600" : "text-accent"} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Character Count</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-1">
        {options.map((n) => {
          const isActive = count === n;
          return (
            <button
              key={n}
              type="button"
              disabled={disable}
              onClick={() => setCount(n)}
              className={`
                relative py-3 px-3 rounded-lg border transition-all duration-300
                uppercase tracking-tight font-bold overflow-hidden
                flex items-center justify-center text-center text-[10px] min-h-[42px]
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
              <span className="relative z-10">{n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
