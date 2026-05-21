"use client";

import { useState } from 'react';
import Image from 'next/image';
import { AlertCircle, Copy, Check, Download, ZoomIn, X, Sparkles } from 'lucide-react';
import { ImageGenState } from '@/types/data';
import PromptLoading from '@/components/Loading/PromptLoading';
import ImageLoading from '@/components/Loading/ImageLoading';

interface ViewTabProps {
  imageGenState: ImageGenState;
}

export default function ViewTab({ imageGenState }: ViewTabProps) {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [zoomed, setZoomed]       = useState(false);

  const isPromptPhase = ['fetching_traits', 'generating_prompt'].includes(imageGenState.status);
  const isImagePhase  = imageGenState.status === 'generating_image';

  const downloadImage = () => {
    const url = imageGenState.imageUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `futagen-${Date.now()}.png`;
    a.click();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full gap-4">

        {/* ── IDLE ── */}
        {imageGenState.status === 'idle' && (
          <div className="flex flex-col items-center opacity-30">
            <div className="w-32 h-52 border border-white/10 flex items-center justify-center">
              <span className="text-[8px] rotate-90 tracking-[1em]">SILHOUETTE</span>
            </div>
            <p className="mt-4 text-[9px]">AWAITING_RENDER_PIPELINE</p>
          </div>
        )}

        {/* ── PROMPT PHASE ── */}
        {isPromptPhase && (
          <PromptLoading status={imageGenState.status} message={imageGenState.message} />
        )}

        {/* ── IMAGE PHASE ── */}
        {isImagePhase && (
          <ImageLoading message={imageGenState.message} />
        )}

        {/* ── ERROR ── */}
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

        {/* ── PROMPT ONLY DONE ── */}
        {imageGenState.status === 'prompt_done' && (
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <Sparkles size={20} className="text-accent/70" />
            <p className="text-[10px] text-accent/80 tracking-[0.3em]">PROMPT_READY</p>
            <p className="text-[9px] text-white/40 normal-case leading-relaxed">
              {imageGenState.message}
            </p>
          </div>
        )}

        {/* ── IMAGE DONE ── */}
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
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <Image
              src={imageGenState.imageUrl}
              alt="Generated demon lady character"
              width={512}
              height={768}
              unoptimized
              style={{ width: '100%', height: 'auto' }}
              className="border border-white/10 cursor-zoom-in"
              onClick={() => setZoomed(true)}
            />
            {imageGenState.message && (
              <p className="text-[8px] text-white/25 normal-case">{imageGenState.message}</p>
            )}
          </div>
        )}

      </div>

      {/* ── ZOOM LIGHTBOX ── */}
      {zoomed && imageGenState.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            aria-label="Close zoom"
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
            <Image
              src={imageGenState.imageUrl}
              alt="Generated character zoomed"
              width={2048}
              height={2048}
              unoptimized
              style={{ maxHeight: '95vh', width: 'auto', cursor: 'zoom-out' }}
              onClick={() => setZoomed(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
