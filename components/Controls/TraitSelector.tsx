"use client";

import { useEffect, useMemo, useState } from 'react';
import { Sliders } from 'lucide-react';
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
  /** How many characters the current seed encodes (group size) */
  characterCount: number;
  /** Which character's traits the dropdowns below are currently editing */
  activeCharacterIndex: number;
  onActiveCharacterChange: (index: number) => void;
  /** Resolved traits/titles for the character currently being edited */
  onResolvedTraits?: (traits: MappedTraits) => void;
  onResolvedTitles?: (titles: TraitTitles) => void;
  /** Resolved traits/titles for every character in the group, index-aligned */
  onResolvedAllTraits?: (traits: MappedTraits[]) => void;
  onResolvedAllTitles?: (titles: TraitTitles[]) => void;
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

function resolveVariant(
  library: Partial<Record<TraitCategory, TraitVariant[]>>,
  cat: TraitCategory,
  rawSegment: string
): TraitVariant | undefined {
  const variants = library[cat];
  if (!variants || variants.length === 0) return undefined;
  const idx = resolveTraitIndex(rawSegment, variants.length);
  return variants[idx];
}

/** Fully resolves one character's block of the seed into base36_map + title form. */
function buildCharacterResolution(
  seed: string,
  characterIndex: number,
  library: Partial<Record<TraitCategory, TraitVariant[]>>
): { traits: MappedTraits; titles: TraitTitles } {
  const rawDecoded = decodeSeed(seed, characterIndex);
  const numSpecialTraits = getNumSpecialTraits(seed, characterIndex);
  const activeVariants = [0, 1, 2]
    .slice(0, numSpecialTraits)
    .map(slotIdx => resolveVariant(library, 'special', rawDecoded.special[slotIdx] ?? '00'));

  const traits: MappedTraits = {
    body:    resolveVariant(library, 'body',   rawDecoded.body)?.base36_map   ?? '',
    eyes:    resolveVariant(library, 'eyes',   rawDecoded.eyes)?.base36_map   ?? '',
    face:    resolveVariant(library, 'face',   rawDecoded.face)?.base36_map   ?? '',
    hair:    resolveVariant(library, 'hair',   rawDecoded.hair)?.base36_map   ?? '',
    horns:   resolveVariant(library, 'horns',  rawDecoded.horns)?.base36_map  ?? '',
    mood:    resolveVariant(library, 'mood',   rawDecoded.mood)?.base36_map   ?? '',
    outfit:  resolveVariant(library, 'outfit', rawDecoded.outfit)?.base36_map ?? '',
    pose:    resolveVariant(library, 'pose',   rawDecoded.pose)?.base36_map   ?? '',
    skin:    resolveVariant(library, 'skin',   rawDecoded.skin)?.base36_map   ?? '',
    special: activeVariants.map(v => v?.base36_map ?? '').filter(Boolean),
  };

  const titles: TraitTitles = {
    body:    resolveVariant(library, 'body',   rawDecoded.body)?.title   ?? '',
    eyes:    resolveVariant(library, 'eyes',   rawDecoded.eyes)?.title   ?? '',
    face:    resolveVariant(library, 'face',   rawDecoded.face)?.title   ?? '',
    hair:    resolveVariant(library, 'hair',   rawDecoded.hair)?.title   ?? '',
    horns:   resolveVariant(library, 'horns',  rawDecoded.horns)?.title  ?? '',
    mood:    resolveVariant(library, 'mood',   rawDecoded.mood)?.title   ?? '',
    outfit:  resolveVariant(library, 'outfit', rawDecoded.outfit)?.title ?? '',
    pose:    resolveVariant(library, 'pose',   rawDecoded.pose)?.title   ?? '',
    skin:    resolveVariant(library, 'skin',   rawDecoded.skin)?.title   ?? '',
    special: activeVariants.map(v => v?.title ?? '').filter(Boolean),
  };

  return { traits, titles };
}

export default function TraitGrid({
  seed,
  onSeedChange,
  characterCount,
  activeCharacterIndex,
  onActiveCharacterChange,
  onResolvedTraits,
  onResolvedTitles,
  onResolvedAllTraits,
  onResolvedAllTitles,
  disabled,
}: TraitGridProps) {
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

  // ── 2. Decode raw seed segments for the character being edited ──────────
  const rawDecoded = useMemo(
    () => decodeSeed(seed, activeCharacterIndex),
    [seed, activeCharacterIndex]
  );

  // ── 3. Compute resolved dropdown values (array-index based) ─────────────
  //   Standard traits: always resolve via modulo → show the matched variant.
  //   Special slots: only the first `numSpecialTraits` are active;
  //   inactive slots are '' so the dropdown shows "NOT SELECTED".
  const numSpecialTraits = useMemo(
    () => getNumSpecialTraits(seed, activeCharacterIndex),
    [seed, activeCharacterIndex]
  );

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

  // ── 4. Resolve every character in the group (for upward reporting) ──────
  const allCharacters = useMemo(
    () => Array.from({ length: characterCount }, (_, i) => buildCharacterResolution(seed, i, library)),
    [seed, characterCount, library]
  );

  // ── 5. Report resolved traits / titles upward ────────────────────────────
  // Singular callbacks report the character currently being edited (kept for
  // backward compat with consumers that only care about "the" character).
  // Plural callbacks report the whole group, index-aligned to characterCount.
  useEffect(() => {
    if (onResolvedAllTraits) onResolvedAllTraits(allCharacters.map(c => c.traits));
    if (onResolvedAllTitles) onResolvedAllTitles(allCharacters.map(c => c.titles));

    const active = allCharacters[activeCharacterIndex] ?? allCharacters[0];
    if (active) {
      if (onResolvedTraits) onResolvedTraits(active.traits);
      if (onResolvedTitles) onResolvedTitles(active.titles);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCharacters, activeCharacterIndex]);

  // ── 6. Handlers ───────────────────────────────────────────────────────────

  const handleStandardChange = (
    cat: Exclude<TraitCategory, 'special'>,
    selectedBase36: string
  ) => {
    // Guard: don't encode an empty value (library not loaded yet)
    if (!selectedBase36) return;
    const newSeed = encodeSeed(seed, activeCharacterIndex, cat, selectedBase36);
    onSeedChange(newSeed);
  };

  const handleSpecialChange = (slotIndex: number, selectedBase36: string) => {
    let newSeed = seed;

    if (selectedBase36 === '') {
      // User picked NOT SELECTED → trim count down to this slot index
      newSeed = encodeSpecialCount(newSeed, activeCharacterIndex, slotIndex);
    } else {
      // Write the chosen variant into the slot
      newSeed = encodeSpecialSlot(newSeed, activeCharacterIndex, slotIndex, selectedBase36);
      // If this slot was inactive, bump the count to include it
      if (slotIndex >= numSpecialTraits) {
        newSeed = encodeSpecialCount(newSeed, activeCharacterIndex, slotIndex + 1);
      }
    }

    onSeedChange(newSeed);
  };

  // ── 7. Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="animate-pulse text-[10px] text-white/20">LOADING_GENOME...</div>;
  }

  const specialVariants = library['special'] ?? [];
  const specialOptions: DropdownOption[] = [
    { value: '', label: '00 — NONE_SELECTED' },
    ...variantsToOptions(specialVariants),
  ];

  const characterOptions: DropdownOption[] = Array.from({ length: characterCount }, (_, i) => ({
    value: i.toString(),
    label: `CHARACTER_${i + 1}`,
  }));

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-2 px-1">
        <Sliders size={12} className={disabled ? 'text-zinc-600' : 'text-accent'} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Trait Configuration</span>
      </div>

      {characterCount > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <TraitDropdown
            label="editing character"
            value={activeCharacterIndex.toString()}
            options={characterOptions}
            onChange={val => onActiveCharacterChange(parseInt(val, 10) || 0)}
            disabled={disabled}
            accent
          />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

        {[0, 1, 2].map(idx => (
          <TraitDropdown
            key={`spec-${idx}`}
            label={`SPECIAL_0${idx + 1}`}
            value={resolvedValues[`special_${idx}`] ?? ''}
            options={specialOptions}
            onChange={val => handleSpecialChange(idx, val)}
            disabled={disabled}
            accent
          />
        ))}
      </div>

    </div>
  );
}
