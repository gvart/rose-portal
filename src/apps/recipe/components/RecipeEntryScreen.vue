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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: var(--space-16) 0;
}

.choice-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  width: 100%;
  max-width: 64rem;
  padding: 0 var(--space-4);
}

.top-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  justify-content: center;
}

@media (min-width: 640px) {
  .top-row {
    flex-direction: row;
  }
}

.meal-prep-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  border: 2px solid transparent;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  min-height: 120px;
}

@media (min-width: 640px) {
  .meal-prep-card {
    flex-direction: row;
  }
}

.meal-prep-card:active {
  transform: scale(0.95);
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .icon-wrapper {
    width: 80px;
    height: 80px;
  }
}

.icon {
  width: 100%;
  height: 100%;
}

.meal-prep-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  text-align: center;
  flex: 1;
}

@media (min-width: 640px) {
  .meal-prep-content {
    text-align: left;
  }
}

.meal-prep-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: white;
}

@media (min-width: 640px) {
  .meal-prep-title {
    font-size: var(--font-size-32);
  }
}

.meal-prep-description {
  font-size: var(--font-size-13);
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

@media (min-width: 640px) {
  .meal-prep-description {
    font-size: var(--font-size-18);
  }
}
</style>
