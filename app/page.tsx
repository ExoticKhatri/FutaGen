"use client";

import { useState } from 'react';
import ViewToggle from '@/components/ViewToggle';
import Sidebar from '@/components/Sidebar';
import GenerationView from '@/components/GenerationView';
import { buildFinalPrompt } from '@/utils/promptBuilder';
import { refinePromptWithAI } from '@/actions/propmtGen';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'library'>('canvas');
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState<string>("");

  const handleToggle = () => {
    setActiveTab((prev) => (prev === 'canvas' ? 'library' : 'canvas'));
  };

  const onGenerateSignal = async (compiledTraits: string) => {
    setIsGenerating(true);
    const localPrompt = buildFinalPrompt(compiledTraits);

    try {
      const aiEnhancedPrompt = await refinePromptWithAI(localPrompt);
      setFinalPrompt(aiEnhancedPrompt);
    } catch (error) {
      console.error("Flow Error:", error);
      setFinalPrompt(localPrompt);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full bg-black text-white overflow-y-auto lg:overflow-hidden no-scrollbar">
      
      {/* Sidebar - Stacked on mobile, side-by-side on desktop */}
      {activeTab === 'canvas' && (
        <aside className="w-full lg:w-1/4 lg:h-full border-b lg:border-b-0 lg:border-r border-zinc-800 p-4 min-w-[320px]">
          <Sidebar onGenerate={onGenerateSignal} isDisabled={isGenerating} />
        </aside>
      )}

      {/* Main Container - Full height on mobile and desktop */}
      <div className="flex-1 min-h-screen lg:h-full bg-[#050505] p-4 relative flex flex-col">
        
        <div className="mb-4">
          <ViewToggle activeTab={activeTab} onToggle={handleToggle} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 rounded-3xl p-4 lg:p-6 overflow-hidden bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent">
            
           {activeTab === 'canvas' ? (
             <GenerationView 
               prompt={finalPrompt} 
               isGenerating={isGenerating} 
               onPromptChange={setFinalPrompt}
             />
           ) : (
             <div className="text-center opacity-20">
               <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.3em]">Browsing Archives</p>
             </div>
           )}

        </div>
      </div>
    </main>
  );
}