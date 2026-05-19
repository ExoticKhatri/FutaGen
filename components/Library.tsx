"use client";

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, X, Copy, Check, AlertCircle, ImageOff } from 'lucide-react';
import { fetchLibraryImages, LibraryImage } from '@/actions/cloudinary';

export default function Library() {
  const [images, setImages]     = useState<LibraryImage[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [selected, setSelected] = useState<LibraryImage | null>(null);
  const [copied, setCopied]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchLibraryImages();
    if (result.success) {
      setImages(result.images);
    } else {
      setError(result.error ?? 'Failed to load library');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const copySeed = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.seed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-mono overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 shrink-0">
        <div>
          <p className="text-[10px] text-accent tracking-[0.4em] font-bold">GENERATION_LIBRARY</p>
          <p className="text-[9px] text-white/20 mt-1 tracking-widest">
            {loading ? 'LOADING...' : `${images.length} RENDERS`}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="p-2 text-white/30 hover:text-white transition-colors disabled:opacity-30"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white/[0.03] border border-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <AlertCircle size={24} className="text-red-400/50" />
            <p className="text-[10px] text-red-400/60 tracking-widest">FETCH_ERROR</p>
            <p className="text-[9px] text-white/30 normal-case">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && images.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 opacity-30">
            <ImageOff size={24} />
            <p className="text-[10px] tracking-widest">NO_RENDERS_FOUND</p>
          </div>
        )}

        {/* Grid */}
        {!loading && images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map(img => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelected(img)}
                className="group flex flex-col gap-2 text-left focus:outline-none"
              >
                <div className="relative aspect-square overflow-hidden border border-white/5 group-hover:border-accent/30 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.seed || 'Generated character'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <p className="text-[7px] text-white/25 tracking-widest truncate group-hover:text-white/50 transition-colors">
                  {img.seed || '—'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex flex-col lg:flex-row gap-6 max-w-5xl w-full max-h-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex-1 min-w-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.url}
                alt={selected.seed}
                className="max-h-[75vh] w-auto border border-white/10"
              />
            </div>

            {/* Meta panel */}
            <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4 font-mono">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="self-end p-1 text-white/30 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>

              <div>
                <p className="text-[8px] text-accent/60 tracking-[0.3em] mb-1">SEED</p>
                <div className="flex items-start gap-2">
                  <p className="text-[9px] text-white/60 break-all leading-relaxed flex-1">
                    {selected.seed || '—'}
                  </p>
                  {selected.seed && (
                    <button
                      type="button"
                      onClick={copySeed}
                      className="shrink-0 p-1 text-white/30 hover:text-accent transition-colors mt-0.5"
                      title="Copy seed"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {selected.prompt && (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <p className="text-[8px] text-accent/60 tracking-[0.3em] mb-1">PROMPT</p>
                  <p className="text-[9px] text-white/40 normal-case leading-relaxed">
                    {selected.prompt}
                  </p>
                </div>
              )}

              <p className="text-[8px] text-white/15 tracking-widest">
                {new Date(selected.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
