import axios from 'axios'
import { apiClients } from '@/services/apiClient'
import type { MetricNamesResponse, MetricResponse } from '../types'

const api = apiClients.actuator

/**
 * Fetch all available metric names
 */
export async function getMetricNames(): Promise<string[]> {
  const response = await api.get<MetricNamesResponse>('/metrics')
  return response.data.names
}

/**
 * Fetch a specific metric by name
 * Returns null if the metric doesn't exist (404) or fails to fetch
 */
export async function getMetric(name: string): Promise<MetricResponse | null> {
  try {
    const response = await api.get<MetricResponse>(`/metrics/${name}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Metric doesn't exist, return null silently
      return null
    }
    // Re-throw other errors
    throw error
  }
}

/**
 * Fetch a metric with specific tags (for JVM metrics)
 * Returns null if the metric doesn't exist (404) or fails to fetch
 */
export async function getMetricWithTags(
  name: string,
  tags: Record<string, string>
): Promise<MetricResponse | null> {
  try {
    const tagParams = Object.entries(tags)
      .map(([key, value]) => `tag=${key}:${value}`)
      .join('&')

    const response = await api.get<MetricResponse>(`/metrics/${name}?${tagParams}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Metric doesn't exist, return null silently
      return null
    }
    // Re-throw other errors
    throw error
  }
}

/**
 * Batch fetch multiple metrics
 */
export async function getMetrics(names: string[]): Promise<Map<string, MetricResponse>> {
  const promises = names.map(name => getMetric(name))
  const results = await Promise.allSettled(promises)

  const metricsMap = new Map<string, MetricResponse>()
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      metricsMap.set(names[index], result.value)
    }
  })

  return metricsMap
}
