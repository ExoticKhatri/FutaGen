
import { Layout } from 'lucide-react';
import { FRAME_CONFIG } from '@/utils/config';

// Define the allowed IDs based on your config
type FrameId = typeof FRAME_CONFIG.options[number]['id'];

interface FrameEditorProps {
  currentFrame: FrameId;
  onFrameChange: (frame: FrameId) => void;
}

export default function FrameEditor({ currentFrame, onFrameChange }: FrameEditorProps) {
  return (
    <div className="p-4 border-b border-zinc-900 bg-black/50">
      <div className="flex items-center gap-2 mb-3">
        <Layout size={12} className="text-teal-500" />
        <label className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest">
          Composition Framing
        </label>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {FRAME_CONFIG.options.map((f) => (
          <button
            key={f.id}
            onClick={() => onFrameChange(f.id)}
            className={`py-2 px-3 text-[9px] uppercase font-bold border transition-all rounded text-center tracking-tighter ${
              currentFrame === f.id
                ? 'bg-teal-950/20 border-teal-500 text-teal-400'
                : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}