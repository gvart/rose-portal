<template>
  <div class="temperature-chart">
    <svg :viewBox="`0 0 ${width} ${height}`" class="chart-svg">
      <!-- Gradient for area fill -->
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(255, 255, 255, 0.3)" />
          <stop offset="100%" stop-color="rgba(255, 255, 255, 0.05)" />
        </linearGradient>
      </defs>

      <!-- Y-axis labels (temperature) -->
      <g class="y-labels">
        <text
          v-for="(label, i) in yLabels"
          :key="`y-label-${i}`"
          :x="padding - 10"
          :y="label.y"
          class="axis-label"
          text-anchor="end"
        >
          {{ label.text }}°
        </text>
      </g>

      <!-- Area fill -->
      <path v-if="areaPath" :d="areaPath" fill="url(#chartGradient)" />

      <!-- Temperature line -->
      <path v-if="linePath" :d="linePath" fill="none" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Data points -->
      <circle
        v-for="(point, i) in points"
        :key="`point-${i}`"
        :cx="point.x"
        :cy="point.y"
        r="3"
        fill="white"
        opacity="0.8"
        class="data-point"
      />

      <!-- X-axis labels (time) -->
      <g class="x-labels">
        <text
          v-for="(label, i) in xLabels"
          :key="`x-label-${i}`"
          :x="label.x"
          :y="height - 10"
          class="axis-label"
          text-anchor="middle"
        >
          {{ label.text }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HourlyForecast } from '../types/weather'

const props = defineProps<{
  hourlyData: HourlyForecast[]
}>()

const width = 800
const height = 200
const padding = 40

// Temperature values
const temps = computed(() => props.hourlyData.map((h) => h.temperature))
const minTemp = computed(() => Math.min(...temps.value))
const maxTemp = computed(() => Math.max(...temps.value))
const tempRange = computed(() => maxTemp.value - minTemp.value)

// Scale functions
const xScale = (index: number): number => {
  const dataPoints = props.hourlyData.length
  if (dataPoints === 0) return padding
  return padding + (index / (dataPoints - 1)) * (width - 2 * padding)
}

const yScale = (temp: number): number => {
  if (tempRange.value === 0) return height / 2
  const normalized = (temp - minTemp.value) / tempRange.value
  return height - padding - normalized * (height - 2 * padding)
}

// Chart points
const points = computed(() =>
  props.hourlyData.map((item, i) => ({
    x: xScale(i),
    y: yScale(item.temperature),
    temp: Math.round(item.temperature)
  }))
)

// SVG line path with smooth curves
const linePath = computed(() => {
  if (points.value.length === 0) return ''

  let path = `M ${points.value[0].x},${points.value[0].y}`

  for (let i = 1; i < points.value.length; i++) {
    const curr = points.value[i]
    const prev = points.value[i - 1]
    const controlX = (prev.x + curr.x) / 2

    path += ` Q ${controlX},${prev.y} ${(prev.x + curr.x) / 2},${(prev.y + curr.y) / 2}`
    path += ` Q ${controlX},${curr.y} ${curr.x},${curr.y}`
  }

  return path
})

// SVG area path (includes bottom edge)
const areaPath = computed(() => {
  if (points.value.length === 0) return ''
  const bottomY = height - padding
  const firstPoint = points.value[0]
  const lastPoint = points.value[points.value.length - 1]

  let path = `M ${firstPoint.x},${bottomY} L ${firstPoint.x},${firstPoint.y}`

  for (let i = 1; i < points.value.length; i++) {
    const curr = points.value[i]
    const prev = points.value[i - 1]
    const controlX = (prev.x + curr.x) / 2

    path += ` Q ${controlX},${prev.y} ${(prev.x + curr.x) / 2},${(prev.y + curr.y) / 2}`
    path += ` Q ${controlX},${curr.y} ${curr.x},${curr.y}`
  }

  path += ` L ${lastPoint.x},${bottomY} Z`

  return path
})

// Y-axis labels (temperature)
const yLabels = computed(() => {
  const labels = []
  const step = tempRange.value / 4

  for (let i = 0; i < 5; i++) {
    const temp = minTemp.value + i * step
    labels.push({
      y: getYGridPosition(i),
      text: Math.round(temp)
    })
  }

  return labels.reverse() // Top to bottom
})

// X-axis labels (time)
const xLabels = computed(() => {
  const labels = []
  const step = Math.max(1, Math.floor(props.hourlyData.length / 6)) // Show ~6 labels

  for (let i = 0; i < props.hourlyData.length; i += step) {
    const hour = props.hourlyData[i]
    labels.push({
      x: xScale(i),
      text: formatHour(hour.time)
    })
  }

  return labels
})

function getYGridPosition(index: number): number {
  return padding + (index * (height - 2 * padding)) / 4
}

function formatHour(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}
</script>

<style scoped>
.temperature-chart {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.chart-svg {
  width: 100%;
  height: auto;
}

.axis-label {
  fill: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-weight: 400;
}

.data-point {
  transition: all 0.2s ease;
  cursor: pointer;
}

.data-point:hover {
  r: 5;
  opacity: 1;
}
</style>
