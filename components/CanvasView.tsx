"use client";

import { useState, useEffect } from 'react';
import { Copy, Check, Terminal, FileText, BrainCircuit, Loader2 } from 'lucide-react';

interface CanvasViewProps {
  debugContent: string;
  systemPrompt: string;
  aiPrompt: string;
  isGenerating: boolean;
  onSystemPromptChange: (val: string) => void;
  onAiPromptChange: (val: string) => void;
}

export default function CanvasView({ 
  debugContent, 
  systemPrompt, 
  aiPrompt, 
  isGenerating,
  onSystemPromptChange,
  onAiPromptChange
}: CanvasViewProps) {
  const [activeTab, setActiveTab] = useState<'debugging' | 'system' | 'ai'>('system');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      const frame = requestAnimationFrame(() => setActiveTab('ai'));
      return () => cancelAnimationFrame(frame);
    }
  }, [isGenerating]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'debugging' ? debugContent : activeTab === 'system' ? systemPrompt : aiPrompt;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

const textareaClasses = "w-full h-full bg-transparent font-mono text-[13px] leading-relaxed outline-none resize-none custom-scrollbar pb-20";

return (
  <div className="w-full min-h-screen flex flex-col animate-in fade-in duration-1000 bg-[#0A0A0A] overflow-hidden">
    
    {/* Header */}
    <div className="flex justify-between items-center px-4 md:px-6 py-4 bg-zinc-900/20 border-b border-zinc-800/50 shrink-0">
      <div className="flex gap-4 md:gap-6">
        {[
          { id: 'system', icon: FileText, label: 'System' },
          { id: 'ai', icon: BrainCircuit, label: 'AI Refined' },
          { id: 'debugging', icon: Terminal, label: 'Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => !isGenerating && setActiveTab(tab.id as 'system' | 'ai' | 'debugging')}
            disabled={isGenerating && tab.id !== 'ai'}
            className={`flex items-center gap-2 group transition-all relative py-1 ${
              activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            } disabled:opacity-30`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? (tab.id === 'ai' ? 'text-purple-400' : 'text-emerald-400') : ''} />
            {/* Hidden on mobile, shown on small screens (sm) and up */}
            <span className="hidden sm:block text-[11px] font-medium tracking-wide uppercase">
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className={`absolute -bottom-4.25 left-0 right-0 h-px ${tab.id === 'ai' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
            )}
          </button>
        ))}
      </div>
      
      <button onClick={handleCopy} className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-zinc-500 hover:text-white flex items-center gap-2">
        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        <span className="text-[10px] uppercase font-bold tracking-tight">{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>

    {/* Main Content Viewport */}
    <div className="relative flex-1 w-full overflow-hidden">
      {/* Reduced padding on mobile (p-4) vs desktop (p-8) */}
      <div className="absolute inset-0 p-4 md:p-8">
        {activeTab === 'debugging' && (
          <textarea 
            readOnly 
            value={debugContent || '// No logs available...'} 
            className={`${textareaClasses} text-emerald-500/80`}
          />
        )}
        
        {activeTab === 'system' && (
          <textarea 
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
            placeholder="// Enter system prompt instructions..."
            className={`${textareaClasses} text-zinc-400 focus:text-zinc-200 transition-colors`}
          />
        )}

        {activeTab === 'ai' && (
          <div className="h-full w-full">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <Loader2 size={24} className="animate-spin text-purple-500/50" />
                <span className="text-[10px] text-center uppercase tracking-[0.4em] text-zinc-600 animate-pulse">
                  Processing Neural Engine
                </span>
              </div>
            ) : (
              <textarea 
                value={aiPrompt}
                onChange={(e) => onAiPromptChange(e.target.value)}
                placeholder="// Final AI prompt will appear here..."
                className={`${textareaClasses} text-purple-300/90 focus:text-purple-200 transition-colors animate-in slide-in-from-bottom-2 duration-500`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
}