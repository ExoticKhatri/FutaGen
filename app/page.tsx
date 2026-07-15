"use client";

import { useState, useRef, useCallback } from 'react';
import ViewPanel from '@/components/ViewPanel';
import ControlPanel from '@/components/ControlPanel';
import Dock from '@/components/Dock';
import Library from '@/components/Library';
import SettingsModal from '@/components/SettingsModal';
import {
  GeneratorState,
  INITIAL_GENERATOR_STATE,
  ImageGenState,
  INITIAL_IMAGE_GEN_STATE,
  MappedTraits,
  TraitTitles,
} from '@/types/data';
import { TraitCategory, TRAIT_CATEGORIES } from '@/types/traits';
import { fetchSpecificEntryColumn } from '@/actions/db_fetch';
import { buildCharacterPrompt, applyArtStyle, sanitizePrompt } from '@/actions/ai/promptGen';
import { generateImage } from '@/actions/ai/imageGen';
import { uploadToCloudinary } from '@/actions/cloudinary';
import { GENERATOR_CONFIG, FEATURE_FLAGS } from '@/lib/config';


export default function Home() {
  const seedEditorRef = useRef<{ triggerRandomize: () => void } | null>(null);
  const [genState, setGenState]           = useState<GeneratorState>(INITIAL_GENERATOR_STATE);
  const [imageGenState, setImageGenState] = useState<ImageGenState>(INITIAL_IMAGE_GEN_STATE);
  const [screen, setScreen]               = useState<'create' | 'library'>('create');
  const [settingsOpen, setSettingsOpen]   = useState(false);

  const randomSeedGen = () => seedEditorRef.current?.triggerRandomize();
  const isGenerating  = ['fetching_traits', 'generating_prompt', 'generating_image'].includes(imageGenState.status);

  // Resolves one character's traits into the category → description map the
  // prompt pipeline expects. Descriptions are fetched from Supabase when
  // USE_TRAIT_DESCRIPTIONS is on; otherwise falls back to titles directly.
  const buildTraitDataForCharacter = useCallback(async (
    traits: MappedTraits | undefined,
    titles: TraitTitles | undefined,
  ): Promise<Record<string, string | string[]>> => {
    const traitData: Record<string, string | string[]> = {};

    if (FEATURE_FLAGS.USE_TRAIT_DESCRIPTIONS) {
      await Promise.all(
        TRAIT_CATEGORIES.map(async (category: TraitCategory) => {
          const val = traits?.[category];

          if (category === 'special' && Array.isArray(val)) {
            const specialTitles = Array.isArray(titles?.special) ? titles.special : [];
            const results = await Promise.all(
              val.map(async (v, i) => {
                const { data } = await fetchSpecificEntryColumn(category, 'description', v);
                return (data as string | null) || specialTitles[i] || '';
              })
            );
            traitData[category] = results.filter(Boolean);
          } else if (typeof val === 'string' && val) {
            const { data } = await fetchSpecificEntryColumn(category, 'description', val);
            const titleFallback = typeof titles?.[category] === 'string' ? titles[category] as string : '';
            traitData[category] = (data as string | null) || titleFallback;
          }
        })
      );
    } else {
      TRAIT_CATEGORIES.forEach((category: TraitCategory) => {
        const t = titles?.[category];
        if (t) traitData[category] = t;
      });
    }

    return traitData;
  }, []);

  // Resolves every character currently in the group, index-aligned.
  const buildCharactersTraitData = useCallback((): Promise<Array<Record<string, string | string[]>>> => {
    const perCharacterTraits = genState.charactersTraits.length
      ? genState.charactersTraits
      : (genState.traits ? [genState.traits] : []);
    const perCharacterTitles = genState.charactersTraitTitles.length
      ? genState.charactersTraitTitles
      : (genState.traitTitles ? [genState.traitTitles] : []);

    return Promise.all(
      perCharacterTraits.map((traits, i) => buildTraitDataForCharacter(traits, perCharacterTitles[i]))
    );
  }, [genState.charactersTraits, genState.charactersTraitTitles, genState.traits, genState.traitTitles, buildTraitDataForCharacter]);

  // Runs all 3 prompt-generation stages with live status updates.
  // Returns the final prompt string, or null if any stage failed.
  const runPromptPipeline = useCallback(async (
    characters: Array<Record<string, string | string[]>>,
  ): Promise<{ prompt: string; rawInput: string } | null> => {
    const compData  = GENERATOR_CONFIG.COMPOSITIONS.find(c => c.id === genState.composition);
    const frameData = GENERATOR_CONFIG.FRAMES.find(f => f.id === genState.frame);
    const bgData    = GENERATOR_CONFIG.BACKGROUNDS.find(b => b.id === genState.background);
    const customApiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') || undefined : undefined;
    const isWhiteBg = !genState.background || genState.background === 'plain_white';

    // Stage 1 — Build character description(s)
    setImageGenState(s => ({ ...s, message: 'Stage 1 / 3 — Building character description...' }));
    const s1 = await buildCharacterPrompt({
      composition:    compData?.label       || genState.composition,
      frame:          frameData?.ratio      || genState.frame,
      backgroundDesc: bgData?.description   || genState.background,
      characters,
    }, customApiKey);
    if (!s1.success || !s1.prompt) {
      setImageGenState(s => ({ ...s, status: 'error', message: s1.error || 'Stage 1 failed.' }));
      return null;
    }

    // Stage 2 — Apply art style
    setImageGenState(s => ({ ...s, message: 'Stage 2 / 3 — Applying art style...' }));
    const s2 = await applyArtStyle({
      draft:          s1.prompt,
      styleId:        genState.style,
      isWhiteBg,
      characterCount: characters.length,
    }, customApiKey);
    if (!s2.success || !s2.prompt) {
      setImageGenState(s => ({ ...s, status: 'error', message: s2.error || 'Stage 2 failed.' }));
      return null;
    }

    // Stage 3 — Safety check
    setImageGenState(s => ({ ...s, message: 'Stage 3 / 3 — Safety check...' }));
    const s3 = await sanitizePrompt({ draft: s2.prompt }, customApiKey);
    if (!s3.success || !s3.prompt) {
      setImageGenState(s => ({ ...s, status: 'error', message: s3.error || 'Stage 3 failed.' }));
      return null;
    }

    return { prompt: s3.prompt, rawInput: s1.rawInput ?? '' };
  }, [genState]);

  const handleGenerate = useCallback(async () => {
    if (genState.charactersTraits.length === 0 && !genState.traits) return;

    if (FEATURE_FLAGS.USE_TRAIT_DESCRIPTIONS) {
      setImageGenState({ status: 'fetching_traits', message: 'Fetching trait descriptions from database...', imageUrl: null, prompt: null, rawInput: null, attempt: 0, slots: [] });
    }

    let characters: Array<Record<string, string | string[]>>;
    try {
      characters = await buildCharactersTraitData();
    } catch {
      setImageGenState(s => ({ ...s, status: 'error', message: 'Failed to fetch trait descriptions.' }));
      return;
    }

    // ── Step 2: Generate master prompt (3 stages) ────────────────────────
    setImageGenState({ status: 'generating_prompt', message: 'Stage 1 / 3 — Building character description...', imageUrl: null, prompt: null, rawInput: null, attempt: 0, slots: [] });

    const customApiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') || undefined : undefined;
    const pipelineResult = await runPromptPipeline(characters);
    if (!pipelineResult) return;

    const prompt = pipelineResult.prompt;

    // ── Step 3: Generate images in parallel ──────────────────────────────
    const SLOT_COUNT = Math.min(5, Math.max(1, parseInt(localStorage.getItem('image_count') || '4')));
    setImageGenState(s => ({
      ...s,
      status: 'generating_image',
      message: `Generating ${SLOT_COUNT} images in parallel...`,
      prompt,
      attempt: 0,
      slots: Array.from({ length: SLOT_COUNT }, () => ({
        status: 'running' as const,
        imageUrl: null,
        error: null,
      })),
    }));

    const slotResults: Array<{ success: boolean; imageUrl?: string; error?: string }> = new Array(SLOT_COUNT);

    const generationPromises = Array.from({ length: SLOT_COUNT }, (_, i) =>
      generateImage(prompt, genState.frame, customApiKey).then(result => {
        slotResults[i] = result;
        setImageGenState(s => ({
          ...s,
          slots: s.slots.map((slot, idx) =>
            idx !== i ? slot
              : result.success && result.imageUrl
                ? { status: 'done' as const, imageUrl: result.imageUrl, error: null }
                : { status: 'error' as const, imageUrl: null, error: result.error ?? 'Unknown error' }
          ),
        }));
        return result;
      })
    );

    await Promise.allSettled(generationPromises);

    const successUrls = slotResults
      .filter(r => r?.success && r.imageUrl)
      .map(r => r.imageUrl!);

    if (successUrls.length === 0) {
      setImageGenState(s => ({ ...s, status: 'error', message: `All ${SLOT_COUNT} generations failed.` }));
      return;
    }

    setImageGenState(s => ({
      ...s,
      status: 'done',
      imageUrl: successUrls[0],
      message: `${successUrls.length} / ${SLOT_COUNT} generated. Saving to library...`,
    }));

    const traitTitles = genState.traitTitles
      ? Object.entries(genState.traitTitles)
          .map(([k, v]) => `${k}:${Array.isArray(v) ? v.join('+') : v}`)
          .join(', ')
      : '';

    Promise.all(
      successUrls.map(imageUrl =>
        uploadToCloudinary({
          imageDataUrl: imageUrl,
          prompt,
          seed:         genState.seed,
          ratio:        genState.frame,
          composition:  genState.composition,
          style:        genState.style,
          traitTitles,
        })
      )
    ).then(uploads => {
      const failCount = uploads.filter(u => !u.success).length;
      setImageGenState(s => ({
        ...s,
        message: failCount === 0
          ? `${successUrls.length} / ${SLOT_COUNT} generated. Saved to library.`
          : `${successUrls.length} / ${SLOT_COUNT} generated. ${failCount} save(s) failed.`,
      }));
    });
  }, [genState, buildCharactersTraitData, runPromptPipeline]);

  const handlePromptOnly = useCallback(async () => {
    if (genState.charactersTraits.length === 0 && !genState.traits) return;

    if (FEATURE_FLAGS.USE_TRAIT_DESCRIPTIONS) {
      setImageGenState({ status: 'fetching_traits', message: 'Fetching trait descriptions from database...', imageUrl: null, prompt: null, rawInput: null, attempt: 0, slots: [] });
    }

    let characters: Array<Record<string, string | string[]>>;
    try {
      characters = await buildCharactersTraitData();
    } catch {
      setImageGenState(s => ({ ...s, status: 'error', message: 'Failed to fetch trait descriptions.' }));
      return;
    }

    setImageGenState({ status: 'generating_prompt', message: 'Stage 1 / 3 — Building character description...', imageUrl: null, prompt: null, rawInput: null, attempt: 0, slots: [] });

    const pipelineResult = await runPromptPipeline(characters);
    if (!pipelineResult) return;

    setImageGenState({ status: 'prompt_done', message: 'Prompt assembled. View it in the Prompt tab.', imageUrl: null, prompt: pipelineResult.prompt, rawInput: null, attempt: 0, slots: [] });
  }, [genState, buildCharactersTraitData, runPromptPipeline]);

  return (
    <main className="relative flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">

      {screen === 'create' ? (
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
          {/* Preview panel — occupies full screen height on mobile, side panel on desktop */}
          <aside className="
            w-full shrink-0 h-dvh
            md:w-[30%] md:h-full md:border-r border-white/5 bg-panel border-b md:border-b-0
          ">
            <div className="h-full overflow-hidden p-2">
              <ViewPanel state={genState} imageGenState={imageGenState} />
            </div>
          </aside>

          {/* Controls panel — positioned below preview on mobile, side panel on desktop */}
          <section className="
            w-full shrink-0 md:shrink md:w-[70%] md:h-full md:overflow-y-auto
            bg-background p-4 md:p-8
          ">
            <ControlPanel
              seedEditorRef={seedEditorRef}
              onUpdate={setGenState}
              disable={isGenerating}
            />
          </section>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Library />
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-max">
        <Dock
          onDiceClick={randomSeedGen}
          onGenerateClick={handleGenerate}
          onPromptOnlyClick={handlePromptOnly}
          onSettingsClick={() => setSettingsOpen(true)}
          onScreenChange={setScreen}
          screen={screen}
          generating={isGenerating}
        />
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}
