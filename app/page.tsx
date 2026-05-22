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
} from '@/types/data';
import { TraitCategory, TRAIT_CATEGORIES } from '@/types/traits';
import { fetchSpecificEntryColumn } from '@/actions/db_fetch';
import { buildCharacterPrompt, applyArtStyle, sanitizePrompt } from '@/actions/ai/promptGen';
import { generateImage } from '@/actions/ai/imageGen';
import { uploadToCloudinary } from '@/actions/cloudinary';
import { GENERATOR_CONFIG, FEATURE_FLAGS } from '@/lib/config';

const MAX_RETRIES = 4;

export default function Home() {
  const seedEditorRef = useRef<{ triggerRandomize: () => void } | null>(null);
  const [genState, setGenState]           = useState<GeneratorState>(INITIAL_GENERATOR_STATE);
  const [imageGenState, setImageGenState] = useState<ImageGenState>(INITIAL_IMAGE_GEN_STATE);
  const [screen, setScreen]               = useState<'create' | 'library'>('create');
  const [settingsOpen, setSettingsOpen]   = useState(false);

  const randomSeedGen = () => seedEditorRef.current?.triggerRandomize();
  const isGenerating  = ['fetching_traits', 'generating_prompt', 'generating_image'].includes(imageGenState.status);

  // Runs all 3 prompt-generation stages with live status updates.
  // Returns the final prompt string, or null if any stage failed.
  const runPromptPipeline = useCallback(async (
    traitData: Record<string, string | string[]>,
  ): Promise<{ prompt: string; rawInput: string } | null> => {
    const compData  = GENERATOR_CONFIG.COMPOSITIONS.find(c => c.id === genState.composition);
    const frameData = GENERATOR_CONFIG.FRAMES.find(f => f.id === genState.frame);
    const bgData    = GENERATOR_CONFIG.BACKGROUNDS.find(b => b.id === genState.background);
    const customApiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') || undefined : undefined;
    const isWhiteBg = !genState.background || genState.background === 'plain_white';

    // Stage 1 — Build character description
    setImageGenState(s => ({ ...s, message: 'Stage 1 / 3 — Building character description...' }));
    const s1 = await buildCharacterPrompt({
      composition:    compData?.label       || genState.composition,
      frame:          frameData?.ratio      || genState.frame,
      backgroundDesc: bgData?.description   || genState.background,
      traits:         traitData,
    }, customApiKey);
    if (!s1.success || !s1.prompt) {
      setImageGenState(s => ({ ...s, status: 'error', message: s1.error || 'Stage 1 failed.' }));
      return null;
    }

    // Stage 2 — Apply art style
    setImageGenState(s => ({ ...s, message: 'Stage 2 / 3 — Applying art style...' }));
    const s2 = await applyArtStyle({
      draft:     s1.prompt,
      styleId:   genState.style,
      isWhiteBg,
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
    if (!genState.traits) return;

    const traitData: Record<string, string | string[]> = {};

    if (FEATURE_FLAGS.USE_TRAIT_DESCRIPTIONS) {
      // ── Step 1 (optional): Fetch trait descriptions from Supabase ─────────
      setImageGenState({ status: 'fetching_traits', message: 'Fetching trait descriptions from database...', imageUrl: null, prompt: null, rawInput: null, attempt: 0 });

      try {
        await Promise.all(
          TRAIT_CATEGORIES.map(async (category: TraitCategory) => {
            const val    = genState.traits![category];
            const titles = genState.traitTitles;

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
      } catch {
        setImageGenState(s => ({ ...s, status: 'error', message: 'Failed to fetch trait descriptions.' }));
        return;
      }
    } else {
      // Use trait titles directly — no DB round-trip needed
      const titles = genState.traitTitles ?? {};
      TRAIT_CATEGORIES.forEach((category: TraitCategory) => {
        const t = titles[category];
        if (t) traitData[category] = t;
      });
    }

    // ── Step 2: Generate master prompt (3 stages) ────────────────────────
    setImageGenState({ status: 'generating_prompt', message: 'Stage 1 / 3 — Building character description...', imageUrl: null, prompt: null, rawInput: null, attempt: 0 });

    const customApiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') || undefined : undefined;
    const pipelineResult = await runPromptPipeline(traitData);
    if (!pipelineResult) return;

    const prompt = pipelineResult.prompt;

    // ── Step 3: Generate image with up to MAX_RETRIES attempts ────────────
    setImageGenState(s => ({ ...s, status: 'generating_image', message: `Generating image — attempt 1 / ${MAX_RETRIES}...`, prompt, attempt: 1 }));

    let lastError = '';
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 1) {
        setImageGenState(s => ({ ...s, message: `Retrying — attempt ${attempt} / ${MAX_RETRIES}...`, attempt }));
      }

      const result = await generateImage(prompt, genState.frame, customApiKey);

      if (result.success && result.imageUrl) {
        setImageGenState({ status: 'done', message: 'Saving to library...', imageUrl: result.imageUrl, prompt, rawInput: null, attempt });

        const traitTitles = genState.traitTitles
          ? Object.entries(genState.traitTitles)
              .map(([k, v]) => `${k}:${Array.isArray(v) ? v.join('+') : v}`)
              .join(', ')
          : '';

        uploadToCloudinary({
          imageDataUrl: result.imageUrl,
          prompt,
          seed:         genState.seed,
          ratio:        genState.frame,
          composition:  genState.composition,
          style:        genState.style,
          traitTitles,
        }).then(up => {
          setImageGenState(s => ({
            ...s,
            message: up.success ? 'Saved to library.' : `Ready (save failed: ${up.error})`,
          }));
        });

        return;
      }

      lastError = result.error || 'Unknown error';
    }

    setImageGenState(s => ({ ...s, status: 'error', message: `Failed after ${MAX_RETRIES} attempts. ${lastError}` }));
  }, [genState]);

  const handlePromptOnly = useCallback(async () => {
    if (!genState.traits) return;

    const traitData: Record<string, string | string[]> = {};

    if (FEATURE_FLAGS.USE_TRAIT_DESCRIPTIONS) {
      setImageGenState({ status: 'fetching_traits', message: 'Fetching trait descriptions from database...', imageUrl: null, prompt: null, rawInput: null, attempt: 0 });
      try {
        await Promise.all(
          TRAIT_CATEGORIES.map(async (category: TraitCategory) => {
            const val    = genState.traits![category];
            const titles = genState.traitTitles;
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
      } catch {
        setImageGenState(s => ({ ...s, status: 'error', message: 'Failed to fetch trait descriptions.' }));
        return;
      }
    } else {
      const titles = genState.traitTitles ?? {};
      TRAIT_CATEGORIES.forEach((category: TraitCategory) => {
        const t = titles[category];
        if (t) traitData[category] = t;
      });
    }

    setImageGenState({ status: 'generating_prompt', message: 'Stage 1 / 3 — Building character description...', imageUrl: null, prompt: null, rawInput: null, attempt: 0 });

    const pipelineResult = await runPromptPipeline(traitData);
    if (!pipelineResult) return;

    setImageGenState({ status: 'prompt_done', message: 'Prompt assembled. View it in the Prompt tab.', imageUrl: null, prompt: pipelineResult.prompt, rawInput: null, attempt: 0 });
  }, [genState]);

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
