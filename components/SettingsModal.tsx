"use client";

import { useState, useEffect } from "react";
import { X, Save, Key, Sliders, Check } from "lucide-react";
import { GENERATOR_CONFIG } from "@/lib/config";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey]         = useState("");
  const [background, setBackground] = useState("plain_white");
  const [style, setStyle]           = useState("glistening_anime");
  const [frame, setFrame]           = useState("auto");
  const [composition, setComposition] = useState("full_body");
  const [imageCount, setImageCount] = useState(4);

  const [savedStatus, setSavedStatus] = useState(false);
  const [showKey, setShowKey]         = useState(false);

  // Load current values from localStorage when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const savedKey   = localStorage.getItem("openai_api_key") || "";
      const savedBg    = localStorage.getItem("default_background") || "plain_white";
      const savedStyle = localStorage.getItem("default_style") || "glistening_anime";
      const savedFrame = localStorage.getItem("default_frame") || "auto";
      const savedComp  = localStorage.getItem("default_composition") || "full_body";
      const savedCount = Math.min(5, Math.max(1, parseInt(localStorage.getItem("image_count") || "4")));

      setApiKey(savedKey);
      setBackground(savedBg);
      setStyle(savedStyle);
      setFrame(savedFrame);
      setComposition(savedComp);
      setImageCount(savedCount);
      setSavedStatus(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("openai_api_key", apiKey.trim());
      localStorage.setItem("default_background", background);
      localStorage.setItem("default_style", style);
      localStorage.setItem("default_frame", frame);
      localStorage.setItem("default_composition", composition);
      localStorage.setItem("image_count", imageCount.toString());
      
      // Trigger a window event so other components know default settings updated
      window.dispatchEvent(new Event("local-settings-updated"));
      
      setSavedStatus(true);
      setTimeout(() => {
        setSavedStatus(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200 p-3 sm:p-4">
      <div className="bg-[#050505] border border-white/10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] w-full max-w-lg max-h-[90dvh] sm:max-h-none overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-teal-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-widest font-mono">System Calibration</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="p-2 text-zinc-500 hover:text-white transition-colors rounded-md hover:bg-white/5 active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-[#0a0a0a] space-y-5 sm:space-y-6">
          
          {/* Section: API KEY */}
          <div className="space-y-3 border-b border-white/5 pb-4 sm:pb-5">
            <div className="flex items-center gap-2 text-zinc-400">
              <Key size={12} className="text-teal-500" />
              <label className="text-[10px] font-mono uppercase tracking-widest font-bold">OpenAI API Key</label>
            </div>
            
            <div className="relative">
              <input 
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-white/[0.02] border border-white/10 rounded-md pl-3 pr-16 py-2 text-xs font-mono text-zinc-300 focus:border-teal-500/50 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono uppercase px-2 py-1 rounded bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-[8px] font-mono text-zinc-600 leading-normal uppercase tracking-wider">
              YOUR KEY IS STORED ENTIRELY LOCAL IN YOUR BROWSER. IT IS NEVER SENT OR SAVED ON THE WEB SERVER.
            </p>
          </div>

          {/* Section: DEFAULT RENDER TARGETS */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Sliders size={12} className="text-teal-500" />
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Default DNA Configuration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              {/* Art Style */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Aesthetic Style</label>
                <div className="relative">
                  <select
                    title="Aesthetic Style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-zinc-300 focus:border-teal-500/50 outline-none transition-colors appearance-none cursor-pointer uppercase"
                  >
                    {GENERATOR_CONFIG.ART_STYLES.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#0a0a0a] text-zinc-300">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Background */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Background</label>
                <div className="relative">
                  <select
                    title="Background"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-zinc-300 focus:border-teal-500/50 outline-none transition-colors appearance-none cursor-pointer uppercase"
                  >
                    {GENERATOR_CONFIG.BACKGROUNDS.map(b => (
                      <option key={b.id} value={b.id} className="bg-[#0a0a0a] text-zinc-300">
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Frame Ratio */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Frame Aspect</label>
                <div className="relative">
                  <select
                    title="Frame Aspect"
                    value={frame}
                    onChange={(e) => setFrame(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-zinc-300 focus:border-teal-500/50 outline-none transition-colors appearance-none cursor-pointer uppercase"
                  >
                    {GENERATOR_CONFIG.FRAMES.map(f => (
                      <option key={f.id} value={f.id} className="bg-[#0a0a0a] text-zinc-300">
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Composition */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Composition</label>
                <div className="relative">
                  <select
                    title="Composition"
                    value={composition}
                    onChange={(e) => setComposition(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-zinc-300 focus:border-teal-500/50 outline-none transition-colors appearance-none cursor-pointer uppercase"
                  >
                    {GENERATOR_CONFIG.COMPOSITIONS.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#0a0a0a] text-zinc-300">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Parallel Generations Slider */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Parallel Generations</label>
                <span className="text-sm font-mono font-bold text-teal-400">{imageCount}</span>
              </div>
              <input
                type="range"
                title="Number of parallel generations"
                min={1}
                max={5}
                value={imageCount}
                onChange={(e) => setImageCount(parseInt(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer accent-teal-500 bg-white/10"
              />
              <div className="flex justify-between px-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <span
                    key={n}
                    className={`text-[8px] font-mono transition-colors ${n === imageCount ? "text-teal-400 font-bold" : "text-zinc-600"}`}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-white/5 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest font-mono transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 hover:text-teal-300 border border-teal-500/20 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest font-mono transition-all"
            >
              {savedStatus ? (
                <>
                  <Check size={14} className="text-teal-400" />
                  DNA Calibrated
                </>
              ) : (
                <>
                  <Save size={14} />
                  Calibrate System
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
