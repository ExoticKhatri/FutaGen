"use client";

import { Activity, Trash2, Save } from "lucide-react";

interface LabTableToolbarProps {
  activeTable: string;
  selectedIdsSize: number;
  editsCount: number;
  serverError?: string;
  isPending: boolean;
  onBulkDelete: () => void;
  onBulkSave: () => void;
}

export default function LabTableToolbar({
  activeTable,
  selectedIdsSize,
  editsCount,
  serverError,
  isPending,
  onBulkDelete,
  onBulkSave,
}: LabTableToolbarProps) {
  return (
    <div className="px-4 py-3 border-b border-white/5 bg-transparent flex items-center justify-between min-h-[56px] flex-wrap gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-zinc-600" />
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
            {activeTable}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {selectedIdsSize > 0 && (
            <div className="flex items-center animate-in fade-in duration-300">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Selected: <span className="text-zinc-300">{selectedIdsSize}</span>
              </span>
            </div>
          )}

          {editsCount > 0 && (
            <div className="flex items-center animate-in fade-in duration-300">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Edits: <span className="text-zinc-300">{editsCount}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {serverError && (
          <span className="text-[10px] font-mono text-red-500/70 uppercase">
            Error: {serverError}
          </span>
        )}

        {editsCount > 0 && (
          <button
            onClick={onBulkSave}
            disabled={isPending}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-medium animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Save size={12} />
            Commit
          </button>
        )}

        {selectedIdsSize > 0 && (
          <button
            onClick={onBulkDelete}
            disabled={isPending}
            className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors text-[10px] uppercase tracking-widest font-medium animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Trash2 size={12} />
            Purge
          </button>
        )}
      </div>
    </div>
  );
}

