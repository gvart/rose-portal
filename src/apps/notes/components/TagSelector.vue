<template>
  <div class="tag-selector">
    <!-- Button to expand/collapse -->
    <q-btn
      label="Add Tag"
      icon="add"
      outline
      color="primary"
      @click="expanded = !expanded"
      :class="{ 'tag-selector__toggle--compact': compact }"
    />

    <!-- Expanded tag grid -->
    <div v-if="expanded" class="tag-selector__grid" :class="{ 'tag-selector__grid--compact': compact }">
      <!-- Empty state -->
      <div v-if="availableTags.length === 0" class="tag-selector__empty">
        <p class="text-grey-6">No tags yet</p>
        <q-btn
          label="Create your first tag"
          color="primary"
          unelevated
          @click="$emit('createNew')"
        />
      </div>

      <!-- Tag chips -->
      <template v-else>
        <q-chip
          v-for="tag in availableTags"
          :key="tag.id"
          :label="tag.name"
          :icon-right="isSelected(tag.id) ? 'check' : undefined"
          clickable
          :outline="!isSelected(tag.id)"
          :style="{
            backgroundColor: isSelected(tag.id) ? tag.color : 'transparent',
            borderColor: tag.color,
            color: isSelected(tag.id) ? 'white' : tag.color
          }"
          @click="handleToggle(tag.id)"
          class="tag-selector__chip"
        />

        <!-- Create new tag button -->
        <q-btn
          label="New Tag"
          icon="add"
          outline
          color="grey-6"
          @click="$emit('createNew')"
          class="tag-selector__create"
        />
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

.tag-selector__chip {
  min-height: 44px;
}

.tag-selector__create {
  min-height: 44px;
}
</style>
