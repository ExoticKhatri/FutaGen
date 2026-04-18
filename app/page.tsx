"use client";

import { useState } from 'react';
import Dock from '@/components/Dock';
import Sidebar from '@/components/Sidebar';
import CanvasView from '@/components/CanvasView';
import { generateAIReadyPrompt } from '@/utils/promptGen';
import { refinePromptWithAI } from '@/actions/promptRefiner';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'library'>('canvas');
  const [debugContent, setDebugContent] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateRandomTrigger, setGenerateRandomTrigger] = useState<number>(0);

  const handleToggle = () => {
    setActiveTab((prev) => (prev === 'canvas' ? 'library' : 'canvas'));
  };

  const handleSidebarChange = (newTraits: string) => {
    setDebugContent(newTraits);
    
    if (!newTraits) {
      setSystemPrompt('');
    } else {
      // We generate the prompt once here. 
      // The user can then override it in the CanvasView.
      const finalFullPrompt = generateAIReadyPrompt(newTraits);
      setSystemPrompt(finalFullPrompt);
    }
  };

  // Execute AI Refinement specifically when the generation action is requested natively
  const handleGenerate = async () => {
    if (!systemPrompt || isGenerating) return;
    setIsGenerating(true);
    setAiPrompt('');
    
    try {
      const refinedResult = await refinePromptWithAI(systemPrompt);
      setAiPrompt(refinedResult);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full bg-black text-white overflow-x-hidden lg:overflow-hidden">
      
      {/* CONTAINER A: VIEWPORT / GENERATION AREA */}
      <div className="relative flex-1 min-h-screen bg-[#050505] flex flex-col items-center justify-center order-1 lg:order-2">
        
        <Dock 
          activeTab={activeTab} 
          onToggle={handleToggle} 
          isDisabled={isGenerating}
          onGenerate={handleGenerate}
          onRandomize={() => setGenerateRandomTrigger((prev) => prev + 1)}
        />

        {activeTab === 'canvas' ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <CanvasView 
              debugContent={debugContent} 
              systemPrompt={systemPrompt}
              aiPrompt={aiPrompt}
              isGenerating={isGenerating}
              // These handlers ensure your edits are saved to the Home state
              onSystemPromptChange={(newVal) => setSystemPrompt(newVal)}
              onAiPromptChange={(newVal) => setAiPrompt(newVal)}
            />
          </div>
        ) : (
          <div className="text-center opacity-20">
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.3em]">Browsing Archives</p>
          </div>
        )}
      </div>

      {/* CONTAINER B: SIDEBAR / CONTROLS */}
      {activeTab === 'canvas' && (
        <aside className="w-full lg:w-1/4 lg:h-full border-t lg:border-t-0 lg:border-r border-zinc-800 p-4 min-w-[320px] order-2 lg:order-1 bg-black shrink-0 overflow-y-auto">
          <Sidebar 
            disable={isGenerating} 
            generaterandom={generateRandomTrigger} 
            onChange={handleSidebarChange} 
          />
        </aside>
      )}

    </main>
  );
}