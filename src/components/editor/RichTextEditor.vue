<template>
  <div :class="['rich-text-editor', { 'rich-text-editor--compact': compact }]">
    <EditorToolbar
      v-if="editor"
      :editor="editor"
      :enabled-groups="enabledGroups"
    />
    <EditorContent :editor="editor" :class="editorContentClass" />
  </div>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import EditorToolbar from './EditorToolbar.vue'
import { useTipTapEditor } from './composables/useTipTapEditor'
import { tipTapToMarkdown } from './utils/markdownConverter'

interface Props {
  modelValue: string // Markdown content
  placeholder?: string
  compact?: boolean // Compact mode for modals
  enabledGroups?: string[] // Which toolbar groups to show
  editorContentClass?: string
  customExtensions?: any[] // Additional custom extensions
  enableHeadings?: boolean
  enableTasks?: boolean
  enableHorizontalRule?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Start writing...',
  compact: false,
  enabledGroups: () => ['text-style', 'lists'],
  editorContentClass: 'editor-content',
  customExtensions: () => [],
  enableHeadings: true,
  enableTasks: true,
  enableHorizontalRule: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { editor } = useTipTapEditor({
  initialMarkdown: props.modelValue,
  onUpdate: (markdown) => emit('update:modelValue', markdown),
  isMobile: window.innerWidth < 768,
  placeholder: props.placeholder,
  customExtensions: props.customExtensions,
  enableHeadings: props.enableHeadings,
  enableTasks: props.enableTasks,
  enableHorizontalRule: props.enableHorizontalRule
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (editor && !editor.isFocused) {
    const currentContent = tipTapToMarkdown(editor.getJSON())
    // Update only if different to avoid cursor jumps
    if (currentContent !== newValue) {
      const json = editor.getJSON()
      const currentMarkdown = tipTapToMarkdown(json)
      if (currentMarkdown !== newValue) {
        editor.commands.setContent(newValue)
      }
    }
  }
})

onUnmounted(() => {
  editor?.destroy()
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.rich-text-editor--compact {
  border-radius: 6px;
}

.editor-content {
  padding: 16px;
  min-height: 120px;
}

.rich-text-editor--compact .editor-content {
  padding: 12px;
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
}

/* TipTap editor base styles */
.editor-content :deep(.tiptap-editor) {
  min-height: 100%;
  outline: none;
}

.editor-content :deep(.ProseMirror) {
  min-height: 100%;
  outline: none;
  cursor: text;
}

.editor-content :deep(.ProseMirror:focus) {
  outline: none;
}

.editor-content :deep(.tiptap-editor p) {
  margin: 0 0 12px 0;
}

.editor-content :deep(.tiptap-editor h1) {
  font-size: 28px;
  font-weight: 700;
  margin: 20px 0 12px 0;
}

.editor-content :deep(.tiptap-editor h2) {
  font-size: 22px;
  font-weight: 600;
  margin: 16px 0 10px 0;
}

.editor-content :deep(.tiptap-editor h3) {
  font-size: 18px;
  font-weight: 600;
  margin: 14px 0 8px 0;
}

.editor-content :deep(.tiptap-editor ul),
.editor-content :deep(.tiptap-editor ol) {
  padding-left: 24px;
  margin: 0 0 12px 0;
}

.editor-content :deep(.tiptap-editor ul) {
  list-style-type: disc;
}

.editor-content :deep(.tiptap-editor ol) {
  list-style-type: decimal;
}

.editor-content :deep(.tiptap-editor li) {
  margin-bottom: 4px;
  display: list-item;
}

.editor-content :deep(.tiptap-editor blockquote) {
  border-left: 3px solid #8b5cf6;
  padding-left: 16px;
  margin: 12px 0;
  color: #6b7280;
}

.editor-content :deep(.tiptap-editor code) {
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.editor-content :deep(.tiptap-editor pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.editor-content :deep(.tiptap-editor pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.editor-content :deep(.tiptap-editor .editor-link) {
  color: #8b5cf6;
  text-decoration: underline;
  cursor: pointer;
}

.editor-content :deep(.tiptap-editor .task-item) {
  display: flex;
  align-items: start;
  gap: 8px;
}

.editor-content :deep(.tiptap-editor s) {
  text-decoration: line-through;
  color: #6b7280;
}

.editor-content :deep(.tiptap-editor hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 20px 0;
}

.editor-content :deep(.tiptap-editor p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #d1d5db;
  pointer-events: none;
  height: 0;
}

@media (max-width: 768px) {
  .rich-text-editor--compact .editor-content {
    padding: 12px;
    min-height: 180px;
    max-height: 40vh;
    overflow-y: auto;
  }
}
</style>
