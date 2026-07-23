import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/seasalt/',
  server: { port: 8765 },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['cards/*.png', 'icons/*.png'],
      manifest: {
        name: 'Seasalt — Compteur Sea Salt & Paper',
        short_name: 'Seasalt',
        description: 'Photographiez votre main, obtenez votre score.',
        theme_color: '#0f766e',
        background_color: '#f0fdfa',
        display: 'standalone',
        lang: 'fr',
        start_url: '/seasalt/',
        scope: '/seasalt/',
        icons: [
          { src: '/seasalt/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/seasalt/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/seasalt/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      }
    })
  ]
})
