import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAllPlants, getPlantDetails, waterPlant, updatePlantConfig } from '../services/plantApi'
import type { Plant, PlantConfig } from '../types/plant'

export const usePlantStore = defineStore('plant', () => {
  const plants = ref<Plant[]>([])
  const currentPlant = ref<Plant | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastRefresh = ref<Date | null>(null)
  const actionInProgress = ref(false)
  const actionSuccess = ref<string | null>(null)
  const configInProgress = ref(false)
  const configSuccess = ref<string | null>(null)
  const configError = ref<string | null>(null)

  let refreshTimer: number | null = null

  async function fetchPlants() {
    loading.value = true
    error.value = null

    try {
      plants.value = await getAllPlants()
      lastRefresh.value = new Date()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch plants'
    } finally {
      loading.value = false
    }
  }

  async function fetchPlantDetails(deviceId: string) {
    loading.value = true
    error.value = null

    try {
      currentPlant.value = await getPlantDetails(deviceId)
      lastRefresh.value = new Date()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch plant details'
    } finally {
      loading.value = false
    }
  }

  function startAutoRefresh(intervalMs = 30000) {
    stopAutoRefresh()
    fetchPlants()
    refreshTimer = window.setInterval(fetchPlants, intervalMs)
  }

  function stopAutoRefresh() {
    if (refreshTimer !== null) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  async function triggerWatering(deviceId: string) {
    actionInProgress.value = true
    actionSuccess.value = null
    error.value = null

    try {
      await waterPlant(deviceId)
      actionSuccess.value = 'Watering triggered successfully!'

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        actionSuccess.value = null
      }, 3000)

      // Refresh plant details to get updated data
      await fetchPlantDetails(deviceId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to trigger watering'
    } finally {
      actionInProgress.value = false
    }
  }

  async function updateConfig(deviceId: string, config: PlantConfig) {
    configInProgress.value = true
    configSuccess.value = null
    configError.value = null

    try {
      await updatePlantConfig(deviceId, config)
      configSuccess.value = 'Configuration updated successfully!'

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        configSuccess.value = null
      }, 3000)

      // Refresh plant details to get updated config
      await fetchPlantDetails(deviceId)
    } catch (e) {
      configError.value = e instanceof Error ? e.message : 'Failed to update configuration'
    } finally {
      configInProgress.value = false
    }
  }

  return {
    plants,
    currentPlant,
    loading,
    error,
    lastRefresh,
    actionInProgress,
    actionSuccess,
    configInProgress,
    configSuccess,
    configError,
    fetchPlants,
    fetchPlantDetails,
    startAutoRefresh,
    stopAutoRefresh,
    triggerWatering,
    updateConfig
  }
})
