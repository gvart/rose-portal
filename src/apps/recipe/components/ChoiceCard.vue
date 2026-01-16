<template>
  <button class="choice-card" @click="$emit('click')">
    <div class="icon-wrapper">
      <svg v-if="icon === 'lightbulb'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
      <svg v-else-if="icon === 'search'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    </div>
    <h3 class="card-title">{{ title }}</h3>
    <p class="card-description">{{ description }}</p>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: 'lightbulb' | 'search'
  title: string
  description: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.choice-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  border: 2px solid var(--color-success-border);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  width: 100%;
  min-height: 160px;
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

.icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-success-solid);
}

@media (min-width: 640px) {
  .icon-wrapper {
    width: 64px;
    height: 64px;
  }
}

.icon {
  width: 100%;
  height: 100%;
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
