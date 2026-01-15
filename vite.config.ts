import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',

  plugins: [
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      includeAssets: ['icons/**/*.svg', 'apple-touch-icon.png'],

      manifest: {
        name: 'ROSE Smart Hub',
        short_name: 'ROSE',
        description: 'Your intelligent home assistant for plants, recipes, and calendar',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'fullscreen',
        orientation: 'portrait-primary',
        start_url: process.env.VITE_BASE_PATH || '/',
        scope: process.env.VITE_BASE_PATH || '/',
        icons: [
          {
            src: '/icons/pwa/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/pwa/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        shortcuts: [
          {
            name: 'Recipe Finder',
            short_name: 'Recipes',
            description: 'Find recipes and ingredients',
            url: '/recipe',
            icons: [{ src: '/icons/recipe.svg', sizes: '96x96' }]
          },
          {
            name: 'Plant Monitor',
            short_name: 'Plants',
            description: 'Monitor your smart plant sensors',
            url: '/plant-monitor',
            icons: [{ src: '/icons/plant.svg', sizes: '96x96' }]
          },
          {
            name: 'Calendar',
            short_name: 'Calendar',
            description: 'View your schedule',
            url: '/calendar',
            icons: [{ src: '/icons/calendar.svg', sizes: '96x96' }]
          }
        ]
      },

      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Caching strategies are now defined in custom sw.js
      },

      devOptions: {
        enabled: true, // Enable PWA in dev mode for testing
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['axios'],
          'pwa': ['workbox-window']
        }
      }
    }
  }
})
