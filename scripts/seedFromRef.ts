/**
 * Replaces trait table data in Supabase with the curated ref/ data.
 *
 * Rules:
 *   - Row 000 (base10=0) is KEPT as-is (AI Select placeholder).
 *   - Row 001 (base10=1) gets the ref["99"] value (last entry moved to slot 1).
 *   - Rows 002-099 (base10=2-99) get ref["01"] through ref["98"] in order.
 *   - Rows with missing ref keys are skipped (gaps are fine for the modulo system).
 *   - description is null when the ref entry has no description object.
 *
 * Tables updated: body, outfit (cloth), face, hair, horns (horn), pose, skin, special
 * Tables NOT touched: eyes, mood (no ref data)
 *
 * Usage: bun scripts/seedFromRef.ts
 */

import { createClient } from "@supabase/supabase-js";
import type { TraitValue } from "@/types/trait";

import { bodyTraits }    from "@/ref/body";
import { clothTraits }   from "@/ref/cloth";
import { faceTraits }    from "@/ref/face";
import { hairTraits }    from "@/ref/hair";
import { hornTraits }    from "@/ref/horn";
import { poseTraits }    from "@/ref/pose";
import { skinTraits }    from "@/ref/skin";
import { specialTraits } from "@/ref/special";

// ── Supabase client ───────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Helpers ───────────────────────────────────────────────────────────────────

function toBase36(n: number): string {
  return n.toString(36).toUpperCase().padStart(3, "0");
}

function title(v: TraitValue): string {
  return typeof v === "string" ? v : v.name;
}

function description(v: TraitValue): string | null {
  return typeof v === "string" ? null : v.description;
}

type Row = {
  base10_map: number;
  base36_map: string;
  title: string;
  description: string | null;
};

function buildRows(data: Record<string, TraitValue>): Row[] {
  const rows: Row[] = [];

  // Slot 1 (001) ← ref["99"]
  const last = data["99"];
  if (last !== undefined) {
    rows.push({ base10_map: 1, base36_map: "001", title: title(last), description: description(last) });
  }

  // Slots 2-99 ← ref["01"] through ref["98"]
  for (let i = 1; i <= 98; i++) {
    const key = i.toString().padStart(2, "0");
    const val = data[key];
    if (val === undefined) continue; // gap — key missing in this ref file

    const slot = i + 1; // ref["01"] → slot 2, ref["02"] → slot 3, …
    rows.push({
      base10_map: slot,
      base36_map: toBase36(slot),
      title:       title(val),
      description: description(val),
    });
  }

  return rows;
}

// ── Table → ref data map ──────────────────────────────────────────────────────

const TABLE_DATA: Record<string, Record<string, TraitValue>> = {
  body:    bodyTraits,
  outfit:  clothTraits,
  face:    faceTraits,
  hair:    hairTraits,
  horns:   hornTraits,
  pose:    poseTraits,
  skin:    skinTraits,
  special: specialTraits,
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Seeding tables from ref/ data...\n");

  for (const [table, refData] of Object.entries(TABLE_DATA)) {
    console.log(`⏳ [${table}]`);

    const rows = buildRows(refData);
    if (rows.length === 0) {
      console.log(`   ⚠️  No rows built — skipping.\n`);
      continue;
    }

    // Delete all rows except the placeholder (base10_map = 0)
    const { error: delErr } = await supabase
      .from(table)
      .delete()
      .gt("base10_map", 0);

    if (delErr) {
      console.error(`   ❌ Delete failed: ${delErr.message}\n`);
      continue;
    }
    console.log(`   🗑️  Deleted existing rows.`);

    // Insert in batches of 50 to stay under Supabase limits
    const BATCH = 50;
    let inserted = 0;
    for (let start = 0; start < rows.length; start += BATCH) {
      const batch = rows.slice(start, start + BATCH);
      const { error: insErr } = await supabase.from(table).insert(batch);
      if (insErr) {
        console.error(`   ❌ Insert batch ${start}-${start + batch.length} failed: ${insErr.message}`);
      } else {
        inserted += batch.length;
      }
    }

    console.log(`   ✅ Inserted ${inserted} / ${rows.length} rows.\n`);
  }

  console.log("🎉 Done. View results at /bbg");
}

main().catch(console.error);
