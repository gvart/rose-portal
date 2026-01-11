<template>
  <div class="tag-filter">
    <div class="tag-filter__header">
      <h3 class="tag-filter__title">Tags</h3>
      <button class="tag-filter__manage-btn" @click="$emit('manage')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2V14M2 8H14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <div v-if="tags.length === 0" class="tag-filter__empty">
      <p>No tags yet</p>
      <button class="tag-filter__create-btn" @click="$emit('manage')">Create Tag</button>
    </div>

    <div v-else class="tag-filter__list">
      <label
        v-for="tag in tags"
        :key="tag.id"
        class="tag-filter__item"
        :class="{ 'tag-filter__item--selected': selectedIds.includes(tag.id) }"
      >
        <input
          type="checkbox"
          :checked="selectedIds.includes(tag.id)"
          class="tag-filter__checkbox"
          @change="$emit('toggle', tag.id)"
        />
        <span class="tag-filter__color" :style="{ backgroundColor: tag.color }"></span>
        <span class="tag-filter__name">{{ tag.name }}</span>
      </label>
    </div>

    <div v-if="selectedIds.length > 0" class="tag-filter__footer">
      <button class="tag-filter__clear-btn" @click="$emit('clear')">Clear Filters</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tag } from '../types/notes'

defineProps<{
  tags: Tag[]
  selectedIds: number[]
}>()

defineEmits<{
  toggle: [tagId: number]
  clear: []
  manage: []
}>()
</script>

<style scoped>
.tag-filter {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

.tag-filter__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.tag-filter__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.tag-filter__manage-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #6b7280;
}

.tag-filter__manage-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.tag-filter__empty {
  padding: 32px 16px;
  text-align: center;
  color: #6b7280;
}

.tag-filter__empty p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.tag-filter__create-btn {
  padding: 8px 16px;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tag-filter__create-btn:hover {
  background-color: #7c3aed;
}

.tag-filter__list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.tag-filter__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tag-filter__item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.tag-filter__item--selected {
  background-color: rgba(139, 92, 246, 0.1);
}

.tag-filter__checkbox {
  cursor: pointer;
}

.tag-filter__color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-filter__name {
  flex: 1;
  font-size: 14px;
}

.tag-filter__footer {
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.tag-filter__clear-btn {
  width: 100%;
  padding: 8px;
  background-color: transparent;
  color: #8b5cf6;
  border: 1px solid #8b5cf6;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-filter__clear-btn:hover {
  background-color: rgba(139, 92, 246, 0.1);
}
</style>
