"use client";

import { useState } from 'react';
import { Layout, Terminal, Wand2, Upload, RefreshCw, AlertCircle, Copy, Check, Download, ZoomIn, X } from 'lucide-react';
import { GeneratorState, ImageGenState } from '@/types/data';
import LogsTab from '@/components/Tabs/LogTab';
import UploadTab from '@/components/Tabs/UploadTab';

type TabType = 'view' | 'logs' | 'final' | 'upload';

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
  const [activeTab, setActiveTab]   = useState<TabType>('view');
  const [copied, setCopied]         = useState(false);
  const [copiedRaw, setCopiedRaw]   = useState(false);
  const [zoomed, setZoomed]         = useState(false);

  const downloadImage = () => {
    const url = imageGenState.imageUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `futagen-${Date.now()}.png`;
    a.click();
  };

  const tabs = [
    { id: 'view',   label: 'View',   icon: Layout   },
    { id: 'logs',   label: 'Logs',   icon: Terminal  },
    { id: 'final',  label: 'Prompt', icon: Wand2     },
    { id: 'upload', label: 'Upload', icon: Upload    },
  ];

  const isRunning = ['fetching_traits', 'generating_prompt', 'generating_image'].includes(imageGenState.status);

  const copyPrompt = () => {
    const text = imageGenState.prompt;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <div className="flex flex-col items-center justify-center h-full gap-4">

              {imageGenState.status === 'idle' && (
                <div className="flex flex-col items-center opacity-30">
                  <div className="w-32 h-52 border border-white/10 flex items-center justify-center">
                    <span className="text-[8px] rotate-90 tracking-[1em]">SILHOUETTE</span>
                  </div>
                  <p className="mt-4 text-[9px]">AWAITING_RENDER_PIPELINE</p>
                </div>
              )}

              {isRunning && (
                <div className="flex flex-col items-center gap-4 text-center px-4">
                  <RefreshCw size={22} className="animate-spin text-accent" />
                  <div className="space-y-2">
                    <p className="text-[10px] text-accent tracking-[0.3em]">
                      {STATUS_LABELS[imageGenState.status] ?? imageGenState.status}
                    </p>
                    <p className="text-[9px] text-white/40 normal-case leading-relaxed">
                      {imageGenState.message}
                    </p>
                  </div>
                </div>
              )}

              {imageGenState.status === 'error' && (
                <div className="flex flex-col gap-3 w-full px-2">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <AlertCircle size={22} className="text-red-400/60" />
                    <p className="text-[10px] text-red-400/70 tracking-[0.3em]">PIPELINE_ERROR</p>
                    <p className="text-[9px] text-white/30 normal-case leading-relaxed break-all">
                      {imageGenState.message}
                    </p>
                  </div>

                  {imageGenState.rawInput && (
                    <div className="mt-2 border border-white/10 rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] text-yellow-400/70 tracking-[0.2em]">RAW_INPUT — use this to generate manually</p>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(imageGenState.rawInput!);
                            setCopiedRaw(true);
                            setTimeout(() => setCopiedRaw(false), 2000);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 text-white/30 hover:text-accent border border-white/10 hover:border-accent/30 transition-colors"
                        >
                          {copiedRaw ? <Check size={10} /> : <Copy size={10} />}
                          <span className="text-[8px] font-bold">{copiedRaw ? 'COPIED' : 'COPY'}</span>
                        </button>
                      </div>
                      <p className="text-[9px] text-white/40 normal-case leading-relaxed whitespace-pre-wrap break-words max-h-48 overflow-y-auto custom-scrollbar">
                        {imageGenState.rawInput}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {imageGenState.status === 'done' && imageGenState.imageUrl && (
                <div className="w-full flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[8px] text-accent/60 tracking-widest">RENDER_OUTPUT</p>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        title="Zoom"
                        onClick={() => setZoomed(true)}
                        className="p-1 text-white/30 hover:text-accent transition-colors"
                      >
                        <ZoomIn size={12} />
                      </button>
                      <button
                        type="button"
                        title="Download"
                        onClick={downloadImage}
                        className="p-1 text-white/30 hover:text-accent transition-colors"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageGenState.imageUrl}
                    alt="Generated demon lady character"
                    className="w-full h-auto border border-white/10 cursor-zoom-in"
                    onClick={() => setZoomed(true)}
                  />
                  {imageGenState.message && (
                    <p className="text-[8px] text-white/25 normal-case">{imageGenState.message}</p>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ── LOGS TAB ──────────────────────────────────────────────── */}
          {activeTab === 'logs' && <LogsTab state={state} />}

          {/* ── FINAL PROMPT TAB ──────────────────────────────────────── */}
          {activeTab === 'final' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <p className="text-[10px] text-accent">MASTER_PROMPT</p>
                {imageGenState.prompt && (
                  <button
                    type="button"
                    onClick={copyPrompt}
                    title="Copy prompt"
                    className="flex items-center gap-1.5 px-2 py-1 text-white/30 hover:text-accent transition-colors border border-white/10 hover:border-accent/30"
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    <span className="text-[8px] font-bold">{copied ? 'COPIED' : 'COPY'}</span>
                  </button>
                )}
              </div>

              {imageGenState.prompt ? (
                <p className="text-[10px] text-white/60 normal-case leading-relaxed">
                  {imageGenState.prompt}
                </p>
              ) : (
                <p className="text-[9px] text-white/20 italic normal-case leading-relaxed">
                  No prompt generated yet. Press Generate to create one.
                </p>
              )}
            </div>
          )}

          {/* ── UPLOAD TAB ────────────────────────────────────────────── */}
          {activeTab === 'upload' && (
            <UploadTab state={state} imageGenState={imageGenState} />
          )}

        </div>
      </div>

      {/* ── ZOOM LIGHTBOX ─────────────────────────────────────────────── */}
      {zoomed && imageGenState.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            title="Download"
            onClick={e => { e.stopPropagation(); downloadImage(); }}
            className="absolute top-4 right-14 p-2 text-white/40 hover:text-white transition-colors z-10"
          >
            <Download size={18} />
          </button>
          <div
            className="w-full h-full overflow-auto flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
            style={{ touchAction: 'pinch-zoom' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageGenState.imageUrl}
              alt="Generated character zoomed"
              className="max-w-none h-auto select-none"
              style={{ maxHeight: '95vh', cursor: 'zoom-out' }}
              onClick={() => setZoomed(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
