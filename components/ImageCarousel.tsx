"use client";

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Download, ZoomIn, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ImageSlot } from '@/types/data';
import ImageLoading from '@/components/Loading/ImageLoading';

interface ImageCarouselProps {
  slots: ImageSlot[];
  message?: string;
}

export default function ImageCarousel({ slots, message }: ImageCarouselProps) {
  const scrollRef                     = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomedSlot, setZoomedSlot]   = useState<ImageSlot | null>(null);

  const doneCount    = slots.filter(s => s.status === 'done').length;
  const runningCount = slots.filter(s => s.status === 'running').length;
  const errorCount   = slots.filter(s => s.status === 'error').length;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    setActiveIndex(Math.round(scrollLeft / clientWidth));
  };

  const scrollToSlot = (i: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: 'smooth' });
  };

  const downloadImage = (imageUrl: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `futagen-${Date.now()}.png`;
    a.click();
  };

  return (
    <>
      <div className="w-full flex flex-col h-full">

        {/* Status bar */}
        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <p className="text-[8px] text-accent/60 tracking-widest">RENDER_OUTPUT</p>
          <div className="flex items-center gap-2">
            {doneCount > 0 && (
              <span className="flex items-center gap-0.5 text-[8px] text-green-400/70">
                <CheckCircle2 size={9} />{doneCount}
              </span>
            )}
            {runningCount > 0 && (
              <span className="flex items-center gap-0.5 text-[8px] text-yellow-400/70">
                <Loader2 size={9} className="animate-spin" />{runningCount}
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-0.5 text-[8px] text-red-400/70">
                <XCircle size={9} />{errorCount}
              </span>
            )}
            <span className="text-[8px] text-white/20">/ {slots.length}</span>
          </div>
        </div>

        {/* Slide container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 flex overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
        >
          {slots.map((slot, i) => (
            <div
              key={i}
              className="h-full w-full shrink-0 flex flex-col items-center justify-center overflow-y-auto"
              style={{ scrollSnapAlign: 'start' }}
            >
              {slot.status === 'running' && (
                <ImageLoading message={`Generating slot ${i + 1} of ${slots.length}...`} />
              )}

              {slot.status === 'done' && slot.imageUrl && (
                <div className="w-full flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-green-400/50 tracking-widest">GEN_{i + 1}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        title="Zoom"
                        onClick={() => setZoomedSlot(slot)}
                        className="p-1 text-white/30 hover:text-accent transition-colors"
                      >
                        <ZoomIn size={12} />
                      </button>
                      <button
                        type="button"
                        title="Download"
                        onClick={() => downloadImage(slot.imageUrl!)}
                        className="p-1 text-white/30 hover:text-accent transition-colors"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </div>
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                  <Image
                    src={slot.imageUrl}
                    alt={`Generation ${i + 1}`}
                    width={512}
                    height={768}
                    unoptimized
                    style={{ width: '100%', height: 'auto' }}
                    className="border border-white/10 cursor-zoom-in"
                    onClick={() => setZoomedSlot(slot)}
                  />
                </div>
              )}

              {slot.status === 'error' && (
                <div className="flex flex-col items-center gap-2 text-center px-3">
                  <XCircle size={18} className="text-red-400/50" />
                  <p className="text-[9px] text-red-400/60 tracking-widest">GEN_{i + 1}_FAILED</p>
                  <p className="text-[9px] text-white/30 normal-case leading-relaxed break-all">
                    {slot.error}
                  </p>
                </div>
              )}

              {slot.status === 'pending' && (
                <div className="flex flex-col items-center gap-2 opacity-20">
                  <Loader2 size={16} />
                  <span className="text-[8px] tracking-widest">PENDING</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dot navigation */}
        <div className="flex items-center justify-center gap-2 mt-2 shrink-0">
          {slots.map((slot, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToSlot(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-4' : 'w-1.5'
              } ${
                slot.status === 'done'    ? 'bg-green-400/70' :
                slot.status === 'running' ? 'bg-yellow-400/70 animate-pulse' :
                slot.status === 'error'   ? 'bg-red-400/60' :
                'bg-white/20'
              }`}
            />
          ))}
        </div>

        {message && (
          <p className="text-[8px] text-white/25 normal-case mt-1.5 shrink-0">{message}</p>
        )}

      </div>

      {/* Zoom lightbox */}
      {zoomedSlot?.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center"
          onClick={() => setZoomedSlot(null)}
        >
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 md:p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="text-[8px] text-white/40 tracking-widest">PINCH TO ZOOM</div>
            <div className="flex gap-2">
              <button
                type="button"
                title="Download"
                onClick={e => { e.stopPropagation(); downloadImage(zoomedSlot.imageUrl!); }}
                className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded transition-all active:scale-95"
              >
                <Download size={16} />
              </button>
              <button
                type="button"
                aria-label="Close zoom"
                onClick={() => setZoomedSlot(null)}
                className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded transition-all active:scale-95"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div
            className="w-full h-full overflow-auto flex items-center justify-center p-3"
            onClick={e => e.stopPropagation()}
            style={{ touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <Image
              src={zoomedSlot.imageUrl}
              alt="Generated character zoomed"
              width={2048}
              height={2048}
              unoptimized
              style={{ maxHeight: '90vh', width: 'auto', cursor: 'zoom-out' }}
              onClick={() => setZoomedSlot(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
