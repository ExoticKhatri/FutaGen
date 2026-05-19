import { Layout } from 'lucide-react';
import { GENERATOR_CONFIG } from '@/lib/config';

interface CompProps {
  activeId: string;
  setComp: (id: string) => void;
  disable?: boolean;
}

export default function CompositionSelector({ activeId, setComp, disable = false }: CompProps) {
  return (
    // Add h-full and flex flex-col to allow internal stretching
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-2 text-zinc-500">
          <Layout size={14} className="text-accent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">VIew Composition</span>
        </div>
      </div>

      {/* Changed to flex-1 to take up remaining height */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {GENERATOR_CONFIG.COMPOSITIONS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disable}
              onClick={() => setComp(item.id)}
              className={`
                relative px-2 rounded-lg border transition-all duration-300
                uppercase tracking-tight font-bold overflow-hidden
                flex items-center justify-center text-center text-[10px]
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
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}