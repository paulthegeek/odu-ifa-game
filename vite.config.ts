/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Base path. The site is served from the root of its custom domain (https://odugame.com/).
 * Change it here only. Without a custom domain, use '/<repo>/' (https://<username>.github.io/<repo>/).
 */
export const BASE = '/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeManifestIcons: false,
      manifest: {
        name: 'Odù Game',
        short_name: 'Odù Game',
        description: 'Practice recognizing Odù Ifá signs on the opẹ̀lẹ̀ and ọpọ́n Ifá.',
        lang: 'en',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        theme_color: '#121711',
        background_color: '#ffffff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The OS keeps its own copy of install icons; no need to precache the large ones.
        // The social preview image is only fetched by link-preview bots, and offline
        // visits never reach 404.html because of navigateFallback.
        globIgnores: ['pwa-512x512.png', 'pwa-maskable-512x512.png', 'social-preview.png', '404.html'],
        navigateFallback: `${BASE}index.html`,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
});
