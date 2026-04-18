"use client";

import { Library, Wand2, Sparkles, Dice5, Settings } from 'lucide-react';

interface DockProps {
  activeTab: 'canvas' | 'library';
  onToggle: () => void;
  onGenerate: () => void;
  onRandomize: () => void;
  isDisabled?: boolean;
}

export default function Dock({ 
  activeTab, 
  onToggle, 
  onGenerate, 
  onRandomize, 
  isDisabled 
}: DockProps) {

  const handleSettingsClick = () => {
    console.log("Settings Modal Triggered");
  };

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-3 bg-zinc-900/70 backdrop-blur-2xl border border-white/5 p-2 px-3 rounded-full shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
        
        {/* GROUP: NAVIGATION */}
        <div className="flex items-center gap-1">
          <button
            onClick={activeTab === 'library' ? onToggle : undefined}
            disabled={isDisabled}
            className={`p-2.5 rounded-full transition-all duration-500 ${
              activeTab === 'canvas' 
              ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
              : 'text-zinc-500 hover:text-white'
            } disabled:opacity-40`}
          >
            <Wand2 size={19} strokeWidth={2.5} />
          </button>

          <button
            onClick={activeTab === 'canvas' ? onToggle : undefined}
            disabled={isDisabled}
            className={`p-2.5 rounded-full transition-all duration-500 ${
              activeTab === 'library' 
              ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
              : 'text-zinc-500 hover:text-white'
            } disabled:opacity-40`}
          >
            <Library size={19} strokeWidth={2.5} />
          </button>
        </div>

        {/* SECTION: CREATOR ACTIONS (Only for Canvas) */}
        {activeTab === 'canvas' && (
          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <button
              onClick={onRandomize}
              disabled={isDisabled}
              className="p-2 text-zinc-500 hover:text-teal-400 transition-colors active:scale-90 disabled:opacity-40"
            >
              <Dice5 size={20} strokeWidth={2} />
            </button>

            <button
              onClick={onGenerate}
              disabled={isDisabled}
              className="group relative flex items-center justify-center p-3.5 bg-teal-500 rounded-full text-black hover:bg-teal-400 hover:scale-110 transition-all duration-300 active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-[0_0_25px_rgba(20,184,166,0.4)]"
            >
              <Sparkles size={20} fill="currentColor" />
              {/* Optional: Subtle pulse effect when generating */}
              {isDisabled && (
                <span className="absolute inset-0 rounded-full border-2 border-teal-500 animate-ping opacity-20" />
              )}
            </button>
          </div>
        )}

        {/* SECTION: SETTINGS */}
        <div className="pl-1 border-l border-white/10">
          <button
            onClick={handleSettingsClick}
            disabled={isDisabled}
            className="p-2.5 text-zinc-500 hover:text-white hover:rotate-45 transition-all duration-500 disabled:opacity-40"
          >
            <Settings size={19} strokeWidth={2.5} />
          </button>
        </div>
        
      </nav>
    </div>
  );
}