"use client";

import React, { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TraitCategory, TRAIT_CATEGORIES } from '@/types/traits';
import { ChevronDown, Loader2, Plus } from 'lucide-react';

interface LabHeaderProps {
  activeTable: TraitCategory;
  disabled?: boolean;
  onInsert?: () => void;
}

export default function LabHeader({ activeTable, disabled, onInsert }: LabHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTable = e.target.value;
    startTransition(() => {
      router.push(`${pathname}?table=${selectedTable}`);
    });
  };

  const isLoading = disabled || isPending;

  return (
    <header className="w-full border-b border-white/5 bg-black/40 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto flex items-center justify-end gap-3 md:gap-6">
        
        {/* Tactical Status (Hidden on very small mobile) */}
        <div className="flex flex-col items-end gap-1 px-4 md:px-6 border-r border-white/5">
          <span className="text-[7px] md:text-[8px] font-mono text-zinc-600 uppercase tracking-[0.2em]">System_State</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${isLoading ? 'text-amber-500 animate-pulse' : 'text-teal-500'}`}>
            {isLoading ? 'Syncing' : 'Linked'}
          </span>
        </div>

        {/* Control Group: Keeps everything side-by-side */}
        <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-end">
          
          {/* Responsive Table Selector */}
          <div className="relative group w-full h-full">
            <select
              id="table-select"
              value={activeTable}
              onChange={handleTableChange}
              disabled={isLoading}
              className={`
                w-full appearance-none bg-zinc-950 border border-white/10 
                text-zinc-300 text-[10px] font-bold uppercase tracking-[0.2em] 
                pl-4 pr-10 py-2.5 rounded-md cursor-pointer outline-none 
                transition-all duration-300
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-teal-500/40 hover:bg-zinc-900'}
              `}
            >
              {TRAIT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-zinc-950 text-zinc-300">
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
              {isLoading ? (
                <Loader2 size={12} className="text-teal-500 animate-spin" />
              ) : (
                <ChevronDown size={12} className="text-zinc-600 group-hover:text-teal-500 transition-colors" />
              )}
            </div>
          </div>

          {/* Responsive Action Button */}
          <button
            onClick={onInsert}
            disabled={isLoading}
            title="Insert Record"
            className={`
              flex items-center justify-center gap-2 
              h-auto px-4 sm:px-6 py-2.5
              bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest
              rounded-md transition-all active:scale-95 shadow-lg
              ${isLoading ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)]'}
            `}
          >
            <Plus size={16} strokeWidth={3} className={isLoading ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">Insert_Record</span>
          </button>
        </div>
        
      </div>
    </header>
  );
}