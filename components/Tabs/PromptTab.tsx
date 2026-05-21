"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface PromptTabProps {
  prompt: string | null;
}

export default function PromptTab({ prompt }: PromptTabProps) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <p className="text-[10px] text-accent">MASTER_PROMPT</p>
        {prompt && (
          <button
            type="button"
            onClick={copyPrompt}
            title="Copy prompt"
            className="flex items-center gap-1.5 px-2 py-1 text-white/30 hover:text-accent transition-colors border border-white/10 hover:border-accent/30"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            <span className="text-[8px] font-bold">{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        )}
      </div>

      {prompt ? (
        <p className="text-[10px] text-white/60 normal-case leading-relaxed">{prompt}</p>
      ) : (
        <p className="text-[9px] text-white/20 italic normal-case leading-relaxed">
          No prompt generated yet. Press Generate to create one.
        </p>
      )}
    </div>
  );
}
