<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)">
    <q-card class="configuration-edit-card">
      <q-card-section>
        <div class="row items-center q-pb-none">
          <div class="text-h6">{{ title }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeModal" />
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          ref="urlInputRef"
          v-model="localUrl"
          label="URL"
          type="url"
          outlined
          :placeholder="placeholder"
          :error="!!error"
          :error-message="error"
          @keydown.enter="handleSave"
          autofocus
        />
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn label="Cancel" flat @click="closeModal" />
        <q-btn
          label="Save"
          color="primary"
          unelevated
          :disable="!isValid"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useConfiguration } from '@/composables/useConfiguration'

interface Props {
  modelValue: boolean
  title: string
  currentValue: string
  placeholder: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [url: string]
}>()

const { validateUrl } = useConfiguration()

const localUrl = ref('')
const error = ref('')
const urlInputRef = ref<HTMLInputElement | null>(null)

const isValid = computed(() => {
  return localUrl.value.trim() !== '' && validateUrl(localUrl.value)
})

// Watch for modal open/close
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    localUrl.value = props.currentValue
    error.value = ''
    // Auto-focus the input when modal opens
    await nextTick()
    urlInputRef.value?.focus()
  }
})

function closeModal() {
  emit('update:modelValue', false)
}

function handleOverlayClick() {
  closeModal()
}

function handleSave() {
  error.value = ''

  if (!isValid.value) {
    error.value = 'Please enter a valid URL (http://, https://, ws://, or wss://)'
    return
  }

  emit('save', localUrl.value)
  closeModal()
}
</script>

<style scoped>
.configuration-edit-card {
  max-width: 448px;
  width: 100%;
}
</style>
