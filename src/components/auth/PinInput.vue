<template>
  <div class="pin-input-container">
    <div class="pin-dots">
      <div
        v-for="i in 4"
        :key="i"
        class="pin-dot"
        :class="{ filled: pin.length >= i }"
      />
    </div>

    <div class="pin-keypad">
      <button
        v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
        :key="num"
       
        class="keypad-button"
        @click="addDigit(num)"
      >
        {{ num }}
      </button>
      <div class="keypad-spacer"></div>
      <button
       
        class="keypad-button"
        @click="addDigit(0)"
      >
        0
      </button>
      <button
       
        class="keypad-button keypad-delete"
        @click="removeDigit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
        </svg>
      </button>
    </div>

    <p v-if="error" class="pin-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useHapticFeedback } from '@/composables/useHapticFeedback'

const props = defineProps<{
  modelValue: string
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  complete: [pin: string]
}>()

const { vibrate } = useHapticFeedback()
const pin = ref(props.modelValue)

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  pin.value = newValue
})

function addDigit(digit: number): void {
  if (pin.value.length < 4) {
    pin.value += digit.toString()
    emit('update:modelValue', pin.value)

    // Auto-submit when 4 digits entered
    if (pin.value.length === 4) {
      vibrate('medium')
      emit('complete', pin.value)
    }
  }
}

function removeDigit(): void {
  if (pin.value.length > 0) {
    pin.value = pin.value.slice(0, -1)
    emit('update:modelValue', pin.value)
  }
}
</script>

<style scoped>
.pin-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-4);
}

.pin-dots {
  display: flex;
  gap: var(--space-4);
}

.pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-bg-tertiary);
  border: 2px solid var(--color-border-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.pin-dot.filled {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
}

.pin-keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  max-width: 300px;
}

.keypad-button {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: var(--depth-1-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.keypad-button:active {
  transform: scale(0.95);
  background: var(--color-bg-tertiary);
}

.keypad-delete {
  background: var(--color-bg-secondary);
}

.keypad-spacer {
  width: 72px;
  height: 72px;
}

.pin-error {
  font-size: var(--font-size-13);
  color: var(--color-error-text);
  font-weight: var(--font-weight-medium);
  margin-top: var(--space-2);
}

@media (max-width: 640px) {
  .keypad-button {
    width: 64px;
    height: 64px;
    font-size: var(--font-size-20);
  }

  .keypad-spacer {
    width: 64px;
    height: 64px;
  }
}
</style>
