"use client";

import { useState } from 'react';
import { Layout, Terminal, FileCode, Wand2, RefreshCw, AlertCircle } from 'lucide-react';
import { GeneratorState, ImageGenState } from '@/types/data';
import { TRAIT_CATEGORIES } from '@/types/traits';
import LogsTab from '@/components/Tabs/LogTab';
import SystemTab from '@/components/Tabs/SystemTab';

type TabType = 'view' | 'logs' | 'system' | 'final';

interface ViewPanelProps {
  state: GeneratorState;
  imageGenState: ImageGenState;
}

const STATUS_LABELS: Record<string, string> = {
  fetching_traits:   'FETCHING_TRAIT_DB',
  generating_prompt: 'ASSEMBLING_PROMPT',
  generating_image:  'RENDERING_IMAGE',
  error:             'PIPELINE_ERROR',
  done:              'RENDER_COMPLETE',
};

export default function ViewPanel({ state, imageGenState }: ViewPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('view');

  const tabs = [
    { id: 'view',   label: 'View',   icon: Layout   },
    { id: 'logs',   label: 'Logs',   icon: Terminal  },
    { id: 'system', label: 'System', icon: FileCode  },
    { id: 'final',  label: 'Final',  icon: Wand2     },
  ];

  const isRunning = ['fetching_traits', 'generating_prompt', 'generating_image'].includes(imageGenState.status);

  return (
    <div className="flex flex-col h-full uppercase tracking-widest overflow-hidden">

      {/* TAB HEADER */}
      <nav className="flex items-center gap-1 mb-6 border-b border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 transition-all duration-300 border-b-2 ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-white/30 hover:text-white/60"
              }`}
            >
              <Icon size={14} strokeWidth={2} />
              <span className="hidden md:block text-[9px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-black/40 backdrop-blur-md relative overflow-hidden">

        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent/40" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent/40" />

        <div className="h-full w-full p-4 font-mono overflow-y-auto custom-scrollbar">

          {/* ── VIEW TAB ──────────────────────────────────────────────── */}
          {activeTab === 'view' && (
            <div className="flex flex-col gap-4 h-full">

              {/* Trait summary grid */}
              {state.traitTitles && (
                <div className="shrink-0">
                  <p className="text-[8px] text-white/20 mb-2 tracking-[0.3em]">CHARACTER_BUILD</p>
                  <div className="grid grid-cols-2 gap-1">
                    {TRAIT_CATEGORIES.filter(c => c !== 'special').map(cat => {
                      const title = state.traitTitles?.[cat] as string | undefined;
                      if (!title) return null;
                      return (
                        <div key={cat} className="flex gap-2 px-2 py-1.5 bg-white/[0.02] border border-white/5">
                          <span className="text-[7px] text-accent/50 uppercase w-10 shrink-0 pt-px">{cat}</span>
                          <span className="text-[8px] text-white/50 normal-case truncate">{title}</span>
                        </div>
                      );
                    })}
                    {/* Special augments */}
                    {(state.traitTitles?.special as string[] | undefined)?.map((t, i) => (
                      <div key={`spec-${i}`} className="flex gap-2 px-2 py-1.5 bg-white/[0.02] border border-accent/10">
                        <span className="text-[7px] text-accent/40 uppercase w-10 shrink-0 pt-px">aug_{i + 1}</span>
                        <span className="text-[8px] text-white/50 normal-case truncate">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image / status area */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-0">

                {/* Idle */}
                {imageGenState.status === 'idle' && (
                  <div className="flex flex-col items-center opacity-30">
                    <div className="w-32 h-52 border border-white/10 flex items-center justify-center">
                      <span className="text-[8px] rotate-90 tracking-[1em]">SILHOUETTE</span>
                    </div>
                    <p className="mt-4 text-[9px]">AWAITING_RENDER_PIPELINE</p>
                  </div>
                )}

                {/* Running */}
                {isRunning && (
                  <div className="flex flex-col items-center gap-3 text-center px-2">
                    <RefreshCw size={20} className="animate-spin text-accent" />
                    <p className="text-[9px] text-accent tracking-widest">
                      {STATUS_LABELS[imageGenState.status] ?? imageGenState.status}
                    </p>
                    <p className="text-[8px] text-white/40 normal-case leading-relaxed">
                      {imageGenState.message}
                    </p>
                    {imageGenState.attempt > 0 && (
                      <p className="text-[8px] text-white/20">
                        ATTEMPT {imageGenState.attempt} / 4
                      </p>
                    )}
                  </div>
                )}

                {/* Error */}
                {imageGenState.status === 'error' && (
                  <div className="flex flex-col items-center gap-3 text-center px-2">
                    <AlertCircle size={20} className="text-red-400/70" />
                    <p className="text-[9px] text-red-400/70 tracking-widest">PIPELINE_ERROR</p>
                    <p className="text-[8px] text-white/30 normal-case leading-relaxed">
                      {imageGenState.message}
                    </p>
                  </div>
                )}

                {/* Done */}
                {imageGenState.status === 'done' && imageGenState.imageUrl && (
                  <div className="w-full flex flex-col gap-2">
                    <p className="text-[8px] text-accent/60 tracking-widest">RENDER_OUTPUT</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageGenState.imageUrl}
                      alt="Generated demon lady character"
                      className="w-full h-auto border border-white/10"
                    />
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ── LOGS TAB ──────────────────────────────────────────────── */}
          {activeTab === 'logs' && <LogsTab state={state} />}

          {/* ── SYSTEM TAB ────────────────────────────────────────────── */}
          {activeTab === 'system' && <SystemTab state={state} />}

          {/* ── FINAL TAB ─────────────────────────────────────────────── */}
          {activeTab === 'final' && (
            <div className="flex flex-col gap-4">
              <p className="text-[10px] text-accent">GENERATED_PROMPT_V1</p>
              {imageGenState.prompt ? (
                <div className="p-4 bg-white/[0.03] border border-white/5 text-[10px] text-white/70 normal-case leading-relaxed">
                  &quot;{imageGenState.prompt}&quot;
                </div>
              ) : (
                <div className="p-4 bg-white/[0.03] border border-white/5 text-[10px] text-white/70 normal-case leading-relaxed">
                  &quot;A hyper-detailed {state.style} demon lady, {state.composition} composition, in {state.frame} aspect ratio, seed:{state.seed}&quot;
                </div>
              )}
              <p className="text-[8px] text-white/20 italic">
                {imageGenState.prompt
                  ? 'AI-generated master prompt. Press Generate to create a new image.'
                  : 'Note: Press Generate to build the full descriptive prompt.'}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
