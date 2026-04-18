"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, Maximize2, RotateCcw, Download } from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface LoadedImage {
  src: string;
  index: number;
  public_id: string;
}

export default function LibraryView() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Use refs so callbacks never go stale
  const nextCursorRef = useRef<string | undefined>(undefined);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const totalLoadedRef = useRef(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchImages = useCallback(async () => {
    // Hard-guard: never fire if already fetching or nothing left
    if (isLoadingRef.current || !hasMoreRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      let url = `/api/cloudinary?max_results=20`;
      if (nextCursorRef.current) {
        url += `&next_cursor=${encodeURIComponent(nextCursorRef.current)}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const data = await res.json();

      if (!data.resources || data.resources.length === 0) {
        hasMoreRef.current = false;
        setHasMore(false);
        return;
      }

      // Compute indices from the ref so we never have a stale closure
      const startIndex = totalLoadedRef.current;
      const newImages: LoadedImage[] = data.resources.map(
        (resource: { secure_url: string; public_id: string }, idx: number) => ({
          src: resource.secure_url,
          public_id: resource.public_id,
          index: startIndex + idx,
        })
      );

      totalLoadedRef.current = startIndex + newImages.length;

      // Update the cursor ref synchronously before releasing the lock
      nextCursorRef.current = data.next_cursor;
      if (!data.next_cursor) {
        hasMoreRef.current = false;
        setHasMore(false);
      }

      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      // Release the lock only after all state is set
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, []); // stable – no dependencies that change

  // Initial load — setLoading is called inside the async fn, not synchronously
  // in the effect body, which avoids the react-hooks/set-state-in-effect lint error.
  useEffect(() => {
    const load = async () => {
      await fetchImages();
      setLoading(false);
    };
    load();
    // fetchImages is stable (empty deps array), safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intersection observer — re-create whenever images list grows so the sentinel
  // gets re-observed after each batch lands. root is the scroll container so it
  // works correctly inside overflow-y-auto (not the viewport).
  useEffect(() => {
    if (!observerTarget.current || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoadingRef.current &&
          hasMoreRef.current
        ) {
          fetchImages();
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0,
        rootMargin: '0px 0px 200px 0px',
      }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [images.length, fetchImages]);

  // Download handler
  const handleDownload = useCallback(async (imageSrc: string) => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em]">
            Initializing Archives...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="w-full max-h-screen overflow-y-auto p-4 md:p-8 bg-[#050505]">

      {/* Masonry grid */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6">
        {images.map((imgObj, displayIndex) => (
          <div
            key={imgObj.public_id}
            className="break-inside-avoid mb-6"
          >
            <button
              onClick={() => setSelectedImage(imgObj.src)}
              className="w-full relative rounded-xl overflow-hidden border border-zinc-900 bg-zinc-950 group cursor-zoom-in hover:border-zinc-700 transition-all duration-500 text-left"
            >
              <Image
                src={imgObj.src}
                alt={`Archived design ${imgObj.index}`}
                width={500}
                height={800}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                priority={displayIndex < 10}
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                <div className="flex justify-end">
                  <Maximize2 className="text-white w-4 h-4 opacity-50" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-white font-bold tracking-tight truncate">
                    {imgObj.public_id}
                  </p>
                  <p className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest mt-1">
                    Ref. {imgObj.index.toString().padStart(3, '0')}
                  </p>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Loading spinner while fetching next page */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Sentinel — always rendered with real height so the observer can see it */}
      <div ref={observerTarget} className="w-full h-16 flex items-center justify-center">
        {!hasMore && images.length > 0 && (
          <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-wider">
            End of archives — {images.length} images loaded
          </p>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={8}
            centerOnInit={true}
            wheel={{ step: 0.005, disabled: false }}
            pinch={{ step: 1 }}
            doubleClick={{ mode: "reset" }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute top-6 right-6 flex items-center gap-4 z-110">
                  <div className="flex items-center gap-1 bg-zinc-900/90 p-1.5 rounded-full border border-zinc-800">
                    <button
                      onClick={() => zoomOut()}
                      className="p-2 hover:bg-zinc-800 rounded-full text-white transition-colors"
                      title="Zoom Out"
                      aria-label="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="p-2 hover:bg-zinc-800 rounded-full text-white transition-colors"
                      title="Reset"
                      aria-label="Reset View"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => zoomIn()}
                      className="p-2 hover:bg-zinc-800 rounded-full text-white transition-colors"
                      title="Zoom In"
                      aria-label="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDownload(selectedImage)}
                    className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                    title="Download Image"
                    aria-label="Download Image"
                  >
                    <Download className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setSelectedImage(null)}
                    className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                    title="Close"
                    aria-label="Close Preview"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <TransformComponent wrapperClass="!w-screen !h-screen cursor-grab active:cursor-grabbing">
                  <div className="flex items-center justify-center w-screen h-screen">
                    <div className="relative w-[85vw] h-[80vh]">
                      <Image
                        src={selectedImage}
                        alt="Archive full view"
                        fill
                        className="object-contain drop-shadow-2xl"
                        sizes="100vw"
                        priority
                        draggable={false}
                        unoptimized
                      />
                    </div>
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      )}
    </div>
  );
}