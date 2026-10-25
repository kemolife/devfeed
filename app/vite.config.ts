/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages serves the app at /<repo>/; CI sets BASE_PATH, local dev stays at /.
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'prompt' = the client does not auto-reload mid-card; UpdateToast offers Reload.
      registerType: 'prompt',
      includeAssets: ['icon.svg'],
      // Each deck page links its own static manifest (public/manifest*.webmanifest).
      // iPhone reads the manifest when the page loads, so it must be in the HTML, not swapped by JS.
      manifest: false,
      workbox: {
        // A new worker takes over at once. A waiting worker needs a "skip waiting" message
        // from the page, which older installed versions never send, so they got stuck.
        skipWaiting: true,
        clientsClaim: true,
        // cards.json changes daily: always try the network first, fall back to cache offline
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /\/(cards|decks\/[\w-]+)\.json$/.test(url.pathname),
            handler: 'NetworkFirst',
            options: { cacheName: 'cards' },
          },
        ],
      },
    }),
  ],
  // one page per deck: / (main) and /olha/
  build: {
    rollupOptions: {
      input: { main: 'index.html', olha: 'olha/index.html' },
    },
  },
  server: { host: true, port: 5180 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
