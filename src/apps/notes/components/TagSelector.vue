<template>
  <div class="tag-selector">
    <!-- Button to expand/collapse -->
    <button
      @click="expanded = !expanded"
      class="tag-selector__toggle"
      :class="{ 'tag-selector__toggle--compact': compact }"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2V14M2 8H14"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <span>Add Tag</span>
    </button>

    <!-- Expanded tag grid -->
    <div v-if="expanded" class="tag-selector__grid" :class="{ 'tag-selector__grid--compact': compact }">
      <!-- Empty state -->
      <div v-if="availableTags.length === 0" class="tag-selector__empty">
        <p>No tags yet</p>
        <button @click="$emit('createNew')" class="tag-selector__create-first">
          Create your first tag
        </button>
      </div>

      <!-- Tag chips -->
      <template v-else>
        <button
          v-for="tag in availableTags"
          :key="tag.id"
          @click="handleToggle(tag.id)"
          class="tag-selector__chip"
          :class="{ 'tag-selector__chip--selected': isSelected(tag.id) }"
          :style="{
            backgroundColor: isSelected(tag.id) ? tag.color : 'transparent',
            borderColor: tag.color,
            color: isSelected(tag.id) ? 'white' : tag.color
          }"
        >
          {{ tag.name }}
          <svg v-if="isSelected(tag.id)" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Create new tag button -->
        <button @click="$emit('createNew')" class="tag-selector__create">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2V14M2 8H14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>New Tag</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Tag } from '../types/notes'

const props = defineProps<{
  availableTags: Tag[]
  selectedTagIds: number[]
  compact?: boolean
}>()

const emit = defineEmits<{
  toggle: [tagId: number]
  createNew: []
}>()

const expanded = ref(false)

function isSelected(tagId: number): boolean {
  return props.selectedTagIds.includes(tagId)
}

function handleToggle(tagId: number): void {
  emit('toggle', tagId)
  // Optionally auto-collapse after selection
  // expanded.value = false
}
</script>

<style scoped>
.tag-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-selector__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: transparent;
  border: 2px dashed rgba(139, 92, 246, 0.4);
  border-radius: 8px;
  color: #8b5cf6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.tag-selector__toggle:hover {
  background-color: rgba(139, 92, 246, 0.05);
  border-color: rgba(139, 92, 246, 0.6);
}

.tag-selector__toggle--compact {
  padding: 10px 18px;
  font-size: 15px;
}

.tag-selector__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.tag-selector__grid--compact {
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 14px;
}

.tag-selector__empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
}

.tag-selector__empty p {
  margin: 0;
  color: #9ca3af;
  font-size: 14px;
}

.tag-selector__create-first {
  padding: 8px 16px;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tag-selector__create-first:hover {
  background-color: #7c3aed;
}

.tag-selector__chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border: 2px solid;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.tag-selector__chip:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-selector__chip--selected {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.tag-selector__create {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  background-color: white;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.tag-selector__create:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
  background-color: rgba(139, 92, 246, 0.05);
}
</style>
