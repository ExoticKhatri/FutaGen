"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { GENERATOR_CONFIG } from '@/lib/config';
import { GeneratorState, MappedTraits, TraitTitles } from '@/types/data';

// Sub-components
import SeedEditor from './Controls/SeedEditor';
import CompositionSelector from './Controls/CompositionSelector';
import FrameSelector from './Controls/FrameSelector';
import ArtStyleSelector from './Controls/StyleSelector';
import TraitGrid from './Controls/TraitSelector';

interface ControlPanelProps {
  seedEditorRef?: React.MutableRefObject<{ triggerRandomize: () => void } | null>;
  disable?: boolean;
  onUpdate: (state: GeneratorState) => void;
}

export default function ControlPanel({
  seedEditorRef: externalRef,
  disable = false,
  onUpdate
}: ControlPanelProps) {
  const [seed, setSeed] = useState("");
  const [comp, setComp] = useState(GENERATOR_CONFIG.COMPOSITIONS[0].id);
  const [frame, setFrame] = useState(GENERATOR_CONFIG.FRAMES[0].id);
  const [style, setStyle] = useState(GENERATOR_CONFIG.ART_STYLES[0].id);

  /**
   * Resolved traits come UP from TraitGrid (after modulo resolution).
   * This is the single source of truth for the final character build.
   */
  const [resolvedTraits, setResolvedTraits] = useState<MappedTraits | null>(null);
  const [resolvedTitles, setResolvedTitles] = useState<TraitTitles | null>(null);

  const internalRef = useRef<{ triggerRandomize: () => void } | null>(null);
  const seedEditorRef = externalRef || internalRef;

  // Stable ref for onUpdate to avoid stale-closure issues in the effect below
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  // Fire onUpdate whenever any piece of state changes
  useEffect(() => {
    onUpdateRef.current({
      seed,
      composition: comp,
      frame,
      style,
      traits: resolvedTraits,
      traitTitles: resolvedTitles,
    });
  }, [seed, comp, frame, style, resolvedTraits, resolvedTitles]);

  /**
   * TraitGrid calls this when:
   *  a) The seed changes because of a dropdown pick  → newSeed differs from current seed
   *  b) The resolved traits change (modulo selection changed)
   *
   * We propagate newSeed back to setSeed so SeedEditor stays in sync.
   */
  const handleTraitSeedChange = useCallback((newSeed: string) => {
    setSeed(newSeed);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-10 pb-28">

        {/* SECTION 1: GLOBAL CONFIG */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/*
            SeedEditor is the canonical display of the seed string.
            It both displays and lets the user type a new seed.
            currentSeed is fed back in so that trait-dropdown changes
            (which update `seed` in ControlPanel) are reflected here.
          */}
          <SeedEditor
            ref={seedEditorRef}
            onSeedUpdate={setSeed}
            currentSeed={seed}
            disable={disable}
          />
          <CompositionSelector activeId={comp} setComp={setComp} disable={disable} />
        </div>

        {/* SECTION 2: RENDER SETTINGS (Stacked) */}
        <div className="space-y-8 w-full">
          <FrameSelector activeId={frame} setFrame={setFrame} disable={disable} />
          <ArtStyleSelector activeId={style} setStyle={setStyle} disable={disable} />
        </div>

        {/* SECTION 3: UNIFIED GENOME EDITOR */}
        {/*
          TraitGrid receives the current seed and resolves traits via modulo.
          When a dropdown changes it calls onSeedChange → handleTraitSeedChange
          which updates `seed` in ControlPanel → flows back into SeedEditor.
          It also reports the resolved traits up via onResolvedTraits.
        */}
        <TraitGrid
          seed={seed}
          onSeedChange={handleTraitSeedChange}
          onResolvedTraits={setResolvedTraits}
          onResolvedTitles={setResolvedTitles}
          disabled={disable}
        />

      </div>
    </div>
  );
}