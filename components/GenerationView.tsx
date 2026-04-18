"use client";

import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

interface GenerationViewProps {
  prompt: string;
  isGenerating: boolean;
  onPromptChange: (newPrompt: string) => void;
}

export default function GenerationView({ prompt, isGenerating, onPromptChange }: GenerationViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-t-2 border-teal-500 rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 animate-pulse">
          Enhancing with Gemini...
        </p>
      </div>
    );
  }

  if (!prompt) {
    return (
      <p className="text-zinc-800 font-mono text-[10px] uppercase tracking-[0.4em]">
        Waiting for Input
      </p>
    );
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-end px-1">
        <div className="space-y-1">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Refined Prompt</p>
          <div className="h-0.5 w-8 bg-teal-500" />
        </div>
        
        <button 
          onClick={handleCopy}
          className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
        >
          {copied ? <Check size={14} className="text-teal-500" /> : <Copy size={14} />}
          <span className="text-[10px] uppercase font-bold tracking-tighter">
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </div>

      {/* Input Area */}
      <div className="relative group">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="w-full bg-transparent text-zinc-400 font-mono text-sm leading-relaxed min-h-[300px] resize-none focus:outline-none selection:bg-teal-500/20 no-scrollbar"
          spellCheck={false}
        />
        
        <div className="absolute -bottom-2 left-0 w-full h-px bg-zinc-900 group-focus-within:bg-zinc-800 transition-colors" />
      </div>

      {/* Minimal Footer */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2 text-zinc-600">
          <Sparkles size={12} className="text-teal-500/50" />
          <span className="text-[9px] uppercase tracking-widest font-medium">Character Configured</span>
        </div>

        <button className="text-[11px] text-zinc-400 hover:text-teal-500 font-black uppercase tracking-[0.2em] transition-all py-2 group">
          Generate Image
          <span className="block h-px w-0 group-hover:w-full bg-teal-500 transition-all duration-300" />
        </button>
      </div>
    </div>
  );
}