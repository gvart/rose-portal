import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { quasar } from '@quasar/vite-plugin'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || '/',

  plugins: [
    vue(),
    quasar({
      sassVariables: 'src/assets/styles/quasar-variables.scss',
      // Enable tree-shaking for Quasar components
      autoImportComponentCase: 'kebab'
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      includeAssets: ['icons/**/*.svg', 'apple-touch-icon.png', 'splash/**/*.png'],
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
        // Increase the maximum file size for precaching
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024 // 3MB
      },
      devOptions: {
        enabled: mode === 'development',
        type: 'module'
      }
    }),
    // Bundle analysis in build mode
    mode === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),

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

    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : []
      },
      format: {
        comments: false
      }
    },

    // Chunk splitting strategy
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Core vendor chunk - rarely changes
          'vendor-core': ['vue', 'vue-router', 'pinia'],

          // Quasar - separate for independent caching
          'vendor-quasar': ['quasar', '@quasar/extras'],

          // Heavy UI dependencies
          'vendor-ui': [
            '@fullcalendar/core',
            '@fullcalendar/vue3',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction'
          ],

          // Editor dependencies
          'vendor-editor': [
            '@tiptap/core',
            '@tiptap/vue-3',
            '@tiptap/starter-kit',
            '@tiptap/extension-placeholder'
          ],

          // Utility libraries
          'vendor-utils': ['axios', 'marked', '@vuepic/vue-datepicker'],

          // PWA utilities
          'vendor-pwa': ['workbox-window']
        },

        // Chunk file naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId && facadeModuleId.includes('/apps/')) {
            // Extract app name for route-based chunks
            const appMatch = facadeModuleId.match(/\/apps\/([^/]+)\//)
            if (appMatch) {
              return `assets/app-${appMatch[1]}-[hash].js`
            }
          }
          return 'assets/[name]-[hash].js'
        },

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name || ''
          if (/\.(woff2?|ttf|eot|otf)$/.test(info)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(info)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },

    // Report compressed sizes
    reportCompressedSize: true,

    // Chunk size warnings
    chunkSizeWarningLimit: 500 // KB
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'quasar',
      'axios'
    ],
    exclude: [
      // Exclude heavy deps from pre-bundling if causing issues
    ]
  },

  // CSS optimization
  css: {
    devSourcemap: mode === 'development',
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname, './')]
      }
    }
  }
}))
