"use client";

import { useState } from 'react';
import Editor from '@/test/Editor';
import Canvas from '@/test/Canvas';
import Controller from '@/test/Controls';
import { TraitData } from '@/types/traits';

export default function Home() {
  const [activeTraits, setActiveTraits] = useState<TraitData | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  return (
    <main className="flex h-screen w-full bg-[#050505] text-zinc-400 overflow-hidden">
      
      {/* SIDEBAR (30%): Canvas + Controls */}
      <aside className="w-[30%] h-full border-r border-zinc-900 flex flex-col bg-[#020202]">
        
        {/* Top: The Canvas (Growth area) */}
        <div className="flex-1 min-h-0">
          <Canvas data={activeTraits} />
        </div>

        {/* Bottom: The Controller (Fixed height) */}
        <div className="p-6 border-t border-zinc-900 bg-black/40">
          <div className="max-w-sm mx-auto">
            <Controller 
              onTriggerRandom={() => setTrigger(prev => prev + 1)} 
            />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT (70%): Editor Area */}
      <section className="w-[70%] h-full flex flex-col">
        <div className="flex-1 h-screen">
          <Editor 
            onDataChange={setActiveTraits} 
            triggerKey={trigger}
          />
        </div>
      </section>

    </main>
  );
}