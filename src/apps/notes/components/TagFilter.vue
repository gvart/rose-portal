<template>
  <div class="tag-filter">
    <div class="tag-filter__header q-pa-md">
      <div class="text-subtitle1 text-weight-semibold">Tags</div>
      <q-btn
        icon="add"
        flat
        round
        dense
        @click="$emit('manage')"
      />
    </div>

    <div v-if="tags.length === 0" class="tag-filter__empty q-pa-lg text-center">
      <p class="text-grey-6 q-mb-md">No tags yet</p>
      <q-btn
        label="Create Tag"
        color="primary"
        unelevated
        @click="$emit('manage')"
      />
    </div>

    <q-list v-else class="tag-filter__list">
      <q-item
        v-for="tag in tags"
        :key="tag.id"
        clickable
        @click="$emit('toggle', tag.id)"
        :active="selectedIds.includes(tag.id)"
        active-class="bg-primary-1"
      >
        <q-item-section side>
          <q-checkbox
            :model-value="selectedIds.includes(tag.id)"
            @update:model-value="$emit('toggle', tag.id)"
          />
        </q-item-section>
        <q-item-section avatar>
          <div class="tag-color" :style="{ backgroundColor: tag.color }"></div>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ tag.name }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="selectedIds.length > 0" class="q-pa-md">
      <q-btn
        label="Clear Filters"
        color="primary"
        outline
        @click="$emit('clear')"
        class="full-width"
      />
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.tag-filter__list {
  flex: 1;
  overflow-y: auto;
}

.tag-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>
