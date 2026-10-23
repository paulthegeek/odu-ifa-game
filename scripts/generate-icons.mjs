// Renders public/favicon.svg to the PNG icons the PWA manifest needs, and the
// social preview image (public/social-preview.png) that index.html links to.
// Usage: pnpm icons   (requires `pnpm exec playwright install chromium`)
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();

async function render(size, file, { padding = 0, background = 'transparent' } = {}) {
  await page.setViewportSize({ width: size, height: size });
  const inner = size - padding * 2;
  await page.setContent(
    `<body style="margin:0;background:${background};display:grid;place-items:center;height:${size}px">` +
      `<div style="width:${inner}px;height:${inner}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body>`,
  );
  await page.screenshot({
    path: new URL(`../public/${file}`, import.meta.url).pathname,
    omitBackground: background === 'transparent',
  });
  console.log('wrote', file);
}

/** The app's own @font-face rules, with each font file inlined so the page needs no server. */
async function inlineFonts() {
  const css = await readFile(new URL('../src/styles/fonts.css', import.meta.url), 'utf8');
  const files = [...new Set(css.match(/\.\.\/assets\/fonts\/[\w-]+\.woff2/g))];
  let out = css;
  for (const f of files) {
    const data = await readFile(new URL(`../src/${f.slice(3)}`, import.meta.url));
    out = out.replaceAll(f, `data:font/woff2;base64,${data.toString('base64')}`);
  }
  return out;
}

/** 1200 × 630 is the size Facebook, LinkedIn, WhatsApp and X all crop well. Colors are the Light theme's. */
async function renderSocial(file) {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<!doctype html><html lang="en"><head><style>
    ${await inlineFonts()}
    body { margin: 0; width: 1200px; height: 630px; display: flex; align-items: center; gap: 72px;
      padding: 0 96px; box-sizing: border-box; background: #f3f4ee; color: #25281f; font-family: 'Noto Sans', sans-serif; }
    .logo { flex: none; width: 320px; height: 320px; }
    h1 { margin: 0; font: 600 104px/1.05 'Noto Serif Display', serif; }
    p { margin: 24px 0 0; font-size: 42px; line-height: 1.3; color: #62665a; }
    .site { margin-top: 40px; font-size: 32px; font-weight: 600; color: #2a5a1f; }
  </style></head><body>
    <div class="logo">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div>
    <div>
      <h1>Odù Game</h1>
      <p>Learn to read Odù Ifá signs on the <span lang="yo">ọpọ́n Ifá</span> and <span lang="yo">opẹ̀lẹ̀</span></p>
      <p class="site">odugame.com</p>
    </div>
  </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`../public/${file}`, import.meta.url).pathname });
  console.log('wrote', file);
}

await render(192, 'pwa-192x192.png');
await render(512, 'pwa-512x512.png');
// Maskable: keep the art inside the 80% safe zone on a solid background.
await render(512, 'pwa-maskable-512x512.png', { padding: 72, background: '#2b2a3d' });
await renderSocial('social-preview.png');
await browser.close();
