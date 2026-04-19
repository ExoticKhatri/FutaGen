"use client";

import { useState } from 'react';
import { TraitData } from '@/types/traits';
import { Copy, Terminal, Cpu, Bug, Check } from 'lucide-react';

interface CanvasProps {
  data: TraitData | null;
}

type TabType = 'system' | 'ai' | 'debug';

export default function Canvas({ data }: CanvasProps) {
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'system', label: 'System Prompt', icon: Terminal },
    { id: 'ai', label: 'AI Prompt', icon: Cpu },
    { id: 'debug', label: 'Debugging', icon: Bug },
  ];

  return (
    <div className="h-full flex flex-col font-mono">
      {/* Header / Tabs */}
      <div className="flex border-b border-zinc-900 bg-black/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-widest border-b-2 transition-all ${
              activeTab === tab.id 
                ? 'border-teal-500 text-teal-500 bg-teal-500/5' 
                : 'border-transparent text-zinc-600 hover:text-zinc-400'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 relative group custom-scrollbar">
        {data ? (
          <>
            <button 
              onClick={handleCopy}
              className="absolute top-4 right-4 p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-teal-500 hover:border-teal-500/50 transition-all z-10"
            >
              {copied ? <Check size={14} className="text-teal-500" /> : <Copy size={14} />}
            </button>

            <div className="space-y-1">
              <span className="text-teal-900">const</span>{' '}
              <span className="text-teal-700">activeProfile</span> = {' '}
              <span className="text-teal-900">{'{'}</span>
              
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="pl-6 group/line flex items-start gap-2">
                  <span className="text-zinc-700 select-none">0{Object.keys(data).indexOf(key) + 1}</span>
                  <span className="text-teal-600">&quot;{key}&quot;</span>
                  <span className="text-zinc-500">:</span>
                  <span className="text-zinc-200">
                    &quot;{Array.isArray(value) ? value.join(', ') : value}&quot;
                  </span>
                  <span className="text-zinc-700">,</span>
                </div>
              ))}
              
              <span className="text-teal-900">{'}'}</span>
            </div>
            
            {/* Context Info Based on Tab */}
            <div className="mt-8 pt-8 border-t border-zinc-900/50">
              <div className="text-[9px] uppercase text-zinc-700 font-bold mb-2">Metadata / {activeTab}</div>
              <div className="p-3 rounded bg-zinc-950 border border-zinc-900/50 text-[10px] text-zinc-600 leading-relaxed italic">
                {activeTab === 'system' && "// Injecting trait logic into generation pipeline..."}
                {activeTab === 'ai' && "// Synthesizing character lore from resolved traits..."}
                {activeTab === 'debug' && `// Entropy validation: 64-bit seed verified.`}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-800">
            <Terminal size={40} className="mb-4 opacity-20" />
            <p className="text-[10px] uppercase tracking-[0.2em]">Awaiting Data Input...</p>
          </div>
        )}
      </div>
    </div>
  );
}