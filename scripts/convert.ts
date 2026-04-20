import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: bun run scripts/convert.ts <folder> [more-folders...]');
  process.exit(1);
}

type FileResult = {
  filePath: string;
  replacements: number;
};

async function collectTsFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        return collectTsFiles(fullPath);
      }

      if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        return [fullPath];
      }

      return [];
    }),
  );

  return files.flat();
}

function toBase36PreserveWidth(decimalText: string): string {
  const base36 = BigInt(decimalText).toString(36);

  if (decimalText.startsWith('0') && base36.length < decimalText.length) {
    return base36.padStart(decimalText.length, '0');
  }

  return base36;
}

function convertIdValues(content: string): { nextContent: string; replacements: number } {
  let replacements = 0;

  // Only convert the value directly assigned to the `id` property.
  // This intentionally does not touch object keys like '048': { ... }.
  const idPattern = /((?:^|[,{]\s*)id\s*:\s*)(?:(['"])(\d+)\2|(\d+))/gm;

  const nextContent = content.replace(idPattern, (_match, prefix: string, quote: string | undefined, quotedDigits: string | undefined, unquotedDigits: string | undefined) => {
    const decimalText = quotedDigits ?? unquotedDigits;
    if (!decimalText) {
      return _match;
    }

    const converted = toBase36PreserveWidth(decimalText);

    if (converted === decimalText) {
      return _match;
    }

    replacements += 1;

    if (quote) {
      return `${prefix}${quote}${converted}${quote}`;
    }

    return `${prefix}${converted}`;
  });

  return { nextContent, replacements };
}

async function processFile(filePath: string): Promise<FileResult> {
  const content = await readFile(filePath, 'utf8');
  const { nextContent, replacements } = convertIdValues(content);

  if (replacements > 0) {
    await writeFile(filePath, nextContent, 'utf8');
  }

  return { filePath, replacements };
}

async function main(): Promise<void> {
  const absoluteFolders = args.map((folder) => path.resolve(folder));

  const allFilesNested = await Promise.all(absoluteFolders.map(collectTsFiles));
  const allFiles = allFilesNested.flat();

  if (allFiles.length === 0) {
    console.log('No .ts files found in the provided folders.');
    return;
  }

  const results = await Promise.all(allFiles.map(processFile));

  const changed = results.filter((result) => result.replacements > 0);
  const totalReplacements = changed.reduce((sum, result) => sum + result.replacements, 0);

  for (const item of changed) {
    const relativePath = path.relative(process.cwd(), item.filePath) || item.filePath;
    console.log(`${relativePath}: updated ${item.replacements} id value(s)`);
  }

  console.log(`\nDone. Updated ${totalReplacements} id value(s) across ${changed.length} file(s).`);
}

main().catch((error: unknown) => {
  console.error('Failed to convert IDs:', error);
  process.exit(1);
});
