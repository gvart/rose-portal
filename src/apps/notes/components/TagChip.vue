<template>
  <span
    class="tag-chip"
    :style="{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }"
  >
    {{ tag.name }}
  </span>
</template>

<script setup lang="ts">
import type { Tag } from '../types/notes'

defineProps<{
  tag: Tag
}>()
</script>

<style scoped>
.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
  white-space: nowrap;
  transition: all 0.2s ease;
}
</style>
