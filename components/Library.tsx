"use client";

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, X, Copy, Check, AlertCircle, ImageOff, Download, Trash2 } from 'lucide-react';
import { fetchLibraryImages, deleteImage, LibraryImage } from '@/actions/cloudinary';

export default function Library() {
  const [images, setImages]           = useState<LibraryImage[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [selected, setSelected]       = useState<LibraryImage | null>(null);
  const [copied, setCopied]           = useState(false);
  const [confirmDelete, setConfirm]   = useState<string | null>(null); // public_id pending delete
  const [deleting, setDeleting]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchLibraryImages();
    if (result.success) setImages(result.images);
    else setError(result.error ?? 'Failed to load library');
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const copySeed = () => {
    if (!selected?.seed) return;
    navigator.clipboard.writeText(selected.seed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = (url: string, id: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `futagen-${id.split('/').pop() ?? Date.now()}.png`;
    a.target = '_blank';
    a.click();
  };

  const handleDelete = async (publicId: string) => {
    if (confirmDelete !== publicId) {
      setConfirm(publicId);
      setTimeout(() => setConfirm(null), 3000); // auto-cancel after 3s
      return;
    }
    setDeleting(true);
    const result = await deleteImage(publicId);
    if (result.success) {
      setImages(prev => prev.filter(img => img.id !== publicId));
      if (selected?.id === publicId) setSelected(null);
    }
    setConfirm(null);
    setDeleting(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-mono overflow-hidden">

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

        {/* Loading skeleton */}
        {loading && (
          <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-3 bg-white/[0.03] border border-white/5 animate-pulse"
                style={{ height: `${140 + (i % 3) * 60}px` }}
              />
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

        {/* Masonry grid */}
        {!loading && images.length > 0 && (
          <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3">
            {images.map(img => (
              <div key={img.id} className="break-inside-avoid mb-3 group relative">
                <Image
                  src={img.url}
                  alt={img.seed || 'Generated character'}
                  width={300}
                  height={400}
                  className="w-full h-auto block border border-white/5 group-hover:border-accent/20 transition-colors cursor-pointer"
                  onClick={() => setSelected(img)}
                />

                {/* Hover action bar */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => downloadImage(img.url, img.id)}
                    title="Download"
                    className="p-1 text-white/50 hover:text-white transition-colors"
                  >
                    <Download size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    disabled={deleting}
                    title={confirmDelete === img.id ? 'Click again to confirm delete' : 'Delete'}
                    className={`p-1 transition-colors disabled:opacity-30 ${
                      confirmDelete === img.id
                        ? 'text-red-400 animate-pulse'
                        : 'text-white/50 hover:text-red-400'
                    }`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 md:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full h-full max-w-5xl flex flex-col lg:flex-row gap-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Image Container - Full screen pinch-zoom area on mobile */}
            <div className="flex-1 min-w-0 flex items-center justify-center overflow-auto relative bg-black/50 rounded">
              <Image
                src={selected.url}
                alt={selected.seed}
                fill
                className="max-h-[85vh] md:max-h-[75vh] w-auto border border-white/10 object-contain"
                style={{ touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' }}
              />
            </div>

            {/* Meta panel */}
            <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3 font-mono overflow-y-auto custom-scrollbar bg-black/40 rounded p-3 lg:p-4">

              {/* Top actions row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => downloadImage(selected.url, selected.id)}
                    title="Download"
                    className="flex items-center gap-1.5 px-2.5 py-2 md:px-2 md:py-1.5 text-white/40 hover:text-white border border-white/10 hover:border-white/30 transition-colors active:scale-95"
                  >
                    <Download size={12} className="md:hidden" />
                    <Download size={11} className="hidden md:block" />
                    <span className="text-[8px] font-bold hidden sm:inline">DL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleting}
                    title={confirmDelete === selected.id ? 'Click again to confirm' : 'Delete'}
                    className={`flex items-center gap-1.5 px-2.5 py-2 md:px-2 md:py-1.5 border transition-colors disabled:opacity-30 active:scale-95 ${
                      confirmDelete === selected.id
                        ? 'text-red-400 border-red-400/40 animate-pulse'
                        : 'text-white/40 hover:text-red-400 border-white/10 hover:border-red-400/30'
                    }`}
                  >
                    <Trash2 size={12} className="md:hidden" />
                    <Trash2 size={11} className="hidden md:block" />
                    <span className="text-[8px] font-bold hidden sm:inline">
                      {confirmDelete === selected.id ? 'OK' : 'DEL'}
                    </span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="p-2 text-white/30 hover:text-white transition-colors active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Seed */}
              <div>
                <p className="text-[8px] text-accent/60 tracking-[0.3em] mb-1">SEED</p>
                <div className="flex items-start gap-2">
                  <p className="text-[8px] text-white/50 break-all leading-relaxed flex-1">
                    {selected.seed || '—'}
                  </p>
                  {selected.seed && (
                    <button
                      type="button"
                      onClick={copySeed}
                      className="shrink-0 p-1 text-white/30 hover:text-accent transition-colors"
                    >
                      {copied ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Meta row: ratio / composition / style */}
              {(selected.ratio || selected.composition || selected.style) && (
                <div className="grid grid-cols-3 gap-2">
                  {selected.ratio && (
                    <div>
                      <p className="text-[7px] text-accent/40 tracking-widest mb-0.5">RATIO</p>
                      <p className="text-[8px] text-white/40 capitalize">{selected.ratio}</p>
                    </div>
                  )}
                  {selected.composition && (
                    <div>
                      <p className="text-[7px] text-accent/40 tracking-widest mb-0.5">SHOT</p>
                      <p className="text-[8px] text-white/40 capitalize">{selected.composition}</p>
                    </div>
                  )}
                  {selected.style && (
                    <div>
                      <p className="text-[7px] text-accent/40 tracking-widest mb-0.5">STYLE</p>
                      <p className="text-[8px] text-white/40">{selected.style.replace(/_/g, ' ')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Traits */}
              {selected.traits && (
                <div>
                  <p className="text-[8px] text-accent/60 tracking-[0.3em] mb-1">TRAITS</p>
                  <p className="text-[8px] text-white/35 normal-case leading-relaxed">
                    {selected.traits}
                  </p>
                </div>
              )}

              {/* Prompt */}
              {selected.prompt && (
                <div className="flex-1">
                  <p className="text-[8px] text-accent/60 tracking-[0.3em] mb-1">PROMPT</p>
                  <p className="text-[8px] text-white/30 normal-case leading-relaxed">
                    {selected.prompt}
                  </p>
                </div>
              )}

              {/* Date */}
              <p className="text-[7px] text-white/15 tracking-widest shrink-0">
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
