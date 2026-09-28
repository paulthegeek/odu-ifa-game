// Renders public/favicon.svg to the PNG icons the PWA manifest needs.
// Usage: npm run icons   (requires `npx playwright install chromium`)
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

await render(192, 'pwa-192x192.png');
await render(512, 'pwa-512x512.png');
// Maskable: keep the art inside the 80% safe zone on a solid background.
await render(512, 'pwa-maskable-512x512.png', { padding: 72, background: '#2b2a3d' });
await browser.close();
