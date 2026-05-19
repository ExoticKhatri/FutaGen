import { Terminal } from 'lucide-react';
import { GeneratorState } from '@/types/data';

interface LogsTabProps {
  state: GeneratorState;
}

export default function LogsTab({ state }: LogsTabProps) {

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-accent" />
          <p className="text-[10px] text-accent">DATA_STREAM_RAW</p>
        </div>
      </div>

      <div className="flex-1 relative">
        <pre className="absolute inset-0 text-[10px] text-white/60 lowercase leading-relaxed whitespace-pre-wrap break-all bg-white/2 p-4 border border-white/5 rounded overflow-y-auto custom-scrollbar">
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>
    </div>
  );
}