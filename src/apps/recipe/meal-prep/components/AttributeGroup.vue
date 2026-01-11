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
.group-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-2);
  text-align: left;
  transition: all var(--duration-fast) var(--ease-in-out);
  border-radius: var(--radius-md);
  min-height: 56px;
}

.group-header:active {
  background: var(--color-bg-secondary);
}

.group-title {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.expand-icon {
  width: 24px;
  height: 24px;
  color: var(--color-text-secondary);
  transition: transform var(--duration-fast) var(--ease-in-out);
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.attributes-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  padding-left: var(--space-2);
  padding-right: var(--space-2);
}

.attribute-chip {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--ease-in-out);
  border: 2px solid var(--color-border-primary);
  cursor: pointer;
  min-height: 44px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.attribute-chip:active:not(.selected) {
  background-color: var(--color-success-bg);
  border-color: var(--color-success-border);
}

.attribute-chip.selected {
  background-color: var(--color-success-solid);
  border-color: var(--color-success-solid);
  color: white;
}

.attribute-chip.selected:active {
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
