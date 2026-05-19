// scripts/generate-traits.ts
import { generateAITraits } from "@/actions/ai/entryGen";
import { TRAIT_CATEGORIES } from "@/types/traits";

async function runScript() {
  // Get arguments from terminal: bun scripts/generate-traits.ts <table_name> <count>
  const tableName = process.argv[2] as any;
  const count = parseInt(process.argv[3]) || 5;

  if (!TRAIT_CATEGORIES.includes(tableName)) {
    console.error(`❌ Invalid table. Choose from: ${TRAIT_CATEGORIES.join(", ")}`);
    process.exit(1);
  }

  console.log(`🤖 Starting AI generation for [${tableName}]...`);
  
  const result = await generateAITraits(
    tableName, 
    count, 
    "Generate diverse body types for a high-ranking demoness."
  );

  if (result.success) {
    console.log(`✅ Success! Generated ${result.count} entries.`);
    console.log(`📂 File saved at: ${result.path}`);
  } else {
    console.error(`❌ Generation failed:`, result.error);
  }
}

runScript();