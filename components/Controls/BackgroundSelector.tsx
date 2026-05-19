import { Layers } from 'lucide-react';
import { GENERATOR_CONFIG } from '@/lib/config';

interface BackgroundSelectorProps {
  activeId: string;
  setBackground: (id: string) => void;
  disable?: boolean;
}

export default function BackgroundSelector({ activeId, setBackground, disable = false }: BackgroundSelectorProps) {
  return (
    <section className="space-y-3 w-full">
      <div className="flex items-center gap-2 px-1">
        <Layers size={12} className={disable ? 'text-zinc-600' : 'text-accent'} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Background</span>
      </div>

      <div className="flex flex-row gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {GENERATOR_CONFIG.BACKGROUNDS.map((bg) => {
          const isActive = activeId === bg.id;
          return (
            <button
              key={bg.id}
              type="button"
              disabled={disable}
              onClick={() => setBackground(bg.id)}
              className={`
                relative flex-shrink-0 min-w-20 py-2.5 px-3 rounded-lg border transition-all duration-300
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
              <span className="relative z-10 text-[9px] font-bold uppercase tracking-tight">{bg.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
