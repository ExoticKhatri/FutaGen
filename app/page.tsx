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
import { generateMasterPrompt } from '@/actions/ai/promptGen';
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

    // ── Step 2: Generate master prompt ────────────────────────────────────
    setImageGenState({ status: 'generating_prompt', message: 'Assembling master prompt with AI...', imageUrl: null, prompt: null, rawInput: null, attempt: 0 });

    const styleData = GENERATOR_CONFIG.ART_STYLES.find(s => s.id === genState.style);
    const compData  = GENERATOR_CONFIG.COMPOSITIONS.find(c => c.id === genState.composition);
    const frameData = GENERATOR_CONFIG.FRAMES.find(f => f.id === genState.frame);
    const bgData    = GENERATOR_CONFIG.BACKGROUNDS.find(b => b.id === genState.background);

    const customApiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') || undefined : undefined;

    const promptResult = await generateMasterPrompt({
      composition:      compData?.label        || genState.composition,
      frame:            frameData?.ratio        || genState.frame,
      styleId:          genState.style,
      styleDescription: styleData?.description || genState.style,
      backgroundDesc:   bgData?.description    || genState.background,
      backgroundId:     genState.background,
      traits:           traitData,
    }, customApiKey);

    if (!promptResult.success || !promptResult.prompt) {
      setImageGenState(s => ({ ...s, status: 'error', message: promptResult.error || 'AI prompt generation failed.', rawInput: promptResult.rawInput ?? null }));
      return;
    }

    const prompt = promptResult.prompt;

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

    setImageGenState({ status: 'generating_prompt', message: 'Assembling master prompt with AI...', imageUrl: null, prompt: null, rawInput: null, attempt: 0 });

    const styleData = GENERATOR_CONFIG.ART_STYLES.find(s => s.id === genState.style);
    const compData  = GENERATOR_CONFIG.COMPOSITIONS.find(c => c.id === genState.composition);
    const frameData = GENERATOR_CONFIG.FRAMES.find(f => f.id === genState.frame);
    const bgData    = GENERATOR_CONFIG.BACKGROUNDS.find(b => b.id === genState.background);
    const customApiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') || undefined : undefined;

    const promptResult = await generateMasterPrompt({
      composition:      compData?.label        || genState.composition,
      frame:            frameData?.ratio        || genState.frame,
      styleId:          genState.style,
      styleDescription: styleData?.description || genState.style,
      backgroundDesc:   bgData?.description    || genState.background,
      backgroundId:     genState.background,
      traits:           traitData,
    }, customApiKey);

    if (!promptResult.success || !promptResult.prompt) {
      setImageGenState(s => ({ ...s, status: 'error', message: promptResult.error || 'AI prompt generation failed.', rawInput: promptResult.rawInput ?? null }));
      return;
    }

    setImageGenState({ status: 'prompt_done', message: 'Prompt assembled. View it in the Prompt tab.', imageUrl: null, prompt: promptResult.prompt, rawInput: null, attempt: 0 });
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
