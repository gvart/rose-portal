import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'
import { hapticDirective } from './directives/haptic'
import { swipeBackDirective } from './directives/swipeBack'
import { MotionPlugin } from '@vueuse/motion'
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)
app.use(Particles, {
  init: async (engine) => {
    await loadSlim(engine)
  }
})
app.directive('haptic', hapticDirective)
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
