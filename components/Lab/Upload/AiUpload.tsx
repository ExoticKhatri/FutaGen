"use client";

import { useState } from "react";
import { TraitCategory } from "@/types/traits";
import { Sparkles } from "lucide-react";

export default function AiUpload({ activeTable, onSuccess }: { activeTable: TraitCategory, onSuccess: () => void }) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-md flex items-start gap-3">
        <Sparkles size={16} className="text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-[10px] font-mono text-indigo-300/70 leading-relaxed uppercase tracking-wider">
          AI Generation is currently initializing. Enter a prompt below to describe the traits you want to generate for <strong className="text-indigo-400">{activeTable}</strong>.
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Generation Prompt</label>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g. Generate 5 unique cybernetic eye variations with detailed descriptions..."
          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500/50 outline-none resize-none h-32 transition-colors scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        />
      </div>
      <button 
        disabled
        className="mt-2 flex items-center justify-center gap-2 bg-indigo-500/10 text-indigo-500/50 border border-indigo-500/20 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest cursor-not-allowed"
      >
        <Sparkles size={14} />
        Generate via AI (Coming Soon)
      </button>
    </div>
  );
}
