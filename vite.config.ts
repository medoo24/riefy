import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/riefy/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}']
      },
      manifest: {
        name: 'Riefy Smart Learning',
        short_name: 'Riefy',
        description: 'Smart language and medical cardiology learning app',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
