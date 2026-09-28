/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Base path for GitHub Pages: https://<username>.github.io/<repo>/
 * Change it here only. For a custom domain, use '/'.
 */
export const BASE = '/odu-ifa-game/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Odù Practice',
        short_name: 'Odù Practice',
        description: 'Practice recognizing Odù Ifá signs on the opẹ̀lẹ̀ and ọpọ́n Ifá.',
        lang: 'en',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        theme_color: '#161915',
        background_color: '#f4f2e4',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
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
