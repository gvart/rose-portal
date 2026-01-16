import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Quasar imports
import { Quasar, Notify, Dialog, Dark } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

// Rose Portal styles
import './assets/styles/main.css'
import './assets/styles/quasar-overrides.css'

// Custom directives
import { swipeBackDirective } from './directives/swipeBack'

// Other plugins
import { MotionPlugin } from '@vueuse/motion'
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'

const app = createApp(App)

// Configure Quasar
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Dark
  },
  config: {
    brand: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#22C55E',
      dark: '#0F172A',
      positive: '#22C55E',
      negative: '#EF4444',
      info: '#3B82F6',
      warning: '#F59E0B'
    },
    notify: {
      position: 'top-right',
      timeout: 3000,
      textColor: 'white',
      actions: [{ icon: 'close', color: 'white' }]
    }
  }
})

// Auto-detect dark mode from system preference
Dark.set('auto')

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)
app.use(Particles, {
  init: async (engine) => {
    await loadSlim(engine)
  }
})
app.directive('swipe-back', swipeBackDirective)

app.mount('#app')

// Handle query param navigation (for GitHub Pages compatibility)
router.isReady().then(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const action = urlParams.get('action')

  if (action === 'install') {
    // Navigate to /install and preserve other query params
    urlParams.delete('action')
    const remainingParams = urlParams.toString()
    const installPath = remainingParams ? `/install?${remainingParams}` : '/install'
    router.push(installPath)
  }
})
