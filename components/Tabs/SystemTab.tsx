"use client";

import { useState } from 'react';
import { RefreshCw, Database, Sparkles, Wand2, Copy, Check } from 'lucide-react';
import { GeneratorState } from '@/types/data';
import { TraitCategory, TRAIT_CATEGORIES } from '@/types/traits';
import { fetchSpecificEntryColumn } from '@/actions/db_fetch';
import { generateMasterPrompt } from '@/actions/ai/promptGen';
import { GENERATOR_CONFIG } from '@/lib/config';

interface SystemTabProps {
  state: GeneratorState;
}

export default function SystemTab({ state }: SystemTabProps) {
  const [descriptions, setDescriptions] = useState<Record<string, string | string[]>>({});
  const [finalAiPrompt, setFinalAiPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Resolve Database Descriptions
  const resolveTraits = async () => {
    if (!state.traits) return;
    setLoading(true);
    const resolved: Record<string, string | string[]> = {};
    try {
      const promises = TRAIT_CATEGORIES.map(async (category) => {
        const val = state.traits![category];
        if (category === 'special' && Array.isArray(val)) {
          const results = await Promise.all(val.map(async (v) => {
            const { data } = await fetchSpecificEntryColumn(category, 'description', v);
            return data as string;
          }));
          resolved[category] = results.filter(Boolean);
        } else if (typeof val === 'string') {
          const { data } = await fetchSpecificEntryColumn(category as TraitCategory, 'description', val);
          resolved[category] = (data as string) || "Standard variant";
        }
      });
      await Promise.all(promises);
      setDescriptions(resolved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Call AI to Generate 700-word Prompt
  const handleAiGeneration = async () => {
    setGenLoading(true);
    
    // Find metadata from config
    const styleData = GENERATOR_CONFIG.ART_STYLES.find(s => s.id === state.style);
    const compData = GENERATOR_CONFIG.COMPOSITIONS.find(c => c.id === state.composition);
    const frameData = GENERATOR_CONFIG.FRAMES.find(f => f.id === state.frame);

    const result = await generateMasterPrompt({
      composition: compData?.label || state.composition,
      frame: frameData?.ratio || state.frame,
      styleDescription: styleData?.description || state.style,
      traits: descriptions
    });

    if (result.success) {
      setFinalAiPrompt(result.prompt || "");
    }
    setGenLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalAiPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER ACTIONS */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-[10px] text-accent italic">SYSTEM_PIPELINE</p>
          <p className="text-[9px] text-white/30 mt-1">STATUS: {finalAiPrompt ? 'PROMPT_READY' : 'AWAITING_INPUT'}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resolveTraits}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw size={12} className="animate-spin" /> : <Database size={12} />}
            <span className="text-[9px] font-bold uppercase">Resolve_DB</span>
          </button>
          
          <button
            onClick={handleAiGeneration}
            disabled={genLoading || Object.keys(descriptions).length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-accent text-black hover:bg-white transition-all disabled:opacity-20 disabled:bg-white/5 disabled:text-white"
          >
            {genLoading ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
            <span className="text-[9px] font-bold uppercase">Generate_Prompt</span>
          </button>
        </div>
      </div>

      {/* AI PROMPT DISPLAY */}
      {finalAiPrompt && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded relative group">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[8px] text-accent font-bold">FINAL_MASTER_PROMPT (700_WORDS)</span>
              <button onClick={copyToClipboard} className="text-accent hover:text-white transition-colors">
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
           </div>
           <p className="text-[11px] text-white/80 normal-case leading-relaxed font-sans italic">
             "{finalAiPrompt}"
           </p>
        </div>
      )}

      {/* DB RESOLUTION GRID */}
      {Object.keys(descriptions).length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          <p className="text-[8px] text-white/20 mb-1">RESOLVED_TRAIT_DESCRIPTIONS:</p>
          {TRAIT_CATEGORIES.map((cat) => (
            <div key={cat} className="p-2 bg-white/[0.02] border border-white/5 flex justify-between gap-4">
              <span className="text-[8px] text-accent uppercase w-20 shrink-0">{cat}</span>
              <span className="text-[10px] text-white/50 normal-case flex-1">
                {Array.isArray(descriptions[cat]) 
                  ? (descriptions[cat] as string[]).join(' | ') 
                  : descriptions[cat]}
              </span>
            </div>
          ))}
        </div>
      )}

      {Object.keys(descriptions).length === 0 && !loading && (
        <div className="py-20 border border-dashed border-white/5 flex flex-col items-center justify-center opacity-20">
          <Sparkles size={24} className="mb-2" />
          <p className="text-[9px] tracking-widest">INITIALIZE_DATABASE_FETCH_TO_PROCEED</p>
        </div>
      )}
    </div>
  );
}