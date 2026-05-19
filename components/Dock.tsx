import { Dices, Sparkles, Terminal, RefreshCw, Wand2, Images } from 'lucide-react';

interface DockProps {
  onDiceClick?: () => void;
  onGenerateClick?: () => void;
  onMasterClick?: () => void;
  onScreenChange?: (screen: 'create' | 'library') => void;
  screen?: 'create' | 'library';
  generating?: boolean;
}

export default function Dock({
  onDiceClick,
  onGenerateClick,
  onMasterClick,
  onScreenChange,
  screen = 'create',
  generating = false,
}: DockProps) {
  const inLibrary = screen === 'library';

  return (
    <nav className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">

      {/* ── Sub-buttons (hidden in library) ── */}
      {!inLibrary && (
        <>
          <button
            type="button"
            title="Master controls"
            onClick={onMasterClick}
            className="p-2.5 rounded-xl text-white/25 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <Terminal size={16} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            title="Randomize seed"
            onClick={onDiceClick}
            disabled={generating}
            className="p-2.5 rounded-xl text-white/25 hover:text-amber-400 hover:bg-white/5 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Dices size={16} strokeWidth={1.5} />
          </button>

          <div className="w-px h-5 bg-white/10 mx-0.5" />
        </>
      )}

      {/* ── Main Generate button (hidden in library) ── */}
      {!inLibrary && (
        <>
          <button
            type="button"
            title={generating ? 'Generating…' : 'Generate'}
            onClick={onGenerateClick}
            disabled={generating}
            className={`p-4 rounded-xl border transition-all duration-300 ${
              generating
                ? 'bg-accent/5 border-accent/15 text-accent/40 cursor-not-allowed'
                : 'bg-accent/10 border-accent/25 text-accent hover:bg-accent hover:text-black hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]'
            }`}
          >
            {generating
              ? <RefreshCw size={20} strokeWidth={2} className="animate-spin" />
              : <Sparkles size={20} strokeWidth={2} />
            }
          </button>

          <div className="w-px h-5 bg-white/10 mx-0.5" />
        </>
      )}

      {/* ── Create / Library segmented switch ── */}
      <div className="flex items-center gap-0.5 bg-white/3 border border-white/8 rounded-xl p-1">
        <button
          type="button"
          title="Create"
          onClick={() => onScreenChange?.('create')}
          className={`p-2 rounded-lg transition-all duration-200 ${
            !inLibrary
              ? 'bg-accent/15 border border-accent/25 text-accent'
              : 'text-white/25 hover:text-white/55'
          }`}
        >
          <Wand2 size={14} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          title="Library"
          onClick={() => onScreenChange?.('library')}
          className={`p-2 rounded-lg transition-all duration-200 ${
            inLibrary
              ? 'bg-accent/15 border border-accent/25 text-accent'
              : 'text-white/25 hover:text-white/55'
          }`}
        >
          <Images size={14} strokeWidth={1.5} />
        </button>
      </div>

    </nav>
  );
}
