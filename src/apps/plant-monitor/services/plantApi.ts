import { apiClients } from '@/services/apiClient'
import type { Plant, PlantConfig } from '../types/plant'

const api = apiClients.plants

export async function getAllPlants(): Promise<Plant[]> {
  const response = await api.get<Plant[]>('/plants')
  return response.data
}

export async function getPlantDetails(deviceId: string): Promise<Plant> {
  const response = await api.get<Plant>(`/plants/${deviceId}`)
  return response.data
}

export async function waterPlant(deviceId: string): Promise<void> {
  await api.get(`/plants/${deviceId}/actions/water`)
}

export async function updatePlantConfig(
  deviceId: string,
  config: PlantConfig
): Promise<void> {
  await api.post(`/plants/${deviceId}/actions/config`, config)
}
