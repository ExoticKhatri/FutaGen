"use client";

import { useState, useTransition } from "react";
import { TraitCategory } from "@/types/traits";
import { insertEntry } from "@/actions/db_insert";
import { Loader2, Send } from "lucide-react";

export default function ManualUpload({ activeTable, onSuccess }: { activeTable: TraitCategory, onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await insertEntry(activeTable, { title, description });
      if (res.error) {
        setError(res.error);
      } else {
        setTitle("");
        setDescription("");
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Title</label>
        <input 
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter the title..."
          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-sm font-bold text-zinc-300 focus:border-teal-500/50 outline-none uppercase transition-colors"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Description</label>
        <textarea 
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide a detailed description..."
          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-400 focus:border-teal-500/50 outline-none resize-none h-24 transition-colors"
        />
      </div>
      {error && <span className="text-red-500 text-[10px] uppercase">{error}</span>}
      <button 
        disabled={isPending || !title || !description}
        className="mt-2 flex items-center justify-center gap-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-500 border border-teal-500/20 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Insert Record
      </button>
    </form>
  );
}
