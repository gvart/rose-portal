<template>
  <div class="entry-screen">
    <div class="choice-grid">
      <div class="top-row">
        <ChoiceCard
          icon="lightbulb"
          title="Get Recommendations"
          description="Discover dishes based on your preferences"
          @click="$emit('select-recommendations')"
        />
        <ChoiceCard
          icon="search"
          title="Find Recipe"
          description="Search for a specific dish by name"
          @click="$emit('select-recipe')"
        />
      </div>

      <button class="meal-prep-card" @click="$emit('select-meal-prep')">
        <div class="icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
          </svg>
        </div>
        <div class="meal-prep-content">
          <h3 class="meal-prep-title">Meal Prep Plan</h3>
          <p class="meal-prep-description">Build a weekly meal plan with automated grocery list</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChoiceCard from './ChoiceCard.vue'

defineEmits<{
  selectRecommendations: []
  selectRecipe: []
  selectMealPrep: []
}>()
</script>

<style scoped>
.entry-screen {
  @apply flex items-center justify-center min-h-full py-12;
}

.choice-grid {
  @apply flex flex-col gap-6 w-full max-w-4xl px-4;
}

.top-row {
  @apply flex flex-col sm:flex-row gap-4 justify-center;
}

.meal-prep-card {
  @apply flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl cursor-pointer
         transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl
         active:scale-95 border-2 border-transparent;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  min-height: 120px;
}

.icon-wrapper {
  @apply w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-white flex-shrink-0;
}

.icon {
  @apply w-full h-full;
}

.meal-prep-content {
  @apply flex flex-col gap-1 text-center sm:text-left flex-1;
}

.meal-prep-title {
  @apply text-2xl sm:text-3xl font-bold text-white;
}

.meal-prep-description {
  @apply text-sm sm:text-lg text-emerald-50 leading-relaxed;
}
</style>
