"use client";

import { useState, useTransition } from "react";
import { TraitCategory } from "@/types/traits";
import { bulkInsertEntries } from "@/actions/db_insert";
import { Loader2, Code } from "lucide-react";

export default function JsonUpload({ activeTable, onSuccess }: { activeTable: TraitCategory, onSuccess: () => void }) {
  const [jsonText, setJsonText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleBulkInsert = () => {
    setError("");
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of objects");
      
      const isValid = parsed.every(item => typeof item.title === 'string' && typeof item.description === 'string');
      if (!isValid) throw new Error("Each object must contain 'title' and 'description' strings");

      startTransition(async () => {
        const res = await bulkInsertEntries(activeTable, parsed);
        if (res.error) {
          setError(res.error);
        } else {
          setJsonText("");
          onSuccess();
        }
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-black/40 p-3 rounded-md border border-white/5 font-mono text-[10px] text-zinc-500">
        <p className="mb-1 uppercase">Expected_Format:</p>
        <pre className="text-teal-500/70">
{`[
  { "title": "...", "description": "..." },
  { "title": "...", "description": "..." }
]`}
        </pre>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">JSON Payload</label>
        <textarea 
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Paste JSON array here..."
          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-sm font-mono text-zinc-300 focus:border-teal-500/50 outline-none resize-none h-32 transition-colors scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        />
      </div>
      {error && <span className="text-red-500 text-[10px] uppercase">{error}</span>}
      <button 
        onClick={handleBulkInsert}
        disabled={isPending || !jsonText.trim()}
        className="mt-2 flex items-center justify-center gap-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-500 border border-teal-500/20 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Code size={14} />}
        Process Bulk JSON
      </button>
    </div>
  );
}
