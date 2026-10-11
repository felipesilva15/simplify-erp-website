import { cpSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, '..', 'src');
const distDir = join(root, '..', 'dist');

/** Copia recursivamente os arquivos que o `tsc` não emite (templates e schemas JSON). */
function copyAssets(current) {
  for (const entry of readdirSync(current)) {
    const absolute = join(current, entry);
    const stats = statSync(absolute);

    if (stats.isDirectory()) {
      if (entry.startsWith('files')) {
        cpSync(absolute, join(distDir, relative(srcDir, absolute)), { recursive: true });
        continue;
      }

      copyAssets(absolute);
      continue;
    }

    if (entry.endsWith('.json')) {
      const destination = join(distDir, relative(srcDir, absolute));
      mkdirSync(dirname(destination), { recursive: true });
      cpSync(absolute, destination);
    }
  }
}

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

copyAssets(srcDir);
