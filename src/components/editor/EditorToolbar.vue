<template>
  <div class="editor-toolbar-wrapper">
    <div
      ref="toolbarRef"
      class="editor-toolbar"
      @scroll="handleScroll"
    >
      <template v-for="(group, index) in visibleGroups" :key="group.name">
        <div class="toolbar-group">
          <button
            v-for="action in group.actions"
            :key="action.name"
            :class="['toolbar-btn', { 'toolbar-btn--active': action.isActive() }]"
            :title="action.title"
            :aria-label="action.title"
            :aria-pressed="action.isActive()"
            @click="action.command"
            type="button"
          >
            <component :is="action.icon" />
          </button>
        </div>

        <div
          v-if="index < visibleGroups.length - 1"
          class="toolbar-separator"
        />
      </template>
    </div>

    <!-- Scroll fade indicators -->
    <div v-if="showLeftFade" class="toolbar-fade toolbar-fade--left" />
    <div v-if="showRightFade" class="toolbar-fade toolbar-fade--right" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { useEditorToolbar } from './composables/useEditorToolbar'

interface Props {
  editor: Editor
  enabledGroups?: string[] // Filter which groups to show
}

const props = withDefaults(defineProps<Props>(), {
  enabledGroups: () => ['text-style', 'headings', 'lists', 'insert']
})

const toolbarRef = ref<HTMLElement | null>(null)
const showLeftFade = ref(false)
const showRightFade = ref(false)

// Get all toolbar actions
const { toolbarGroups } = useEditorToolbar(props.editor)

// Filter groups based on enabled list
const visibleGroups = computed(() =>
  toolbarGroups.value.filter(group =>
    props.enabledGroups.includes(group.name)
  )
)

function handleScroll() {
  if (!toolbarRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = toolbarRef.value
  showLeftFade.value = scrollLeft > 0
  showRightFade.value = scrollLeft < scrollWidth - clientWidth - 5
}

onMounted(() => {
  handleScroll()
  window.addEventListener('resize', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleScroll)
})
</script>

<style scoped>
.editor-toolbar-wrapper {
  position: relative;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #fafafa;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  position: relative;
  z-index: 0;
}

.editor-toolbar::-webkit-scrollbar {
  display: none;
}

.toolbar-group {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.toolbar-separator {
  width: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 4px;
  flex-shrink: 0;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #4b5563;
  flex-shrink: 0;
}

.toolbar-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.toolbar-btn--active {
  background-color: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  border-color: #8b5cf6;
}

.toolbar-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.toolbar-btn:focus {
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  .toolbar-btn {
    transition: none !important;
  }
}

.toolbar-fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  pointer-events: none;
  z-index: 1;
}

.toolbar-fade--left {
  left: 0;
  background: linear-gradient(to right, #fafafa, transparent);
}

.toolbar-fade--right {
  right: 0;
  background: linear-gradient(to left, #fafafa, transparent);
}
</style>
