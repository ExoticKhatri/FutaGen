import { writeFileSync } from 'fs';
import { basename, resolve } from 'path';

const targetPath = process.argv[2];

if (!targetPath) {
  console.error("Usage: bun test/logicgen.ts <path-to-file>");
  process.exit(1);
}

const fullPath = resolve(targetPath);
const fileName = basename(fullPath).toLowerCase();

// Determine which trait name to use (e.g., mood, skin, shoulders)
const traitName = fileName.split('.')[0]; 

const generateContent = () => {
  let content = '';

  // 1. LOGIC FILES (e.g., mood.ts inside data/logic/)
  if (fullPath.includes('logic')) {
    content += `import { VariantLogic } from '@/types/traits';\n\n`;
    content += `export const ${traitName}Logic: VariantLogic[] = [\n`;
    
    for (let i = 0; i < 100; i++) {
      const id = i.toString().padStart(3, '0');
      content += `  { id: '${id}', hasDependency: false },\n`;
    }
    content += `];`;
  } 
  
  // 2. DISPLAY FILES (e.g., mood.ts inside data/display/)
  else if (fullPath.includes('display')) {
    content += `import { DisplayLibrary } from '@/types/traits';\n\n`;
    content += `export const ${traitName}Display: DisplayLibrary = {\n`;
    
    for (let i = 0; i < 100; i++) {
      const id = i.toString().padStart(3, '0');
      const name = i === 0 ? 'AI Select' : `Trait ${id}`;
      content += `  '${id}': { id: '${id}', name: '${name}' },\n`;
    }
    content += `};`;
  }

  // 3. LORE FILES (e.g., mood.ts inside data/lore/)
  else if (fullPath.includes('lore')) {
    content += `import { LoreLibrary } from '@/types/traits';\n\n`;
    content += `export const ${traitName}Lore: LoreLibrary = {\n`;
    
    for (let i = 0; i < 100; i++) {
      const id = i.toString().padStart(3, '0');
      const desc = i === 0 ? 'AI Select Default' : `Description for ${traitName} ${id}`;
      content += `  '${id}': { id: '${id}', description: '${desc}' },\n`;
    }
    content += `};`;
  }

  return content;
};

const finalCode = generateContent();

if (finalCode === '') {
  console.error("❌ Error: Could not determine if file is logic, display, or lore based on the path.");
} else {
  writeFileSync(fullPath, finalCode, 'utf8');
  console.log(`✅ Successfully populated 100 entries in ${traitName}.ts`);
}