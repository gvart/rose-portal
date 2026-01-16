<template>
  <q-chip
    :label="tag.name"
    :outline="!filled"
    :style="chipStyles"
    size="sm"
    dense
  />
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
      color: 'white'
    }
  }
  return {
    backgroundColor: props.tag.color + '20',
    color: props.tag.color,
    borderColor: props.tag.color
  }
})
</script>
