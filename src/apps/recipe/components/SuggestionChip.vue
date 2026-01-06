<template>
  <button class="suggestion-chip" @click="$emit('click')">
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.suggestion-chip {
  @apply px-5 py-3 rounded-full border-2 border-emerald-300
         bg-transparent text-gray-700 font-medium
         cursor-pointer transition-all duration-150
         hover:bg-emerald-50 hover:border-emerald-500
         active:scale-95 active:bg-emerald-100;
  min-height: 48px;
}
</style>
