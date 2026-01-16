<template>
  <!-- Pi5: Use simple textarea with keyboard support -->
  <div v-if="isPi5" class="pi5-editor-container">
    <textarea
      :value="plainTextValue"
      @input="handleInput"
      :placeholder="placeholder"
      :readonly="true"
      @click="emit('focus')"
      class="pi5-textarea"
    />
  </div>

  <!-- Desktop/Tablet: Use rich text editor -->
  <q-editor
    v-else
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :placeholder="placeholder"
    :toolbar="toolbar"
    min-height="180px"
    class="chore-editor"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDeviceDetection } from '@/composables/useDeviceDetection'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Add details about this chore...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: []
}>()

const { isPi5 } = useDeviceDetection()

// Convert HTML to plain text for Pi5 display
const plainTextValue = computed(() => {
  if (isPi5.value && props.modelValue) {
    const div = document.createElement('div')
    div.innerHTML = props.modelValue
    return div.textContent || div.innerText || ''
  }
  return props.modelValue
})

function handleInput(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
}

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

/* Pi5 Simple Textarea */
.pi5-editor-container {
  position: relative;
  width: 100%;
}

.pi5-textarea {
  width: 100%;
  min-height: 120px;
  max-height: 200px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
  background-color: #fafafa;
  cursor: pointer;
}

.pi5-textarea:focus {
  border-color: #3b82f6;
  background-color: white;
}

.pi5-textarea::placeholder {
  color: #9ca3af;
}

/* Compact mode adjustments */
@media (max-height: 768px) {
  .pi5-textarea {
    min-height: 80px;
    max-height: 150px;
    padding: 8px;
    font-size: 12px;
  }
}
</style>
