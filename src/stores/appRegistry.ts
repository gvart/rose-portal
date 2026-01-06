import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppConfig } from '@/types/app'
import { appRegistry } from '@/config/apps'

export const useAppStore = defineStore('apps', () => {
  const apps = ref<AppConfig[]>(appRegistry)

  const enabledApps = computed(() =>
    apps.value
      .filter(app => app.enabled)
      .sort((a, b) => a.order - b.order)
  )

  const getAppById = (id: string) =>
    apps.value.find(app => app.id === id)

  return {
    apps,
    enabledApps,
    getAppById
  }
})
