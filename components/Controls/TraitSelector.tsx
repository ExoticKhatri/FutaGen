"use client";

import { useEffect, useMemo, useState } from 'react';
import { TraitCategory, TraitVariant, TRAIT_CATEGORIES } from '@/types/traits';
import { fetchSpecificColumnsFromAllTables } from '@/actions/db_fetch';
import {
  decodeSeed,
  encodeSeed,
  encodeSpecialSlot,
  encodeSpecialCount,
  getNumSpecialTraits,
  resolveTraitIndex,
} from '@/lib/seedEngine';
import { MappedTraits, TraitTitles } from '@/types/data';
import TraitDropdown, { DropdownOption } from './TraitDropdown';

interface TraitGridProps {
  seed: string;
  onSeedChange: (newSeed: string) => void;
  onResolvedTraits?: (traits: MappedTraits) => void;
  onResolvedTitles?: (titles: TraitTitles) => void;
  disabled?: boolean;
}

/** The standard trait categories (everything except 'special') */
const STANDARD_CATS = TRAIT_CATEGORIES.filter(
  (c): c is Exclude<TraitCategory, 'special'> => c !== 'special'
);

/** Converts a TraitVariant[] into DropdownOption[] using the array index as
 *  the value so encodeSeed always receives a valid 2-char base36 segment. */
function variantsToOptions(variants: TraitVariant[]): DropdownOption[] {
  return variants.map((v, idx) => ({
    value: idx.toString(36).toUpperCase().padStart(2, '0'),
    label: `${v.base36_map} — ${v.title.toUpperCase()}`,
  }));
}

export default function TraitGrid({ seed, onSeedChange, onResolvedTraits, onResolvedTitles, disabled }: TraitGridProps) {
  const [library, setLibrary] = useState<Partial<Record<TraitCategory, TraitVariant[]>>>({});
  const [loading, setLoading] = useState(true);

  // ── 1. Fetch all trait data once ─────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      const results = await fetchSpecificColumnsFromAllTables(['base36_map', 'title']);
      const traitMap: Partial<Record<TraitCategory, TraitVariant[]>> = {};
      results.forEach(res => {
        if (res.data) traitMap[res.table as TraitCategory] = res.data as unknown as TraitVariant[];
      });
      setLibrary(traitMap);
      setLoading(false);
    }
    loadData();
  }, []);

  // ── 2. Decode raw seed segments ───────────────────────────────────────────
  const rawDecoded = useMemo(() => decodeSeed(seed), [seed]);

  /**
   * Resolves a raw 2-char seed segment → the matching TraitVariant via modulo.
   * Guarantees a valid pick regardless of how large the numeric value is.
   */
  const resolveVariant = (cat: TraitCategory, rawSegment: string): TraitVariant | undefined => {
    const variants = library[cat];
    if (!variants || variants.length === 0) return undefined;
    const idx = resolveTraitIndex(rawSegment, variants.length);
    return variants[idx];
  };

  // ── 3. Compute resolved values ────────────────────────────────────────────
  //   Standard traits: always resolve via modulo → show the matched variant.
  //   Special slots: only the first `numSpecialTraits` are active;
  //   inactive slots are '' so the dropdown shows "NOT SELECTED".
  const numSpecialTraits = useMemo(() => getNumSpecialTraits(seed), [seed]);

  const resolvedValues = useMemo(() => {
    const result: Record<string, string> = {};
    // Store the resolved array index as a 2-char base36 string so it matches
    // the option values from variantsToOptions and feeds correctly into encodeSeed.
    const idxStr = (idx: number) => idx.toString(36).toUpperCase().padStart(2, '0');

    STANDARD_CATS.forEach(cat => {
      const variants = library[cat] ?? [];
      if (variants.length === 0) { result[cat] = ''; return; }
      const idx = resolveTraitIndex(rawDecoded[cat], variants.length);
      result[cat] = idxStr(idx);
    });

    [0, 1, 2].forEach(slotIdx => {
      if (slotIdx < numSpecialTraits) {
        const rawSegment = rawDecoded.special[slotIdx] ?? '00';
        const variants = library['special'] ?? [];
        if (variants.length === 0) { result[`special_${slotIdx}`] = ''; return; }
        const idx = resolveTraitIndex(rawSegment, variants.length);
        result[`special_${slotIdx}`] = idxStr(idx);
      } else {
        result[`special_${slotIdx}`] = ''; // inactive → NOT SELECTED
      }
    });

    return result;
  }, [rawDecoded, library, numSpecialTraits]);

  // ── 4. Report resolved traits / titles upward ────────────────────────────
  // onResolvedTraits reports base36_map so SystemTab can query Supabase by key.
  // onResolvedTitles reports human-readable titles for the View tab display.
  useEffect(() => {
    const activeVariants = [0, 1, 2]
      .slice(0, numSpecialTraits)
      .map(slotIdx => resolveVariant('special', rawDecoded.special[slotIdx] ?? '00'));

    if (onResolvedTraits) {
      onResolvedTraits({
        body:    resolveVariant('body',   rawDecoded.body)?.base36_map   ?? '',
        eyes:    resolveVariant('eyes',   rawDecoded.eyes)?.base36_map   ?? '',
        face:    resolveVariant('face',   rawDecoded.face)?.base36_map   ?? '',
        hair:    resolveVariant('hair',   rawDecoded.hair)?.base36_map   ?? '',
        horns:   resolveVariant('horns',  rawDecoded.horns)?.base36_map  ?? '',
        mood:    resolveVariant('mood',   rawDecoded.mood)?.base36_map   ?? '',
        outfit:  resolveVariant('outfit', rawDecoded.outfit)?.base36_map ?? '',
        pose:    resolveVariant('pose',   rawDecoded.pose)?.base36_map   ?? '',
        skin:    resolveVariant('skin',   rawDecoded.skin)?.base36_map   ?? '',
        special: activeVariants.map(v => v?.base36_map ?? '').filter(Boolean),
      });
    }

    if (onResolvedTitles) {
      onResolvedTitles({
        body:    resolveVariant('body',   rawDecoded.body)?.title   ?? '',
        eyes:    resolveVariant('eyes',   rawDecoded.eyes)?.title   ?? '',
        face:    resolveVariant('face',   rawDecoded.face)?.title   ?? '',
        hair:    resolveVariant('hair',   rawDecoded.hair)?.title   ?? '',
        horns:   resolveVariant('horns',  rawDecoded.horns)?.title  ?? '',
        mood:    resolveVariant('mood',   rawDecoded.mood)?.title   ?? '',
        outfit:  resolveVariant('outfit', rawDecoded.outfit)?.title ?? '',
        pose:    resolveVariant('pose',   rawDecoded.pose)?.title   ?? '',
        skin:    resolveVariant('skin',   rawDecoded.skin)?.title   ?? '',
        special: activeVariants.map(v => v?.title ?? '').filter(Boolean),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedValues, numSpecialTraits]);

  // ── 5. Handlers ───────────────────────────────────────────────────────────

  const handleStandardChange = (
    cat: Exclude<TraitCategory, 'special'>,
    selectedBase36: string
  ) => {
    // Guard: don't encode an empty value (library not loaded yet)
    if (!selectedBase36) return;
    const newSeed = encodeSeed(seed, cat, selectedBase36);
    onSeedChange(newSeed);
  };

  const handleSpecialChange = (slotIndex: number, selectedBase36: string) => {
    let newSeed = seed;

    if (selectedBase36 === '') {
      // User picked NOT SELECTED → trim count down to this slot index
      newSeed = encodeSpecialCount(newSeed, slotIndex);
    } else {
      // Write the chosen variant into the slot
      newSeed = encodeSpecialSlot(newSeed, slotIndex, selectedBase36);
      // If this slot was inactive, bump the count to include it
      if (slotIndex >= numSpecialTraits) {
        newSeed = encodeSpecialCount(newSeed, slotIndex + 1);
      }
    }

    onSeedChange(newSeed);
  };

  // ── 6. Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="animate-pulse text-[10px] text-white/20">LOADING_GENOME...</div>;
  }

  return (
    <div className="space-y-12">

      {/* ANATOMICAL TRAITS */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-accent/60 font-bold tracking-[0.4em] whitespace-nowrap">
            ANATOMICAL_TRAITS
          </span>
          <div className="h-px w-full bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STANDARD_CATS.map(cat => {
            const variants = library[cat] ?? [];
            const options  = variantsToOptions(variants);

            return (
              <TraitDropdown
                key={cat}
                label={cat}
                value={resolvedValues[cat] ?? ''}
                options={options.length ? options : [{ value: '', label: '— NO DATA —' }]}
                onChange={val => handleStandardChange(cat, val)}
                disabled={disabled}
              />
            );
          })}
        </div>
      </div>

      {/* SUPERNATURAL AUGMENTS (special / toggleable) */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-accent/40 font-bold tracking-[0.4em] whitespace-nowrap">
            SUPERNATURAL_AUGMENTS
          </span>
          <div className="h-px w-full bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map(idx => {
            const variants = library['special'] ?? [];
            const options: DropdownOption[] = [
              { value: '', label: '00 — NONE_SELECTED' },
              ...variantsToOptions(variants),
            ];

            return (
              <TraitDropdown
                key={`spec-${idx}`}
                label={`SPECIAL_0${idx + 1}`}
                value={resolvedValues[`special_${idx}`] ?? ''}
                options={options}
                onChange={val => handleSpecialChange(idx, val)}
                disabled={disabled}
                accent
              />
            );
          })}
        </div>
      </div>

    </div>
  );
}