<template>
  <div class="clock-display">
    <time
      :datetime="isoDateTime"
      aria-live="polite"
      aria-atomic="true"
    >
      <!-- Time Display -->
      <div :class="['clock-time', { compact: isCompact }]">
        {{ displayTime }}
      </div>

      <!-- Date Display -->
      <div v-if="!isCompact" class="clock-date">
        {{ displayDate }}
      </div>
    </time>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useClock } from '@/composables/useClock'
import { formatTime24, formatHeaderDate } from '@/apps/calendar/composables/useDateUtils'

defineProps<{
  isCompact?: boolean
}>()

const { currentTime } = useClock()

const displayTime = computed(() => formatTime24(currentTime.value))
const displayDate = computed(() => formatHeaderDate(currentTime.value))
const isoDateTime = computed(() => currentTime.value.toISOString())
</script>

<style scoped>
.clock-display {
  text-align: center;
  transition: all 0.3s var(--spring-smooth);
}

.clock-time {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  transition: all 0.3s var(--spring-smooth);

  /* Prevent layout shift during time changes */
  font-variant-numeric: tabular-nums;
}

.clock-time.compact {
  font-size: 1.5rem;
}

.clock-date {
  font-size: 1.25rem;
  color: rgba(60, 60, 67, 0.6);
  margin-top: 8px;
  font-weight: 500;
  transition: all 0.3s var(--spring-smooth);
}

/* Desktop - larger display */
@media (min-width: 768px) {
  .clock-time {
    font-size: 4rem;
  }

  .clock-date {
    font-size: 1.5rem;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .clock-time,
  .clock-date,
  .clock-display {
    transition: none;
  }
}
</style>
