"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { TraitCategory } from "@/types/traits";
import ManualUpload from "./ManualUpload";
import JsonUpload from "./JsonUpload";
import AiUpload from "./AiUpload";

export default function UploadModal({ 
  isOpen, 
  onClose, 
  activeTable 
}: { 
  isOpen: boolean; 
  onClose?: () => void; 
  activeTable: TraitCategory 
}) {
  const [activeTab, setActiveTab] = useState<"manual" | "json" | "ai">("manual");

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setActiveTab("manual"), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-[#050505] border border-white/10 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-widest">Add New Records</h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Target_Table: <span className="text-teal-500">{activeTable}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-md hover:bg-white/5 active:scale-95">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-2 bg-black/10">
          <button 
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'manual' ? 'border-teal-500 text-teal-500' : 'border-transparent text-zinc-600 hover:text-zinc-300'}`}
          >
            Manual Entry
          </button>
          <button 
            onClick={() => setActiveTab("json")}
            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'json' ? 'border-teal-500 text-teal-500' : 'border-transparent text-zinc-600 hover:text-zinc-300'}`}
          >
            Bulk JSON
          </button>
          <button 
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'ai' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-600 hover:text-zinc-300'}`}
          >
            AI Generation
          </button>
        </div>

        {/* Body */}
        <div className="p-5 bg-[#0a0a0a]">
          {activeTab === "manual" && <ManualUpload activeTable={activeTable} onSuccess={onClose} />}
          {activeTab === "json" && <JsonUpload activeTable={activeTable} onSuccess={onClose} />}
          {activeTab === "ai" && <AiUpload activeTable={activeTable} onSuccess={onClose} />}
        </div>
      </div>
    </div>
  );
}
