<template>
  <div class="attribute-group">
    <button v-haptic @click="toggleExpanded" class="group-header">
      <span class="group-title">{{ title }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        :class="['expand-icon', { rotated: isExpanded }]"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>

    <Transition name="slide">
      <div v-if="isExpanded" class="attributes-container">
        <button
          v-haptic
          v-for="attribute in attributes"
          :key="attribute"
          @click="toggleAttribute(attribute)"
          :class="['attribute-chip', { selected: isSelected(attribute) }]"
        >
          {{ formatAttribute(attribute) }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DishAttribute, formatAttribute } from '../types'

const props = defineProps<{
  title: string
  attributes: DishAttribute[]
  selectedAttributes: DishAttribute[]
  defaultExpanded?: boolean
}>()

const emit = defineEmits<{
  toggle: [attribute: DishAttribute]
}>()

const isExpanded = ref(props.defaultExpanded ?? false)

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function toggleAttribute(attribute: DishAttribute) {
  emit('toggle', attribute)
}

function isSelected(attribute: DishAttribute): boolean {
  return props.selectedAttributes.includes(attribute)
}
</script>

<style scoped>
.attribute-group {
  @apply border-b border-gray-200 last:border-b-0;
}

.group-header {
  @apply w-full flex items-center justify-between py-4 px-2
         text-left hover:bg-gray-50 transition-all duration-200
         rounded-lg;
  min-height: 56px;
}

.group-title {
  @apply text-lg font-semibold text-gray-800;
}

.expand-icon {
  @apply w-6 h-6 text-gray-600 transition-transform duration-200;
}

.expand-icon.rotated {
  @apply rotate-180;
}

.attributes-container {
  @apply flex flex-wrap gap-2 pb-4 px-2;
}

.attribute-chip {
  @apply px-4 py-2 rounded-full font-medium transition-all duration-200
         border-2 cursor-pointer;
  min-height: 44px;
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #4b5563;
}

.attribute-chip:hover {
  background-color: #d1fae5;
  border-color: #6ee7b7;
}

.attribute-chip.selected {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}

.attribute-chip.selected:hover {
  background-color: #059669;
  border-color: #059669;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
