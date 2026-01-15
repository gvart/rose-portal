<template>
  <span
    class="tag-chip"
    :class="{ 'tag-chip--filled': filled }"
    :style="chipStyles"
  >
    {{ tag.name }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Tag } from '../types/notes'

const props = defineProps<{
  tag: Tag
  filled?: boolean
}>()

const chipStyles = computed(() => {
  if (props.filled) {
    return {
      backgroundColor: props.tag.color,
      color: 'white',
      borderColor: props.tag.color
    }
  }
  return {
    backgroundColor: props.tag.color + '20',
    color: props.tag.color,
    borderColor: props.tag.color
  }
})
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

.tag-chip--filled {
  opacity: 0.9;
  font-weight: 500;
  border: none;
}

@media (prefers-reduced-motion: reduce) {
  .tag-chip {
    transition: none !important;
  }
}
</style>
