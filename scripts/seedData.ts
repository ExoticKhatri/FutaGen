import { createClient } from "@supabase/supabase-js";

// Bun automatically loads environment variables from .env and .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the service role key if you have Row Level Security (RLS) enabled and need to bypass it.
// Otherwise, the anon key will work if your table policies allow anonymous inserts.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key in environment variables.");
  console.error("Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set in your .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Utility to convert the 3-character base36 string to a base10 number
const segmentToBase10 = (segment: string): number => parseInt(segment, 36);

type TraitInput = {
  base36_map: string; // Exactly 3 characters, e.g., "001", "0af", "zzz"
  title: string;
  description: string;
};

// ============================================================================
// 🛠️ YOUR DATA GOES HERE
// Add the entries you want to create in your database below.
// You only need to define `base36_map`, `title`, and `description`.
// The script will automatically calculate the `base10_map` for you!
// ============================================================================
const dataToInsert: Record<string, TraitInput[]> = {
  body: [
    { base36_map: "001", title: "Slim Athletic", description: "A lean and athletic build with toned muscles." },
    { base36_map: "002", title: "Curvy", description: "Soft, voluptuous curves with wider hips." },
  ],
  eyes: [
    { base36_map: "001", title: "Crimson Red", description: "Deep, glowing red eyes that pierce the soul." },
  ],
  face: [
    { base36_map: "001", title: "Sharp Features", description: "High cheekbones and a sharp jawline." },
  ],
  hair: [
    { base36_map: "001", title: "Long Straight Obsidian", description: "Silky black hair that flows down to the waist." },
  ],
  horns: [
    { base36_map: "001", title: "Curved Ram Horns", description: "Thick, spiraling horns resembling those of a mountain ram." },
  ],
  mood: [
    { base36_map: "001", title: "Playful", description: "A gentle smirk and relaxed posture." },
  ],
  outfit: [
    { base36_map: "001", title: "Casual Wear", description: "A simple t-shirt and jeans combination." },
  ],
  pose: [
    { base36_map: "001", title: "Standing Tall", description: "Standing upright with hands resting on hips." },
  ],
  skin: [
    { base36_map: "001", title: "Pale", description: "Fair skin that has rarely seen the sun." },
  ],
  special: [
    { base36_map: "001", title: "Glowing Runes", description: "Mystical runes that softly glow along the arms." },
  ]
};

async function main() {
  console.log("🚀 Starting data insertion...\n");

  for (const [tableName, entries] of Object.entries(dataToInsert)) {
    if (entries.length === 0) continue;

    console.log(`⏳ Processing table: [${tableName}] with ${entries.length} entries...`);
    
    // Format the entries to automatically include the base10_map
    const formattedEntries = entries.map(entry => {
      const base10 = segmentToBase10(entry.base36_map);
      
      if (isNaN(base10)) {
        console.warn(`⚠️ Warning: Invalid base36_map "${entry.base36_map}" for table ${tableName}. Skipping this entry.`);
        return null;
      }

      return {
        base36_map: entry.base36_map,
        base10_map: base10,
        title: entry.title,
        description: entry.description,
      };
    }).filter(Boolean); // Remove nulls

    if (formattedEntries.length === 0) continue;

    // Insert the data into Supabase
    const { data, error } = await supabase
      .from(tableName)
      .insert(formattedEntries)
      .select();

    if (error) {
      console.error(`❌ Error inserting into ${tableName}:`, error.message);
      console.error("Details:", error.details || error.hint);
    } else {
      console.log(`✅ Successfully inserted ${data?.length} rows into [${tableName}].`);
    }
  }

  console.log("\n🎉 All done! You can view the newly added data in the browser at /bbg");
}

main().catch(console.error);
