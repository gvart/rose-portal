import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',

  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
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

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Network-first strategy for API calls
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https?:\/\/.*\/actuator\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'actuator-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 5
            }
          },
          // Images, fonts - Cache First
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff2)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],

        // Clean up old caches
        cleanupOutdatedCaches: true,

        // Skip waiting and claim clients immediately
        skipWaiting: true,
        clientsClaim: true
      },

      devOptions: {
        enabled: true, // Enable PWA in dev mode for testing
        type: 'module',
        navigateFallback: 'index.html'
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
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.cert/localhost+4-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.cert/localhost+4.pem'))
    },
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_BACKEND_HOST,
        changeOrigin: true
      },
      '/actuator': {
        target: process.env.VITE_DEV_BACKEND_HOST,
        changeOrigin: true
      }
    }
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
