<template>
  <Teleport to="body">
    <Transition name="keyboard">
      <div
        v-if="show"
        ref="keyboardContainer"
        class="floating-keyboard"
        :style="{ left: `${position.x}px`, top: `${position.y}px` }"
      >
        <div
          class="keyboard-header"
          @mousedown="startDrag"
          @touchstart="startDrag"
        >
          <div class="keyboard-drag-handle">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>
            <span>Keyboard</span>
          </div>
          <button
            type="button"
            class="keyboard-close"
            @click="close"
            @touchend.prevent="close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="keyboard-body">
          <div ref="keyboardRef" class="simple-keyboard"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Keyboard from 'simple-keyboard'
import 'simple-keyboard/build/css/index.css'

interface Props {
  show: boolean
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:show': [value: boolean]
  close: []
}>()

const keyboardRef = ref<HTMLElement | null>(null)
const keyboardContainer = ref<HTMLElement | null>(null)
let keyboardInstance: Keyboard | null = null

// Position state
const position = ref({ x: 50, y: window.innerHeight - 400 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// Initialize keyboard
watch(() => props.show, async (isShowing) => {
  if (isShowing) {
    await nextTick()
    if (keyboardRef.value && !keyboardInstance) {
      keyboardInstance = new Keyboard(keyboardRef.value, {
        onChange: (input) => {
          emit('update:modelValue', input)
        },
        onKeyPress: (button) => {
          if (button === '{enter}') {
            close()
          }
        },
        layout: {
          default: [
            '1 2 3 4 5 6 7 8 9 0 {bksp}',
            'q w e r t y u i o p',
            'a s d f g h j k l',
            '{shift} z x c v b n m {shift}',
            '{space} . {enter}'
          ],
          shift: [
            '! @ # $ % ^ & * ( ) {bksp}',
            'Q W E R T Y U I O P',
            'A S D F G H J K L',
            '{shift} Z X C V B N M {shift}',
            '{space} _ {enter}'
          ]
        },
        display: {
          '{bksp}': '⌫',
          '{enter}': '↵',
          '{shift}': '⇧',
          '{space}': 'Space'
        },
        theme: 'hg-theme-default hg-theme-touch'
      })
    }

    // Update keyboard value
    if (keyboardInstance) {
      keyboardInstance.setInput(props.modelValue)
    }
  }
}, { immediate: true })

// Sync external changes to keyboard
watch(() => props.modelValue, (newValue) => {
  if (keyboardInstance && keyboardInstance.getInput() !== newValue) {
    keyboardInstance.setInput(newValue)
  }
})

// Drag functionality
function startDrag(e: MouseEvent | TouchEvent) {
  isDragging.value = true

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  dragStart.value = {
    x: clientX - position.value.x,
    y: clientY - position.value.y
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return

  e.preventDefault()

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  position.value = {
    x: Math.max(0, Math.min(window.innerWidth - 400, clientX - dragStart.value.x)),
    y: Math.max(0, Math.min(window.innerHeight - 300, clientY - dragStart.value.y))
  }
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
}

function close() {
  emit('update:show', false)
  emit('close')
}

// Handle ESC key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (keyboardInstance) {
    keyboardInstance.destroy()
  }
})
</script>

<style scoped>
.floating-keyboard {
  @apply fixed z-[9999] bg-white rounded-lg shadow-2xl;
  width: 90vw;
  max-width: 600px;
  border: 2px solid #e5e7eb;
}

.keyboard-header {
  @apply flex items-center justify-between px-4 py-3 bg-gray-100 rounded-t-lg cursor-move select-none;
  touch-action: none;
}

.keyboard-drag-handle {
  @apply flex items-center gap-2 text-gray-600 font-medium;
}

.keyboard-close {
  @apply p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors;
  touch-action: manipulation;
}

.keyboard-body {
  @apply p-3;
}

.keyboard-enter-active,
.keyboard-leave-active {
  transition: all 0.3s ease;
}

.keyboard-enter-from,
.keyboard-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Simple keyboard customization */
:deep(.simple-keyboard) {
  background-color: transparent;
  font-family: inherit;
}

:deep(.hg-button) {
  @apply shadow-sm;
  height: 50px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #1f2937;
  font-weight: 500;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

:deep(.hg-button:active) {
  background: #3b82f6;
  color: white;
  transform: scale(0.95);
}

:deep(.hg-button.hg-functionBtn) {
  background: #f3f4f6;
  color: #6b7280;
}

:deep(.hg-button.hg-functionBtn:active) {
  background: #e5e7eb;
  color: #374151;
}

:deep(.hg-row) {
  margin-bottom: 8px;
}
</style>
