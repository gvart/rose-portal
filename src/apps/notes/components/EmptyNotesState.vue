<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      {{ context === 'filtered' ? '🔍' : context === 'error' ? '⚠️' : '📝' }}
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p class="empty-state__message">{{ message }}</p>
    <button
      v-if="showCreateButton && context !== 'error'"
      class="empty-state__button"
      @click="$emit('create')"
    >
      Create Note
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    message?: string
    showCreateButton?: boolean
    context?: 'empty' | 'filtered' | 'error'
  }>(),
  {
    title: 'No Notes Yet',
    message: 'Start writing your first note',
    showCreateButton: true,
    context: 'empty'
  }
)

defineEmits<{
  create: []
}>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: #6b7280;
}

.empty-state__icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state__title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-state__message {
  font-size: 14px;
  margin: 0 0 24px 0;
}

.empty-state__button {
  padding: 10px 20px;
  min-height: 44px;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.empty-state__button:hover {
  background-color: #7c3aed;
}

.empty-state__button:active {
  transform: scale(0.98);
}

.empty-state__button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.empty-state__button:focus {
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  .empty-state__button {
    transition: none !important;
  }
}
</style>
