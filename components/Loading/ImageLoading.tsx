"use client";

// 8 cols × 12 rows = 96 cells in portrait aspect ratio
const COLS = 8;
const ROWS = 12;
const TOTAL = COLS * ROWS;

// Teal palette in varied opacities — deterministic, no Math.random()
const CELL_CLASSES = [
  'bg-accent/55',
  'bg-accent/25',
  'bg-teal-900/70',
  'bg-accent/40',
  'bg-cyan-800/45',
  'bg-accent/15',
  'bg-teal-700/55',
  'bg-accent/45',
  'bg-cyan-900/35',
  'bg-accent/30',
  'bg-teal-800/60',
  'bg-accent/10',
];

const DURATIONS = ['0.9s', '1.3s', '1.7s', '1.1s', '1.5s', '2.0s'];
const DELAYS    = ['0s', '0.15s', '0.3s', '0.45s', '0.6s', '0.75s', '0.9s', '1.05s'];

interface ImageLoadingProps {
  message: string;
}

export default function ImageLoading({ message }: ImageLoadingProps) {
  return (
    <div className="flex flex-col items-center gap-5 w-full px-2">

      {/* Canvas frame */}
      <div className="relative" style={{ width: 128, height: 192 }}>

        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-accent/70 z-10" />
        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-accent/70 z-10" />
        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-accent/70 z-10" />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-accent/70 z-10" />

        {/* Pixel mosaic */}
        <div
          className="absolute inset-0 grid gap-px bg-black/80"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className={`${CELL_CLASSES[i % CELL_CLASSES.length]} animate-pulse`}
              style={{
                animationDuration: DURATIONS[i % DURATIONS.length],
                animationDelay:    DELAYS[i % DELAYS.length],
              }}
            />
          ))}
        </div>

        {/* Subtle noise veil */}
        <div className="absolute inset-0 bg-black/15 z-10 pointer-events-none" />
      </div>

      {/* Status text */}
      <div className="text-center space-y-1.5">
        <p className="text-[10px] text-accent tracking-[0.3em]">RENDERING_IMAGE</p>
        <p className="text-[9px] text-white/30 normal-case">{message}</p>
      </div>

    </div>
  );
}
