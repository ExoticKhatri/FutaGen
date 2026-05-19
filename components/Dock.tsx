import { Dices, Sparkles, Terminal, RefreshCw } from 'lucide-react';

interface DockProps {
  onDiceClick?: () => void;
  onGenerateClick?: () => void;
  onMasterClick?: () => void;
  disabled?: boolean;
  generating?: boolean;
}

export default function Dock({
  onDiceClick,
  onGenerateClick,
  onMasterClick,
  disabled = false,
  generating = false,
}: DockProps) {

  return (
    <nav
      className={`flex items-center gap-2 p-2 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 ${
        disabled ? "opacity-40 pointer-events-none grayscale" : "opacity-100"
      }`}
    >
      {/* 1. SECONDARY: MASTER */}
      <button
        type="button"
        title="Master controls"
        onClick={onMasterClick}
        disabled={disabled}
        className="group relative p-3 text-white/20 hover:text-white transition-all duration-300"
      >
        <Terminal size={18} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* 2. PRIMARY: GENERATE */}
      <button
        type="button"
        onClick={onGenerateClick}
        disabled={disabled || generating}
        className={`group relative px-6 py-3 border rounded-xl transition-all duration-300 flex items-center gap-3 overflow-hidden ${
          generating
            ? "bg-accent/5 border-accent/10 text-accent/40 cursor-not-allowed"
            : "bg-accent/10 border-accent/20 hover:bg-accent hover:text-black text-accent"
        }`}
      >
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-accent text-black text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity rounded uppercase tracking-[0.2em] pointer-events-none whitespace-nowrap">
          Execute_Generation
        </span>

        {generating
          ? <RefreshCw size={18} strokeWidth={2} className="relative z-10 animate-spin" />
          : <Sparkles size={18} strokeWidth={2} className="relative z-10 group-hover:rotate-12 transition-transform" />
        }
        <span className="text-[10px] font-black tracking-[0.2em] relative z-10 uppercase">
          {generating ? "Generating" : "Generate"}
        </span>

        <div className="absolute inset-0 bg-accent/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* 3. SYSTEM: RANDOM GEN */}
      <button
        type="button"
        title="Randomize seed"
        onClick={onDiceClick}
        disabled={disabled}
        className="group relative p-3 text-white/40 hover:text-amber-400 transition-all duration-300"
      >
        <Dices size={18} strokeWidth={1.5} className="group-active:scale-90 transition-transform" />
      </button>
    </nav>
  );
}
