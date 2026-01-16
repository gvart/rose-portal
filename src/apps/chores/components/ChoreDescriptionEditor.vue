<template>
  <q-editor
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :placeholder="placeholder"
    :toolbar="toolbar"
    min-height="180px"
    class="chore-editor"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Add details about this chore...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Simplified toolbar with only text style and lists
const toolbar = [
  ['bold', 'italic', 'underline'],
  ['unordered', 'ordered']
]
</script>

<style scoped>
.chore-editor {
  min-height: 400px;
  max-height: 500px;
}

@media (max-width: 768px) {
  .chore-editor {
    min-height: 180px;
    max-height: 40vh;
  }
}
</style>
