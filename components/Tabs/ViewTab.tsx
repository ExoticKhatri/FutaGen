"use client";

import { useState } from 'react';
import { AlertCircle, Copy, Check, Sparkles } from 'lucide-react';
import { ImageGenState } from '@/types/data';
import PromptLoading from '@/components/Loading/PromptLoading';
import ImageCarousel from '@/components/ImageCarousel';

interface ViewTabProps {
  imageGenState: ImageGenState;
}

export default function ViewTab({ imageGenState }: ViewTabProps) {
  const [copiedRaw, setCopiedRaw] = useState(false);

  const isPromptPhase = ['fetching_traits', 'generating_prompt'].includes(imageGenState.status);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">

      {/* ── CAROUSEL — shown once image slots exist (generating, done, or all-failed) ── */}
      {imageGenState.slots.length > 0 && (
        <ImageCarousel
          slots={imageGenState.slots}
          message={imageGenState.message}
        />
      )}

      {/* ── PRE-GENERATION STATES — only shown before slots are created ── */}
      {imageGenState.slots.length === 0 && (
        <>
          {/* IDLE */}
          {imageGenState.status === 'idle' && (
            <div className="flex flex-col items-center opacity-30">
              <div className="w-32 h-52 border border-white/10 flex items-center justify-center">
                <span className="text-[8px] rotate-90 tracking-[1em]">SILHOUETTE</span>
              </div>
              <p className="mt-4 text-[9px]">AWAITING_RENDER_PIPELINE</p>
            </div>
          )}

          {/* PROMPT PHASE */}
          {isPromptPhase && (
            <PromptLoading status={imageGenState.status} message={imageGenState.message} />
          )}

          {/* ERROR (prompt pipeline failure — no slots yet) */}
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
                    <p className="text-[9px] text-yellow-400/70 tracking-[0.2em]">
                      RAW_INPUT — use this to generate manually
                    </p>
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

          {/* PROMPT ONLY DONE */}
          {imageGenState.status === 'prompt_done' && (
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <Sparkles size={20} className="text-accent/70" />
              <p className="text-[10px] text-accent/80 tracking-[0.3em]">PROMPT_READY</p>
              <p className="text-[9px] text-white/40 normal-case leading-relaxed">
                {imageGenState.message}
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
}
