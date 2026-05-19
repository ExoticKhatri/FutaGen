# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

FutaGen is an AI-powered demon lady character generator. Users configure a 64-character base36 seed that encodes all character traits, pick composition/frame/art style settings, and the app assembles a final prompt for image generation via GPT-4o.

## Commands

```bash
bun run dev       # Start dev server
bun run build     # Production build
bun run lint      # ESLint

# Scripts (run directly with Bun, not next)
bun scripts/seedData.ts              # Seed Supabase tables with hardcoded test data
bun scripts/gen.ts <table> <count>   # AI-generate trait entries via GPT-4o
# e.g. bun scripts/gen.ts body 5
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — only needed for scripts (bypasses RLS)
- `OPENAI_API_KEY` — GPT-4o for trait generation and master prompt generation

Cloudinary is planned but not connected yet.

## Architecture

### The Seed System

The core mechanic is a **64-character base36 seed** that deterministically encodes every trait. `lib/seedEngine.ts` provides all encode/decode functions; `lib/config.ts` defines the `TRAIT_MAP` (which byte offsets map to which trait). The seed is the single source of truth — changing a trait dropdown writes back into the seed, and the seed drives all resolved trait lookups.

Special traits work differently: offset 18 holds a count (0–3), and offsets 19–23 hold up to three special trait slots.

### Supabase Schema

Each trait category is its own table: `body`, `eyes`, `face`, `hair`, `horns`, `mood`, `outfit`, `pose`, `skin`, `special`. Every row has `id`, `base36_map` (2-char key), `base10_map` (decimal equivalent), `title`, and `description`. Trait lookup uses `base36_map` as the lookup key. Tables are ordered by `base10_map` ascending.

### Trait Categories (`types/traits.ts`)

`TraitCategory` union type covers all 10 tables. `TraitVariant` is the row shape. `CharacterBuild` is `Record<TraitCategory, TraitVariant>`.

### Data Flow (Main Generator — `/`)

```
page.tsx
  └─ ControlPanel (right 70%)
       ├─ SeedEditor        — displays/edits the raw seed string; exposes triggerRandomize via ref
       ├─ CompositionSelector, FrameSelector, StyleSelector — config pickers
       └─ TraitGrid (TraitSelector) — fetches variants from Supabase, resolves seed segments
            via resolveTraitIndex(), calls onSeedChange when dropdown changes
  └─ ViewPanel (left 30%)
       ├─ View tab  — silhouette placeholder
       ├─ Logs tab  — raw GeneratorState dump
       ├─ System tab — trait resolver output
       └─ Final tab — assembled prompt preview
  └─ Dock — floating bar with dice (randomize) button
```

`ControlPanel` owns `GeneratorState` and propagates it up to `page.tsx` → down into `ViewPanel` on every change.

### Server Actions (`/actions`)

- `db_fetch.ts` — read from Supabase trait tables
- `db_insert.ts`, `db_update.ts`, `db_delet.ts` — CRUD operations
- `ai/entryGen.ts` — GPT-4o generates new trait variants for a given table, saves JSON audit file to `data/generated/`
- `ai/promptGen.ts` — GPT-4o assembles a 700-word image generation prompt from a `CharacterBuild`

All actions use `"use server"` and the server-side Supabase client from `lib/supabase/server.ts`.

### AI Prompting (`utils/prompt.ts`)

`TRAIT_SPECIFIC_PROMPTS` defines per-category isolation rules (e.g., outfit must cover 20–30% of body, no footwear). `getSystemPrompt()` assembles the full system instruction injected into GPT-4o when generating trait entries.

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Main character generator UI |
| `/lab` | Admin view of trait tables — browse, insert, edit entries. Table selected via `?table=body`, upload modal via `?action=insert` |
| `/bbg` | Raw Supabase table editor |
| `/test2` | Scratch/test page |