<template>
  <button v-haptic class="choice-card" @click="$emit('click')">
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
  @apply flex flex-col items-center gap-3 p-5 rounded-2xl
         bg-white border-2 border-emerald-200 cursor-pointer
         transition-all duration-200 hover:border-emerald-400
         hover:-translate-y-1 hover:shadow-xl active:scale-95
         w-full sm:min-w-[280px];
  min-height: 160px;
}

.icon-wrapper {
  @apply w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-emerald-500;
}

.icon {
  @apply w-full h-full;
}

.card-title {
  @apply text-xl sm:text-2xl font-semibold text-gray-800 text-center;
}

.card-description {
  @apply text-sm sm:text-base text-gray-500 text-center leading-relaxed;
}
</style>
