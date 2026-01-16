<template>
  <div :class="['app-grid', `layout-${layout}`]">
    <div
      :class="['apps-container', { carousel: layout === 'carousel' }]"
      :style="{ '--grid-columns': columns }"
    >
      <AppIcon
        v-for="app in apps"
        :key="app.id"
        :name="app.name"
        :icon-name="app.iconName"
        :color="app.color"
        @click="navigateToApp(app)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { AppConfig } from '@/types/app'
import AppIcon from '@/components/common/AppIcon.vue'

interface Props {
  apps: AppConfig[]
  layout?: 'grid' | 'carousel'
  columns?: number
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'grid',
  columns: 2
})

const router = useRouter()

function navigateToApp(app: AppConfig) {
  router.push(app.route)
}
</script>

<style scoped>
.app-grid {
  width: 100%;
}

.apps-container {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: 32px 24px;
  padding-bottom: 20px;
  justify-items: center;
}

/* Desktop - better spacing for larger icons */
@media (min-width: 768px) {
  .apps-container {
    gap: 40px 32px;
  }
}

.apps-container.carousel {
  grid-auto-flow: column;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 16px;
  padding-bottom: 20px;
}

.apps-container.carousel > * {
  scroll-snap-align: center;
}
</style>
