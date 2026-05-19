"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateAITraits } from "@/actions/ai/entryGen";
import { TRAIT_CATEGORIES, TraitCategory } from "@/types/traits";
import { bulkInsertEntries } from "@/actions/db_insert";
import { Box, Sparkles, Terminal, Save, Loader2, ChevronLeft } from "lucide-react";
import Link from 'next/link';

// Interface to fix the 'any' ESLint error
interface GenerationResult {
  success: boolean;
  data: any[];
  path: string;
}

export default function AiGenerationPage() {
  const router = useRouter();
  
  // State management
  const [activeTable, setActiveTable] = useState<TraitCategory>("body");
  const [count, setCount] = useState(10);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GenerationResult | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      const response = await generateAITraits(
        activeTable,
        count,
        prompt || `Generate diverse variants for ${activeTable} trait.`
      );
      // Assuming response matches our interface
      setResult(response as GenerationResult);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!result?.data || result.data.length === 0) return;
    
    setIsCommitting(true);
    try {
      const response = await bulkInsertEntries(activeTable, result.data);
      
      if (response.error) {
        alert(`Inference Upload Failed: ${response.error}`);
      } else {
        alert(`Successfully synced ${result.data.length} records to ${activeTable}`);
        setResult(null);
        router.refresh(); 
      }
    } catch (err) {
      console.error("Commit error:", err);
    } finally {
      setIsCommitting(false);
    }
  };
    
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 p-4 md:p-8 font-mono">
      {/* Breadcrumb */}
      <Link href="/lab" className="flex items-center gap-2 text-[10px] text-zinc-600 hover:text-teal-500 transition-colors mb-8 uppercase tracking-widest">
        <ChevronLeft size={14} /> Back_to_Registry
      </Link>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/20 border border-white/5 rounded-xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={18} className="text-teal-500" />
              <h1 className="text-xs font-black text-white uppercase tracking-[0.3em]">AI_Inference_Engine</h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] text-zinc-600 uppercase mb-2 block">Target_Node</label>
                <select 
                  value={activeTable}
                  onChange={(e) => setActiveTable(e.target.value as TraitCategory)}
                  className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-xs text-zinc-300 outline-none focus:border-teal-500/50 transition-colors"
                >
                  {TRAIT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] text-zinc-600 uppercase mb-2 block">Entry_Count: {count}</label>
                <input 
                  type="range" min="1" max="50" value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full accent-teal-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-600 uppercase mb-2 block">Context_Override</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Additional instructions..."
                  className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-xs text-zinc-300 h-32 outline-none focus:border-teal-500/50 transition-colors resize-none"
                />
              </div>

              <button 
                onClick={handleExecute}
                disabled={isLoading}
                className="w-full bg-teal-500 text-black py-3 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-teal-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Terminal size={14} />}
                Execute_Generation
              </button>
            </div>
          </div>
        </div>

        {/* Right: Raw Output Preview */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-black border border-white/5 rounded-xl flex flex-col h-[700px] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 bg-white/2 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Box size={14} className="text-zinc-600" />
                 <span className="text-[10px] text-zinc-500 uppercase font-bold">Buffer_Preview</span>
               </div>
               {result?.success && (
                 <span className="text-[9px] text-teal-500 font-bold uppercase tracking-tighter animate-pulse">
                   Data_Cached: {result.path.split('/').pop()}
                 </span>
               )}
            </div>
            
            <div className="flex-1 p-6 overflow-auto custom-scrollbar bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent">
              {result ? (
                <pre className="text-[11px] leading-relaxed text-teal-500/80 font-mono">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-800">
                  <Terminal size={40} className="mb-4 opacity-20" />
                  <p className="text-[10px] uppercase tracking-[0.4em]">Awaiting_Inference</p>
                </div>
              )}
            </div>

            {result?.success && (
              <div className="p-4 border-t border-white/5 bg-zinc-950/50 flex justify-end gap-4">
                <button 
                  onClick={() => setResult(null)}
                  className="px-4 py-2 text-[9px] text-zinc-500 hover:text-white transition-colors uppercase font-bold"
                >
                  Clear_Buffer
                </button>

                <button 
                  onClick={handleCommit}
                  disabled={isCommitting}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-black text-[9px] font-bold uppercase tracking-widest rounded hover:bg-teal-400 transition-all disabled:opacity-50"
                >
                  {isCommitting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  Commit_to_Database
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}