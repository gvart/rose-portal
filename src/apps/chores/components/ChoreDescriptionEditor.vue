<template>
  <RichTextEditor
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :placeholder="placeholder"
    :compact="true"
    :enabled-groups="['text-style', 'lists']"
    :enable-headings="false"
    :enable-tasks="false"
    :enable-horizontal-rule="false"
    editor-content-class="chore-editor-content"
  />
</template>

<script setup lang="ts">
import RichTextEditor from '@/components/editor/RichTextEditor.vue'

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
</script>

<style scoped>
:deep(.chore-editor-content) {
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  :deep(.chore-editor-content) {
    min-height: 180px;
    max-height: 40vh;
  }
}
</style>
