"use client";

import { ChevronDown, AlertTriangle } from 'lucide-react';
import { CategoryKey, TraitDefinition, VariantDisplay } from '@/types/traits';

interface TraitDropdownProps {
  traitDef: TraitDefinition;
  activeId: string;
  options: VariantDisplay[];
  isLegal: (id: string) => boolean;
  isCurrentIllegal: boolean;
  onChange: (newId: string) => void;
  dependsOn?: CategoryKey[];
  dependentDisplayName?: string;
}

export default function TraitDropdown({
  traitDef,
  activeId,
  options,
  isLegal,
  isCurrentIllegal,
  onChange,
  dependsOn,
  dependentDisplayName,
}: TraitDropdownProps) {
  const hasDependency = dependsOn && dependsOn.length > 0;

  return (
    <div className="flex flex-col gap-1.5 px-3 py-2 hover:bg-zinc-900/30 rounded border border-transparent hover:border-zinc-900/50 transition-all group">
      
      {/* HEADER ROW: Title (Left) and Dependency (Right) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-wider group-hover:text-zinc-300 transition-colors">
            {traitDef.displayName}
          </span>
          {isCurrentIllegal && (
            <div className="flex items-center gap-1 px-1 rounded bg-amber-950/20 border border-amber-900/30">
              <AlertTriangle size={8} className="text-amber-600" />
              <span className="text-[7px] text-amber-700 font-bold uppercase">Conflict</span>
            </div>
          )}
        </div>

        {hasDependency && (
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] font-mono text-teal-800 uppercase">Linked To:</span>
            <span className="text-[8px] font-mono text-teal-600 bg-teal-950/10 px-1.5 py-0.5 rounded border border-teal-900/20">
              {dependentDisplayName}
            </span>
          </div>
        )}
      </div>

      {/* DROPDOWN ROW: Full width select */}
      <div className="relative">
        <select
                  value={activeId}
                  title={`Select ${traitDef.displayName}`}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-black border ${
            isCurrentIllegal ? 'border-amber-900/40' : 'border-zinc-900'
          } text-zinc-400 text-[10px] font-mono py-1.5 px-2.5 rounded appearance-none cursor-pointer outline-none transition-all hover:border-zinc-800 focus:border-teal-900/50 hover:text-zinc-200`}
        >
          {options.map((opt) => {
            const legal = isLegal(opt.id);
            return (
              <option
                key={opt.id}
                value={opt.id}
                className={legal ? 'text-zinc-200 bg-zinc-950' : 'text-zinc-700 bg-black'}
              >
                    {opt.id} — {opt.name}
              </option>
            );
          })}
        </select>
        
        {/* Visual Decor: Seed Index Overlay */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none hidden group-hover:block">
           <span className="text-[7px] font-mono text-zinc-800">
             OFFSET_{traitDef.seedIndex[0]}
           </span>
        </div>

        <ChevronDown
          size={10}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none group-hover:text-teal-900 transition-colors"
        />
      </div>
    </div>
  );
}