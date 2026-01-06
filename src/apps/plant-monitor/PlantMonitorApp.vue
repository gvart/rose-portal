<template>
  <AppLayout :title="pageTitle" theme-color="#22C55E">
    <PlantList
      v-if="!deviceId"
      :plants="store.plants"
      :loading="store.loading"
      :error="store.error"
      :last-refresh="store.lastRefresh"
      @refresh="store.fetchPlants()"
    />

    <PlantDetailView
      v-else
      :plant="store.currentPlant"
      :loading="store.loading"
      :error="store.error"
      :action-in-progress="store.actionInProgress"
      :action-success="store.actionSuccess"
      :config-in-progress="store.configInProgress"
      @refresh="refreshDetail"
      @water="handleWaterPlant"
      @update-config="handleUpdateConfig"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import PlantList from './components/PlantList.vue'
import PlantDetailView from './components/PlantDetailView.vue'
import { usePlantStore } from './stores/plantStore'
import type { PlantConfig } from './types/plant'

const route = useRoute()
const store = usePlantStore()

const deviceId = computed(() => route.params.deviceId as string | undefined)

const pageTitle = computed(() => {
  if (deviceId.value && store.currentPlant) {
    return store.currentPlant.name
  }
  return 'Plant Monitor'
})

function refreshDetail() {
  if (deviceId.value) {
    store.fetchPlantDetails(deviceId.value)
  }
}

function handleWaterPlant(plantDeviceId: string) {
  store.triggerWatering(plantDeviceId)
}

function handleUpdateConfig(deviceId: string, config: PlantConfig & { name: string }) {
  store.updateConfig(deviceId, config)
}

// Watch for route changes to load detail view
watch(
  deviceId,
  (newDeviceId) => {
    if (newDeviceId) {
      store.fetchPlantDetails(newDeviceId)
    } else {
      store.currentPlant = null
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (!deviceId.value) {
    store.startAutoRefresh(30000)
  }
})

onUnmounted(() => {
  store.stopAutoRefresh()
})
</script>
