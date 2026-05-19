"use client";

import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface TraitDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Use accent colour scheme (for special traits) */
  accent?: boolean;
}

export default function TraitDropdown({
  label,
  value,
  options,
  onChange,
  disabled = false,
  accent = false,
}: TraitDropdownProps) {
  const borderBase   = accent ? 'border-accent/10 hover:border-accent/30' : 'border-white/5 hover:border-white/20';
  const textColour   = accent ? 'text-accent/80'  : 'text-white/80';
  const labelColour  = accent ? 'text-accent/60'  : 'text-white/30';
  const chevronColour = accent ? 'text-accent/20' : 'text-white/20';

  return (
    <div className="space-y-1.5">
      <label className={`text-[9px] uppercase tracking-[0.2em] font-bold px-1 ${labelColour}`}>
        {label}
      </label>
      <div className="relative">
        <select
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-black/40 border ${borderBase} ${textColour} text-[10px] py-2.5 px-3 rounded appearance-none cursor-pointer outline-none font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${chevronColour}`}
        />
      </div>
    </div>
  );
}
