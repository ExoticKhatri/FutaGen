
interface ControllerProps {
  onTriggerRandom: () => void;
  disabled?: boolean;
}

export default function Controller({ onTriggerRandom, disabled = false }: ControllerProps) {
  return (
    <div className="w-full bg-[#080808] border border-zinc-900 rounded p-4 shadow-xl">
      <button
        onClick={onTriggerRandom}
        disabled={disabled}
        className="w-full py-3 bg-red-950/10 border border-red-900/50 text-red-500 text-[10px] uppercase tracking-[0.3em] font-bold rounded hover:bg-red-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Generate Random Seed
      </button>
    </div>
  );
}