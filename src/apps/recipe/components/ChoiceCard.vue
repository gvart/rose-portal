<template>
  <q-card
    class="choice-card"
    @click="$emit('click')"
    clickable
    v-ripple
  >
    <q-card-section class="choice-card-content">
      <div class="icon-wrapper">
        <q-icon :name="iconName" size="100%" color="positive" />
      </div>
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-description">{{ description }}</p>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: 'lightbulb' | 'search'
  title: string
  description: string
}>()

defineEmits<{
  click: []
}>()

const iconName = computed(() => {
  const iconMap = {
    lightbulb: 'lightbulb',
    search: 'search'
  }
  return iconMap[props.icon]
})
</script>

<style scoped>
.choice-card {
  border: 2px solid var(--color-success-border);
  border-radius: var(--radius-lg);
  width: 100%;
  min-height: 160px;
  transition: transform var(--duration-fast) var(--ease-in-out);
}

@media (min-width: 640px) {
  .choice-card {
    min-width: 280px;
  }
}

.choice-card:active {
  transform: scale(0.96);
  border-color: var(--color-success-solid);
}

.choice-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .icon-wrapper {
    width: 64px;
    height: 64px;
  }
}

.card-title {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
  text-align: center;
}

@media (min-width: 640px) {
  .card-title {
    font-size: var(--font-size-24);
  }
}

.card-description {
  font-size: var(--font-size-13);
  color: var(--color-text-muted);
  text-align: center;
  line-height: 1.6;
}

@media (min-width: 640px) {
  .card-description {
    font-size: var(--font-size-14);
  }
}
</style>
