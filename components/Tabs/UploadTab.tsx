"use client";

import { useState, useRef } from 'react';
import { Upload, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { GeneratorState, ImageGenState } from '@/types/data';
import { uploadToCloudinary } from '@/actions/cloudinary';

type AISource = 'gemini' | 'gpt';

interface UploadTabProps {
  state: GeneratorState;
  imageGenState: ImageGenState;
}

export default function UploadTab({ state, imageGenState }: UploadTabProps) {
  const [preview, setPreview]     = useState<string>('');
  const [source, setSource]       = useState<AISource>('gemini');
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging]   = useState(false);
  const [result, setResult]       = useState<{ success: boolean; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = (f: File) => {
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) loadFile(f);
  };

  const serializeTraitTitles = () =>
    state.traitTitles
      ? Object.entries(state.traitTitles)
          .map(([k, v]) => `${k}:${Array.isArray(v) ? v.join('+') : v}`)
          .join(', ')
      : '';

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    setResult(null);

    const up = await uploadToCloudinary({
      imageDataUrl: preview,
      prompt:       imageGenState.prompt ?? '',
      seed:         state.seed,
      ratio:        state.frame,
      composition:  state.composition,
      style:        state.style,
      traitTitles:  serializeTraitTitles(),
      source,
      tags:         ['external'],
    });

    setUploading(false);
    setResult({
      success: up.success,
      message: up.success ? 'Saved to library.' : (up.error ?? 'Upload failed'),
    });

    if (up.success) {
      setPreview('');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-10">

      <div className="border-b border-white/5 pb-3">
        <p className="text-[10px] text-accent">EXTERNAL_RENDER_UPLOAD</p>
        <p className="text-[9px] text-white/20 mt-1 normal-case">
          Upload an image generated externally. It will be saved to the library with the current session data.
        </p>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border border-dashed transition-colors p-6 text-center w-full cursor-pointer ${
          dragging
            ? 'border-accent/60 bg-accent/5'
            : 'border-white/10 hover:border-accent/30'
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="max-h-44 mx-auto border border-white/10" />
        ) : (
          <div className={`flex flex-col items-center gap-2 transition-opacity ${dragging ? 'opacity-60' : 'opacity-25'}`}>
            <Upload size={22} />
            <p className="text-[9px] tracking-widest">
              {dragging ? 'DROP_TO_SELECT' : 'CLICK_OR_DRAG_IMAGE_HERE'}
            </p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {/* Source selector */}
      <div>
        <p className="text-[8px] text-white/25 tracking-[0.3em] mb-2">GENERATED_WITH</p>
        <div className="flex gap-2">
          {(['gemini', 'gpt'] as AISource[]).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSource(s)}
              className={`px-4 py-2 text-[9px] font-bold tracking-widest border transition-all ${
                source === s
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-white/10 text-white/25 hover:text-white/60'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Metadata preview */}
      <div className="p-3 bg-white/[0.02] border border-white/5 space-y-2">
        <p className="text-[8px] text-white/20 tracking-[0.3em]">WILL_SAVE_WITH</p>
        <div className="flex gap-2">
          <span className="text-[7px] text-accent/40 uppercase w-16 shrink-0">seed</span>
          <span className="text-[8px] text-white/30 normal-case truncate">{state.seed || '—'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[7px] text-accent/40 uppercase w-16 shrink-0">prompt</span>
          <span className="text-[8px] text-white/30 normal-case">{imageGenState.prompt ? '✓ ready' : '— none yet'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[7px] text-accent/40 uppercase w-16 shrink-0">style</span>
          <span className="text-[8px] text-white/30 normal-case">{state.style || '—'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[7px] text-accent/40 uppercase w-16 shrink-0">composition</span>
          <span className="text-[8px] text-white/30 normal-case">{state.composition || '—'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[7px] text-accent/40 uppercase w-16 shrink-0">frame</span>
          <span className="text-[8px] text-white/30 normal-case">{state.frame || '—'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[7px] text-accent/40 uppercase w-16 shrink-0">traits</span>
          <span className="text-[8px] text-white/30 normal-case truncate">{state.traitTitles ? '✓ ready' : '— none yet'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-[7px] text-accent/40 uppercase w-16 shrink-0">tags</span>
          <span className="text-[8px] text-accent/50 normal-case">external · {source}</span>
        </div>
      </div>

      {/* Upload button */}
      <button
        type="button"
        onClick={handleUpload}
        disabled={!preview || uploading}
        className="w-full py-3 border border-accent/20 bg-accent/5 text-accent text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-accent hover:text-black transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading
          ? <><RefreshCw size={11} className="animate-spin" /> UPLOADING...</>
          : <><Upload size={11} /> SAVE_TO_LIBRARY</>
        }
      </button>

      {/* Result */}
      {result && (
        <div className={`flex items-center gap-2 p-2 border text-[9px] normal-case ${
          result.success
            ? 'border-accent/20 text-accent/70'
            : 'border-red-400/20 text-red-400/60'
        }`}>
          {result.success ? <Check size={11} /> : <AlertCircle size={11} />}
          {result.message}
        </div>
      )}

    </div>
  );
}
