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
      // The app shows "New version — Reload" (UpdateToast) instead of updating silently
      // on the next-but-one start.
      registerType: 'prompt',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'BitFeed — firmware in 60 seconds',
        short_name: 'BitFeed',
        description: 'Swipe feed of embedded C, C++, Rust and electronics puzzles and PR reviews.',
        theme_color: '#0b0f14',
        background_color: '#0b0f14',
        display: 'standalone',
        orientation: 'portrait',
        // relative to the manifest, so it works under any base path
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // cards.json changes daily: always try the network first, fall back to cache offline
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/cards.json'),
            handler: 'NetworkFirst',
            options: { cacheName: 'cards' },
          },
        ],
      },
    }),
  ],
  server: { host: true, port: 5180 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
