// Copies the font subsets the app uses from @fontsource into src/assets/fonts, and cuts
// the large latin-ext files down to the latin-ext letters Yoruba text needs (Ṣ ṣ).
// Usage: pnpm fonts   (requires fonttools: `pip install fonttools brotli`)
// If you add text with another latin-ext letter (e.g. ń), add it to YO_EXT and to the
// matching unicode-range in src/styles/fonts.css, then run this again.
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const YO_EXT = 'U+1E62-1E63';
const FACES = [
  { pkg: '@fontsource/noto-sans', family: 'noto-sans', weights: [400, 600, 700] },
  { pkg: '@fontsource/noto-serif-display', family: 'noto-serif-display', weights: [600] },
];

const require = createRequire(import.meta.url);
const out = new URL('../src/assets/fonts/', import.meta.url).pathname;
await mkdir(out, { recursive: true });

for (const { pkg, family, weights } of FACES) {
  const files = join(dirname(require.resolve(`${pkg}/package.json`)), 'files');
  for (const w of weights) {
    for (const subset of ['latin', 'vietnamese']) {
      const name = `${family}-${subset}-${w}-normal.woff2`;
      await copyFile(join(files, name), join(out, name));
    }
    execFileSync('pyftsubset', [
      join(files, `${family}-latin-ext-${w}-normal.woff2`),
      `--unicodes=${YO_EXT}`,
      '--layout-features=*',
      '--flavor=woff2',
      `--output-file=${join(out, `${family}-yo-ext-${w}-normal.woff2`)}`,
    ]);
  }
}
console.log(`Wrote fonts to ${out}`);
