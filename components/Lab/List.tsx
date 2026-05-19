"use client";

import { useState, useTransition, Fragment } from 'react';
import { TraitCategory, TraitVariant } from "@/types/traits";
import { deleteEntry, bulkDeleteEntries } from "@/actions/db_delet";
import { updateEntry, bulkUpdateEntries } from "@/actions/db_update";
import { Trash2, Cpu, Box, Hash, Save, ChevronDown } from "lucide-react";
import LabTableToolbar from "./ListToolbar";

interface LabTableListProps {
  initialData: TraitVariant[];
  activeTable: TraitCategory;
  serverError?: string;
}

export default function LabTableList({ initialData, activeTable, serverError }: LabTableListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<Record<string, { title: string, description: string }>>({});
  const [isPending, startTransition] = useTransition();

  const toggleSelectAll = () => {
    if (selectedIds.size === initialData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(initialData.map((row) => row.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleExpandRow = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm record purge?")) return;
    startTransition(async () => {
      await deleteEntry(activeTable, id);
    });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Purge ${selectedIds.size} records?`)) return;
    startTransition(async () => {
      const result = await bulkDeleteEntries(activeTable, Array.from(selectedIds));
      if (!result.error) setSelectedIds(new Set());
    });
  };

  const handleBulkSave = async () => {
    if (Object.keys(edits).length === 0) return;
    startTransition(async () => {
      const result = await bulkUpdateEntries(activeTable, edits);
      if (!result.error) {
        setEdits({});
      }
    });
  };

  const handleSave = async (id: string) => {
    const edit = edits[id];
    if (!edit) return;
    startTransition(async () => {
      const result = await updateEntry(activeTable, id, edit);
      if (!result.error) {
        setEdits((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    });
  };

  const handleEditChange = (id: string, field: 'title' | 'description', value: string, row: TraitVariant) => {
    setEdits((prev) => {
      const currentEdit = prev[id] || { title: row.title, description: row.description };
      const nextEdit = { ...currentEdit, [field]: value };
      
      // If the values are back to original, remove from edits
      if (nextEdit.title === row.title && nextEdit.description === row.description) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      
      return { ...prev, [id]: nextEdit };
    });
  };

  return (
    <div className="w-full flex flex-col border rounded-md border-white/10 bg-black/20 backdrop-blur-sm">
      <LabTableToolbar
        activeTable={activeTable}
        selectedIdsSize={selectedIds.size}
        editsCount={Object.keys(edits).length}
        serverError={serverError}
        isPending={isPending}
        onBulkDelete={handleBulkDelete}
        onBulkSave={handleBulkSave}
      />

      {/* Table Container */}
      <div className="flex-1 overflow-y-auto w-full scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {initialData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[300px] md:min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/5 bg-transparent">
                  <th className="p-3 md:p-4 w-10 md:w-12 text-center">
                    <input 
                      type="checkbox"
                      checked={selectedIds.size === initialData.length && initialData.length > 0}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-950 text-teal-500 accent-teal-500 cursor-pointer"
                    />
                  </th>
                  <th className="hidden md:table-cell p-3 md:p-4 text-[10px] md:text-xs font-mono text-zinc-600 uppercase tracking-widest font-medium">UUID</th>
                  <th className="hidden md:table-cell p-3 md:p-4 text-[10px] md:text-xs font-mono text-zinc-600 uppercase tracking-widest font-medium">Map_10</th>
                  <th className="p-3 md:p-4 text-[10px] md:text-xs font-mono text-zinc-600 uppercase tracking-widest font-medium">Base_36</th>
                  <th className="p-3 md:p-4 text-[10px] md:text-xs font-mono text-zinc-600 uppercase tracking-widest font-medium">Title</th>
                  <th className="hidden md:table-cell p-3 md:p-4 text-[10px] md:text-xs font-mono text-zinc-600 uppercase tracking-widest font-medium w-[40%]">Description</th>
                  <th className="p-3 md:p-4 text-[10px] md:text-xs font-mono text-zinc-600 uppercase tracking-widest font-medium text-right">Utility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {initialData.map((row) => {
                  const hasEdits = !!edits[row.id];
                  const isExpanded = expandedIds.has(row.id);
                  return (
                    <Fragment key={row.id}>
                      <tr 
                        className={`group transition-colors ${selectedIds.has(row.id) ? 'bg-teal-500/[0.03]' : 'hover:bg-white/[0.02]'} ${hasEdits ? 'bg-indigo-500/[0.03]' : ''}`}
                      >
                        <td className="p-3 md:p-4 text-center">
                          <input 
                            type="checkbox"
                            checked={selectedIds.has(row.id)}
                            onChange={() => toggleSelectRow(row.id)}
                            className="w-3.5 h-3.5 rounded border-zinc-800 bg-zinc-950 text-teal-500 accent-teal-500 cursor-pointer"
                          />
                        </td>
                        <td className="hidden md:table-cell p-3 md:p-4 font-mono text-xs text-zinc-600 group-hover:text-zinc-500 transition-colors uppercase">
                          {row.id.slice(0, 8)}...
                        </td>
                        <td className="hidden md:table-cell p-3 md:p-4 font-mono text-xs text-teal-500/80">{row.base10_map}</td>
                        <td className="p-3 md:p-4 font-mono text-xs text-zinc-500 uppercase">{row.base36_map}</td>
                        <td className="p-3 md:p-4">
                          {/* Mobile read-only summary */}
                          <div className="md:hidden text-xs font-bold text-zinc-300 uppercase tracking-wider truncate max-w-[120px]">
                            {edits[row.id]?.title ?? row.title}
                          </div>
                          {/* Desktop Editable Input */}
                          <input
                            type="text"
                            value={edits[row.id]?.title ?? row.title}
                            onChange={(e) => handleEditChange(row.id, 'title', e.target.value, row)}
                            className="hidden md:block bg-transparent border-b border-transparent focus:border-teal-500/50 outline-none w-full text-xs font-bold text-zinc-300 uppercase tracking-wider transition-colors"
                          />
                        </td>
                        <td className="hidden md:table-cell p-3 md:p-4">
                          <input
                            type="text"
                            value={edits[row.id]?.description ?? row.description}
                            onChange={(e) => handleEditChange(row.id, 'description', e.target.value, row)}
                            className="bg-transparent border-b border-transparent focus:border-teal-500/50 outline-none w-full text-xs text-zinc-400 transition-colors"
                          />
                        </td>
                        <td className="p-3 md:p-4 text-right">
                          <div className="flex items-center justify-end gap-1 md:gap-2">
                            {/* Mobile Expand */}
                            <button 
                              onClick={() => toggleExpandRow(row.id)}
                              className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-300 transition-all"
                            >
                              <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Desktop Save */}
                            <button 
                              onClick={() => handleSave(row.id)}
                              disabled={isPending || !hasEdits}
                              className={`hidden md:block p-1.5 rounded-md transition-all ${
                                hasEdits 
                                  ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 opacity-100' 
                                  : 'opacity-0 pointer-events-none'
                              }`}
                            >
                              <Save size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(row.id)}
                              disabled={isPending}
                              className="p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Mobile Expanded Editor */}
                      {isExpanded && (
                        <tr className="md:hidden bg-black/40 border-b border-white/5">
                          <td colSpan={5} className="p-4 space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-white/5">
                              <span className="text-[10px] font-mono text-zinc-600 uppercase">UUID: {row.id.slice(0, 8)}</span>
                              <span className="text-[10px] font-mono text-zinc-600 uppercase">Map_10: <span className="text-teal-500/80">{row.base10_map}</span></span>
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Title</label>
                              <input
                                type="text"
                                value={edits[row.id]?.title ?? row.title}
                                onChange={(e) => handleEditChange(row.id, 'title', e.target.value, row)}
                                className="w-full bg-white/[0.02] border border-white/5 rounded px-3 py-2 text-xs font-bold text-zinc-300 focus:border-teal-500/30 outline-none uppercase tracking-wider transition-colors"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Description</label>
                              <textarea
                                value={edits[row.id]?.description ?? row.description}
                                onChange={(e) => handleEditChange(row.id, 'description', e.target.value, row)}
                                className="w-full bg-white/[0.02] border border-white/5 rounded px-3 py-2 text-xs text-zinc-400 focus:border-teal-500/30 outline-none resize-none h-20 transition-colors"
                              />
                            </div>

                            {hasEdits && (
                              <div className="flex justify-end pt-3">
                                <button
                                  onClick={() => handleSave(row.id)}
                                  disabled={isPending}
                                  className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all"
                                >
                                  <Save size={12} /> Commit Row
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px] border border-dashed border-white/5 m-6 rounded-lg bg-black/20">
            <Box size={24} className="text-zinc-800 mb-3" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">No_Data_Detected</p>
          </div>
        )}
      </div>

      {/* Row Counter Footer */}
      <div className="p-3 md:p-4 flex items-center gap-3 border-t border-white/5 bg-transparent">
        <Cpu size={12} className="text-zinc-700" />
        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">
          Buffer_Entries: <span className="text-zinc-400">{initialData.length}</span>
        </span>
      </div>
    </div>
  );
}