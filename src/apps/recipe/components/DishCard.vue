<template>
  <q-card
    class="dish-card"
    @click="$emit('click')"
    clickable
    v-ripple
  >
    <q-card-section>
      <h3 class="dish-name">{{ dishName }}</h3>
      <p class="dish-description">{{ description }}</p>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  dishName: string
  description: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.dish-card {
  border-left: 4px solid var(--color-success-solid);
  min-height: 120px;
  transition: transform var(--duration-fast) var(--ease-in-out);
}

.dish-card:active {
  transform: scale(0.96);
}

.dish-name {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.dish-description {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
