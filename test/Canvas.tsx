"use client";

import { useState } from 'react';
import { generateAIInstructionPrompt, resolveTraitDetails } from '@/utils/aiInstructionGenerator';
import { TraitData } from '@/types/traits';
import { Copy, Terminal, Cpu, Bug, Check } from 'lucide-react';

interface CanvasProps {
  data: TraitData | null;
}

type TabType = 'system' | 'ai' | 'debug';

type DebugMappingItem = {
  label: string;
  id: string;
  description: string;
};

const aiPromptText = 'AI prompt view is reserved for the resolved generation prompt.';

function buildDebugMappings(data: TraitData): DebugMappingItem[] {
  return resolveTraitDetails(data).map((item) => ({
    label: item.label,
    id: item.id,
    description: item.description,
  }));
}

export default function Canvas({ data }: CanvasProps) {
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [copied, setCopied] = useState(false);

  const systemPromptText = data ? generateAIInstructionPrompt(data) : '';
  const debugJson = data ? JSON.stringify(data, null, 2) : '';
  const debugMappings = data ? buildDebugMappings(data) : [];
  const debugText = data
    ? `${debugJson}\n\nResolved feature lore:\n${debugMappings
        .map((item) => `${item.label}: ${item.id}\n${item.description}`)
        .join('\n\n')}`
    : '';

  const activeTabText = activeTab === 'system'
    ? systemPromptText
    : activeTab === 'ai'
      ? aiPromptText
      : debugText;

  const handleCopy = () => {
    if (!activeTabText) return;
    navigator.clipboard.writeText(activeTabText);
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
      <div className="flex items-stretch border-b border-zinc-900 bg-black/20">
        <div className="flex flex-1">
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

        <div className="flex items-center border-l border-zinc-900 px-2">
          <button
            onClick={handleCopy}
            disabled={!activeTabText}
            className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-teal-500 hover:border-teal-500/50 transition-all disabled:opacity-40 disabled:hover:text-zinc-500 disabled:hover:border-zinc-800"
            aria-label={`Copy ${activeTab} tab content`}
          >
            {copied ? <Check size={14} className="text-teal-500" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        {data ? (
          <>
            {activeTab === 'system' && (
              <div className="rounded border border-zinc-900/50 bg-zinc-950 p-4 text-[11px] leading-relaxed text-zinc-400">
                {systemPromptText}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="rounded border border-zinc-900/50 bg-zinc-950 p-4 text-[11px] leading-relaxed text-zinc-400">
                {aiPromptText}
              </div>
            )}

            {activeTab === 'debug' && (
              <div className="space-y-6">
                <div>
                  <div className="mb-2 text-[9px] font-bold uppercase text-zinc-700">Raw JSON</div>
                  <pre className="overflow-x-auto rounded border border-zinc-900/50 bg-zinc-950 p-4 text-[11px] leading-relaxed text-zinc-200 whitespace-pre-wrap">
                    {debugJson}
                  </pre>
                </div>

                <div className="border-t border-zinc-900/50 pt-6">
                  <div className="mb-3 text-[9px] font-bold uppercase text-zinc-700">Resolved Feature Lore</div>
                  <div className="space-y-3">
                    {debugMappings.map((item) => (
                      <div key={`${item.label}-${item.id}`} className="rounded border border-zinc-900/50 bg-zinc-950 p-3">
                        <div className="text-[10px] uppercase tracking-widest text-teal-500">
                          {item.label} <span className="ml-2 text-zinc-500 normal-case tracking-normal">{item.id}</span>
                        </div>
                        <div className="mt-2 text-[11px] leading-relaxed text-zinc-300">{item.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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