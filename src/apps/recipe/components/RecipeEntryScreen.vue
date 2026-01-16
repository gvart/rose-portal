<template>
  <div class="entry-screen">
    <div class="actions-container">
      <div class="actions-list">
        <ActionItem
          icon="lightbulb"
          title="Get Recommendations"
          description="Discover dishes based on your preferences"
          @click="$emit('selectRecommendations')"
        />
        <ActionItem
          icon="search"
          title="Find Recipe"
          description="Search for a specific dish by name"
          @click="$emit('selectRecipe')"
        />
        <ActionItem
          icon="calendar_month"
          title="Meal Prep Plan"
          description="Build a weekly meal plan with grocery list"
          @click="$emit('selectMealPrep')"
        />
        <ActionItem
          icon="bookmark"
          title="Saved Plans"
          description="View your saved meal plans"
          @click="$emit('selectSavedPlans')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionItem from './ActionItem.vue'

defineEmits<{
  selectRecommendations: []
  selectRecipe: []
  selectMealPrep: []
  selectSavedPlans: []
}>()
</script>

<style scoped>
.entry-screen {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100%;
  padding: var(--space-6) 0;
}

.actions-container {
  width: 100%;
  max-width: 32rem;
  padding: 0 var(--space-4);
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

@media (min-width: 640px) {
  .entry-screen {
    padding: var(--space-8) 0;
  }

  .actions-container {
    max-width: 36rem;
  }

  .actions-list {
    gap: var(--space-4);
  }
}
</style>
