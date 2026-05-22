/**
 * scripts/bulk-gen.ts
 * Generates and inserts new trait variants for all (or selected) categories.
 * Uses service role key — run outside Next.js, no cookies needed.
 *
 * Usage:
 *   bun scripts/bulk-gen.ts              # all 10 categories, 5 entries each
 *   bun scripts/bulk-gen.ts body horns   # only listed categories
 *   COUNT=8 bun scripts/bulk-gen.ts      # 8 entries per category
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// ── env ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const OPENAI_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_KEY) {
  console.error("❌ Missing env vars — make sure .env.local is loaded.");
  console.error("   Run: bun --env-file .env.local scripts/bulk-gen.ts");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// ── trait config ───────────────────────────────────────────────────────────
type TraitCategory =
  | "body" | "eyes" | "face" | "hair" | "horns"
  | "mood" | "outfit" | "pose" | "skin" | "special";

const ALL_CATEGORIES: TraitCategory[] = [
  "body", "eyes", "face", "hair", "horns",
  "mood", "outfit", "pose", "skin", "special",
];

const CATEGORY_PROMPTS: Record<TraitCategory, string> = {
  body: `Focus ONLY on anatomical structure — posture, musculoskeletal definition, height (cm), weight distribution. Include skin textures like subcutaneous veins or obsidian-like hardness. NO clothing, hair, or facial features.`,
  eyes: `Focus on ocular details — iris patterns (spiral, hex, shattered-glass), pupil shapes (slit, star, void), sclera colour, glow/ember effects, tear-duct markings.`,
  face: `Focus on facial structure — cheekbones, jaw geometry, lip symmetry, nose bridge, philtrum. Describe bone prominence and soft-tissue distribution. No hair or eyes.`,
  hair: `Focus on volume, colour, texture, flow dynamics, and how the hair physically interacts with or wraps around horns. Include root-to-tip colour gradients.`,
  horns: `Focus on cranial growths — material (bone, obsidian crystal, living metal), curvature type, symmetry/asymmetry, attachment point at the skull, surface micro-detail.`,
  mood: `Focus on the overall cinematic mood of the image — lighting palette, emotional atmosphere, colour temperature, shadow density, any environmental cues.`,
  outfit: `Focus ONLY on minimalist attire. Coverage 20–30% of body. NO footwear — always barefoot. Describe materials (leather, silk, liquid-metal, ethereal flame) and fit.`,
  pose: `Focus on cinematic positioning — center of gravity, weight distribution, limb geometry, body language, and facial expression that matches the stance.`,
  skin: `Focus on dermal properties — material feel (chrome, cracked obsidian, bioluminescent membrane), reflectivity, subsurface scattering, pigment patterns, tactile quality.`,
  special: `Focus on supernatural augmentations — wings (bat-like, skeletal, feathered), tails, arcane sigils, joint-horn protrusions, aura effects. Describe integration points with skin.`,
};

// ── helpers ────────────────────────────────────────────────────────────────
async function fetchExistingTitles(table: TraitCategory): Promise<string[]> {
  const { data, error } = await supabase
    .from(table)
    .select("title")
    .order("base10_map", { ascending: false });

  if (error) {
    console.warn(`  ⚠️  Could not fetch existing titles for [${table}]:`, error.message);
    return [];
  }
  return (data ?? []).map((r: any) => r.title);
}

async function getNextBase10(table: TraitCategory): Promise<number> {
  const { data } = await supabase
    .from(table)
    .select("base10_map")
    .order("base10_map", { ascending: false })
    .limit(1)
    .single();

  return data ? data.base10_map + 1 : 1;
}

async function generateEntries(
  table: TraitCategory,
  count: number,
  existingTitles: string[]
): Promise<{ title: string; description: string }[]> {
  const existingList = existingTitles.length ? existingTitles.join(", ") : "None";

  const systemPrompt = `
ROLE: You are a Lead Character Technical Artist specialising in supernatural character design.
CHARACTER ARCHETYPE: Demon Lady (Feminine, Supernatural, Ethereal, Dark, High-End).

TARGET: Generate ${count} unique, high-detail variants for the [${table.toUpperCase()}] trait table.

DIRECTIVES:
1. ${CATEGORY_PROMPTS[table]}
2. VARIETY: Each entry must be radically different from the others — if one is minimalist, the next should be ornate or extreme.
3. PRECISION: Use professional art direction language (anatomical grooves, specular highlights, silhouette readability).
4. NO DUPLICATES — do NOT use any of these existing titles: ${existingList}.

OUTPUT: Return a JSON object with key "traits" containing an array of objects.
Schema: { "title": string, "description": string }
Descriptions should be 2–4 sentences of dense visual detail.
  `.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate ${count} variants for [${table}].` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.85,
  });

  const raw = response.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw);
  const arr = Array.isArray(parsed)
    ? parsed
    : parsed.traits ?? parsed.data ?? Object.values(parsed)[0];

  if (!Array.isArray(arr)) throw new Error("AI returned unexpected shape");
  return arr as { title: string; description: string }[];
}

async function insertEntries(
  table: TraitCategory,
  entries: { title: string; description: string }[]
): Promise<number> {
  let nextBase10 = await getNextBase10(table);

  const payload = entries.map((e) => {
    const base36_map = nextBase10.toString(36).padStart(3, "0");
    const row = { base36_map, base10_map: nextBase10, title: e.title, description: e.description };
    nextBase10++;
    return row;
  });

  const { error } = await supabase.from(table).insert(payload);
  if (error) throw new Error(error.message);
  return payload.length;
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  const argCategories = process.argv.slice(2) as TraitCategory[];
  const categories =
    argCategories.length > 0
      ? argCategories.filter((c) => ALL_CATEGORIES.includes(c))
      : ALL_CATEGORIES;

  const count = parseInt(process.env.COUNT ?? "5");

  console.log(`\n🚀 Bulk trait generation — ${categories.length} categories × ${count} entries each\n`);

  let totalInserted = 0;

  for (const cat of categories) {
    process.stdout.write(`  [${cat}] fetching existing…`);
    const existingTitles = await fetchExistingTitles(cat);
    process.stdout.write(` (${existingTitles.length} exist) → generating ${count} new…`);

    try {
      const entries = await generateEntries(cat, count, existingTitles);
      const inserted = await insertEntries(cat, entries);
      totalInserted += inserted;
      console.log(` ✅ +${inserted} inserted`);
      entries.forEach((e) => console.log(`     • ${e.title}`));
    } catch (err: any) {
      console.log(` ❌ FAILED: ${err.message}`);
    }
  }

  console.log(`\n✨ Done — ${totalInserted} total rows inserted across ${categories.length} tables.\n`);
}

main();
