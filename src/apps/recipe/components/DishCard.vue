<template>
  <button v-haptic class="dish-card" @click="$emit('click')">
    <h3 class="dish-name">{{ dishName }}</h3>
    <p class="dish-description">{{ description }}</p>
  </button>
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
  @apply bg-white rounded-xl shadow-md p-5 cursor-pointer
         transition-all duration-150 hover:shadow-lg hover:scale-105
         active:scale-95 text-left;
  border-left: 4px solid #10b981;
  min-height: 120px;
}

.dish-name {
  @apply text-xl font-semibold text-gray-800 mb-2;
}

.dish-description {
  @apply text-base text-gray-600 leading-relaxed line-clamp-3;
}
</style>
