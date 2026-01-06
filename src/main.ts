import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'
import { hapticDirective } from './directives/haptic'
import { swipeBackDirective } from './directives/swipeBack'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('haptic', hapticDirective)
app.directive('swipe-back', swipeBackDirective)

app.mount('#app')
