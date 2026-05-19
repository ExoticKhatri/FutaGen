"use client";

import { useState, useRef, useCallback } from 'react';
import ViewPanel from '@/components/ViewPanel';
import ControlPanel from '@/components/ControlPanel';
import Dock from '@/components/Dock';
import Library from '@/components/Library';
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
import { GENERATOR_CONFIG } from '@/lib/config';

const MAX_RETRIES = 4;

export default function Home() {
  const seedEditorRef = useRef<{ triggerRandomize: () => void } | null>(null);
  const [genState, setGenState]         = useState<GeneratorState>(INITIAL_GENERATOR_STATE);
  const [imageGenState, setImageGenState] = useState<ImageGenState>(INITIAL_IMAGE_GEN_STATE);
  const [screen, setScreen]             = useState<'create' | 'library'>('create');

  const randomSeedGen = () => seedEditorRef.current?.triggerRandomize();
  const isGenerating  = ['fetching_traits', 'generating_prompt', 'generating_image'].includes(imageGenState.status);

  const handleGenerate = useCallback(async () => {
    if (!genState.traits) return;

    // ── Step 1: Fetch trait descriptions ──────────────────────────────────
    setImageGenState({ status: 'fetching_traits', message: 'Fetching trait descriptions from database...', imageUrl: null, prompt: null, attempt: 0 });

    const descriptions: Record<string, string | string[]> = {};
    try {
      await Promise.all(
        TRAIT_CATEGORIES.map(async (category: TraitCategory) => {
          const val = genState.traits![category];
          if (category === 'special' && Array.isArray(val)) {
            const results = await Promise.all(
              val.map(async (v) => {
                const { data } = await fetchSpecificEntryColumn(category, 'description', v);
                return data as string;
              })
            );
            descriptions[category] = results.filter(Boolean);
          } else if (typeof val === 'string' && val) {
            const { data } = await fetchSpecificEntryColumn(category, 'description', val);
            descriptions[category] = (data as string) || '';
          }
        })
      );
    } catch {
      setImageGenState(s => ({ ...s, status: 'error', message: 'Failed to fetch trait descriptions.' }));
      return;
    }

    // ── Step 2: Generate master prompt ────────────────────────────────────
    setImageGenState(s => ({ ...s, status: 'generating_prompt', message: 'Assembling master prompt with AI...' }));

    const styleData = GENERATOR_CONFIG.ART_STYLES.find(s => s.id === genState.style);
    const compData  = GENERATOR_CONFIG.COMPOSITIONS.find(c => c.id === genState.composition);
    const frameData = GENERATOR_CONFIG.FRAMES.find(f => f.id === genState.frame);

    const promptResult = await generateMasterPrompt({
      composition:      compData?.label        || genState.composition,
      frame:            frameData?.ratio        || genState.frame,
      styleDescription: styleData?.description || genState.style,
      traits:           descriptions,
    });

    if (!promptResult.success || !promptResult.prompt) {
      setImageGenState(s => ({ ...s, status: 'error', message: 'AI prompt generation failed.' }));
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

      const result = await generateImage(prompt, genState.frame);

      if (result.success && result.imageUrl) {
        // Show image immediately, upload to Cloudinary in background
        setImageGenState({ status: 'done', message: 'Saving to library...', imageUrl: result.imageUrl, prompt, attempt });

        uploadToCloudinary({ imageDataUrl: result.imageUrl, prompt, seed: genState.seed })
          .then(up => {
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

  return (
    <main className="relative flex flex-col md:flex-row h-screen w-full bg-background text-foreground overflow-y-auto md:overflow-hidden">

      {screen === 'create' ? (
        <>
          <aside className="w-full md:w-[30%] p-2 h-screen bg-panel border-b md:border-b-0 md:border-r border-white/5 flex flex-col">
            <ViewPanel state={genState} imageGenState={imageGenState} />
          </aside>

          <section className="w-full md:w-[70%] h-full p-8 bg-background">
            <ControlPanel
              seedEditorRef={seedEditorRef}
              onUpdate={setGenState}
              disable={isGenerating}
            />
          </section>
        </>
      ) : (
        <div className="w-full h-screen">
          <Library />
        </div>
      )}

      <div className="fixed md:absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-max">
        <Dock
          onDiceClick={randomSeedGen}
          onGenerateClick={handleGenerate}
          onScreenChange={setScreen}
          screen={screen}
          generating={isGenerating}
        />
      </div>
    </main>
  );
}
