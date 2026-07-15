"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { GENERATOR_CONFIG } from '@/lib/config';
import { seedLengthForCount } from '@/lib/seedEngine';
import { resizeSeedForCharacterCount } from '@/utils/seedGen';
import { GeneratorState, MappedTraits, TraitTitles } from '@/types/data';

// Sub-components
import SeedEditor from './Controls/SeedEditor';
import CompositionSelector from './Controls/CompositionSelector';
import FrameSelector from './Controls/FrameSelector';
import ArtStyleSelector from './Controls/StyleSelector';
import BackgroundSelector from './Controls/BackgroundSelector';
import CharacterCountSelector from './Controls/CharacterCountSelector';
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
  const [seed, setSeed]           = useState("");
  const [comp, setComp]           = useState(GENERATOR_CONFIG.COMPOSITIONS[0].id);
  const [frame, setFrame]         = useState(GENERATOR_CONFIG.FRAMES[0].id);
  const [style, setStyle]         = useState(GENERATOR_CONFIG.ART_STYLES[0].id);
  const [background, setBackground] = useState(GENERATOR_CONFIG.BACKGROUNDS[0].id);
  const [characterCount, setCharacterCount] = useState(GENERATOR_CONFIG.SEED.MIN_CHARACTERS);
  const [activeCharacterIndex, setActiveCharacterIndex] = useState(0);

  const [resolvedTraits, setResolvedTraits] = useState<MappedTraits | null>(null);
  const [resolvedTitles, setResolvedTitles] = useState<TraitTitles | null>(null);
  const [charactersTraits, setCharactersTraits] = useState<MappedTraits[]>([]);
  const [charactersTraitTitles, setCharactersTraitTitles] = useState<TraitTitles[]>([]);

  const internalRef = useRef<{ triggerRandomize: () => void } | null>(null);
  const seedEditorRef = externalRef || internalRef;

  const loadDefaultSettings = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedComp = localStorage.getItem('default_composition');
      const savedFrame = localStorage.getItem('default_frame');
      const savedStyle = localStorage.getItem('default_style');
      const savedBg = localStorage.getItem('default_background');

      if (savedComp) setComp(savedComp);
      if (savedFrame) setFrame(savedFrame);
      if (savedStyle) setStyle(savedStyle);
      if (savedBg) setBackground(savedBg);
    }
  }, []);

  useEffect(() => {
    loadDefaultSettings();
    window.addEventListener('local-settings-updated', loadDefaultSettings);
    return () => {
      window.removeEventListener('local-settings-updated', loadDefaultSettings);
    };
  }, [loadDefaultSettings]);

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
      background,
      characterCount,
      traits: resolvedTraits,
      traitTitles: resolvedTitles,
      charactersTraits,
      charactersTraitTitles,
    });
  }, [seed, comp, frame, style, background, characterCount, resolvedTraits, resolvedTitles, charactersTraits, charactersTraitTitles]);

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

  /**
   * Changing the character count resizes the seed to match
   * (characterCount * UNIT_LENGTH) — extending appends fresh random traits
   * for the new character(s), shrinking truncates trailing ones. Also clamps
   * the active-character tab so it never points past the new count.
   */
  const handleCharacterCountChange = useCallback((newCount: number) => {
    setCharacterCount(newCount);
    setSeed(prev => resizeSeedForCharacterCount(prev, newCount));
    setActiveCharacterIndex(prev => Math.min(prev, newCount - 1));
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
            maxLength={seedLengthForCount(characterCount)}
            characterCount={characterCount}
            disable={disable}
          />
          <CompositionSelector activeId={comp} setComp={setComp} disable={disable} />
        </div>

        {/* SECTION 2: RENDER SETTINGS (Stacked) */}
        <div className="space-y-8 w-full">
          <FrameSelector activeId={frame} setFrame={setFrame} disable={disable} />
          <BackgroundSelector activeId={background} setBackground={setBackground} disable={disable} />
          <ArtStyleSelector activeId={style} setStyle={setStyle} disable={disable} />
          <CharacterCountSelector count={characterCount} setCount={handleCharacterCountChange} disable={disable} />
        </div>

        {/* SECTION 3: UNIFIED GENOME EDITOR */}
        {/*
          TraitGrid receives the current seed and resolves traits via modulo.
          When a dropdown changes it calls onSeedChange → handleTraitSeedChange
          which updates `seed` in ControlPanel → flows back into SeedEditor.
          It also reports the resolved traits up via onResolvedTraits, both for
          the character currently being edited and for the whole group.
        */}
        <TraitGrid
          seed={seed}
          onSeedChange={handleTraitSeedChange}
          characterCount={characterCount}
          activeCharacterIndex={activeCharacterIndex}
          onActiveCharacterChange={setActiveCharacterIndex}
          onResolvedTraits={setResolvedTraits}
          onResolvedTitles={setResolvedTitles}
          onResolvedAllTraits={setCharactersTraits}
          onResolvedAllTitles={setCharactersTraitTitles}
          disabled={disable}
        />

      </div>
    </div>
  );
}
