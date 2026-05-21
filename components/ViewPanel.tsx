"use client";

import { useState } from 'react';
import { Layout, Terminal, Wand2, Upload } from 'lucide-react';
import { GeneratorState, ImageGenState } from '@/types/data';
import ViewTab    from '@/components/Tabs/ViewTab';
import LogsTab    from '@/components/Tabs/LogTab';
import PromptTab  from '@/components/Tabs/PromptTab';
import UploadTab  from '@/components/Tabs/UploadTab';

type TabType = 'view' | 'logs' | 'final' | 'upload';

interface ViewPanelProps {
  state: GeneratorState;
  imageGenState: ImageGenState;
}

const TABS = [
  { id: 'view',   label: 'View',   icon: Layout   },
  { id: 'logs',   label: 'Logs',   icon: Terminal  },
  { id: 'final',  label: 'Prompt', icon: Wand2     },
  { id: 'upload', label: 'Upload', icon: Upload    },
] as const;

export default function ViewPanel({ state, imageGenState }: ViewPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('view');

  return (
    <div className="flex flex-col h-full uppercase tracking-widest overflow-hidden">

      {/* Tab header */}
      <nav className="flex items-center gap-1 mb-6 border-b border-white/5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 transition-all duration-300 border-b-2 ${
                isActive
                  ? 'border-accent text-accent'
                  : 'border-transparent text-white/30 hover:text-white/60'
              }`}
            >
              <Icon size={14} strokeWidth={2} />
              <span className="hidden md:block text-[9px] font-bold">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Content area */}
      <div className="flex-1 bg-black/40 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent/40" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent/40" />

        <div className="h-full w-full p-4 font-mono overflow-y-auto custom-scrollbar">
          {activeTab === 'view'   && <ViewTab   imageGenState={imageGenState} />}
          {activeTab === 'logs'   && <LogsTab   state={state} />}
          {activeTab === 'final'  && <PromptTab prompt={imageGenState.prompt} />}
          {activeTab === 'upload' && <UploadTab state={state} imageGenState={imageGenState} />}
        </div>
      </div>

    </div>
  );
}
