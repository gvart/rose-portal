<template>
  <div v-if="note" class="note-editor">
    <div class="note-editor__header">
      <input
        ref="titleInputRef"
        :value="notesStore.editorTitle"
        class="note-title-input"
        placeholder="Note title"
        @input="notesStore.updateEditorTitle(($event.target as HTMLInputElement).value)"
      />

      <div class="note-editor__status">
        <span v-if="notesStore.isSaving" class="status-text status-text--saving">Saving...</span>
        <span v-else-if="notesStore.lastSaved && !dirty" class="status-text status-text--saved">Saved</span>
      </div>
    </div>

    <!-- Tag section with selector -->
    <div class="note-editor__tags-section">
      <!-- Display selected tags -->
      <div v-if="note.tags.length > 0" class="note-editor__tags">
        <button
          v-for="tag in note.tags"
          :key="tag.id"
          @click="notesStore.removeTagFromNote(tag.id)"
          class="tag-chip tag-chip--removable"
          :style="{ backgroundColor: tag.color, borderColor: tag.color }"
        >
          {{ tag.name }}
          <svg class="tag-chip__remove" width="12" height="12" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <!-- Tag selector -->
      <TagSelector
        :available-tags="tagsStore.tags"
        :selected-tag-ids="note.tags.map(t => t.id)"
        @toggle="notesStore.toggleNoteTag($event)"
        @create-new="tagsStore.openTagManager()"
      />
    </div>

    <EditorToolbar v-if="editor" :editor="editor" />

    <EditorContent :editor="editor" class="note-editor__content" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import { useTipTapEditor } from '@/components/editor/composables/useTipTapEditor'
import { markdownToTipTap, tipTapToMarkdown } from '@/components/editor/utils/markdownConverter'
import { useNotesStore } from '../stores/notesStore'
import { useTagsStore } from '../stores/tagsStore'
import { useAutoSave } from '../composables/useAutoSave'
import EditorToolbar from '@/components/editor/EditorToolbar.vue'
import TagSelector from './TagSelector.vue'
import type { Note } from '../types/notes'

const titleInputRef = ref<HTMLInputElement | null>(null)

const props = defineProps<{
  note: Note | null
  content: string
  dirty: boolean
}>()

const emit = defineEmits<{
  'update:content': [markdown: string]
  save: []
}>()

const { isMobileOrTablet } = useDeviceDetection()
const notesStore = useNotesStore()
const tagsStore = useTagsStore()

const { editor } = useTipTapEditor({
  initialMarkdown: props.content,
  onUpdate: (markdown) => emit('update:content', markdown),
  isMobile: isMobileOrTablet.value
})

// Auto-save setup
const { scheduleSave, saveNow, cancelSave } = useAutoSave({
  delay: 3000,
  onSave: async () => {
    if (props.dirty) {
      emit('save')
    }
  }
})

// Watch for content changes and schedule auto-save
watch(
  () => props.dirty,
  (isDirty) => {
    if (isDirty) {
      scheduleSave()
    }
  }
)

// Watch for note changes (when switching between notes)
watch(
  () => props.note?.id,
  (newNoteId, oldNoteId) => {
    if (newNoteId !== oldNoteId) {
      // Cancel any pending auto-save
      cancelSave()

      if (props.note && editor) {
        // Update editor content when switching notes
        if (props.content !== tipTapToMarkdown(editor.getJSON())) {
          editor.commands.setContent(markdownToTipTap(props.content))
        }
      }
    }
  }
)

// Autofocus title input when note is opened
onMounted(() => {
  if (titleInputRef.value && !props.note?.title) {
    // Only autofocus if this is a new note (no title)
    titleInputRef.value.focus()
  }
})

// Watch for note changes to autofocus on new note
watch(
  () => props.note?.id,
  (newId, oldId) => {
    if (newId !== oldId && titleInputRef.value && !props.note?.title) {
      // Autofocus when switching to a new note
      setTimeout(() => {
        titleInputRef.value?.focus()
      }, 100)
    }
  }
)

// Save immediately before unmount if there are unsaved changes
onBeforeUnmount(async () => {
  if (props.dirty) {
    await saveNow()
  }
})

onUnmounted(() => {
  editor?.destroy()
})
</script>

<style scoped>
.note-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.note-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.note-title-input {
  flex: 1;
  font-size: 24px;
  font-weight: 600;
  border: none;
  outline: none;
  padding: 8px 0;
}

.note-title-input::placeholder {
  color: #d1d5db;
}

.note-editor__status {
  display: flex;
  align-items: center;
  min-width: 80px;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
}

.status-text--saving {
  color: #8b5cf6;
}

.status-text--saved {
  color: #10b981;
}

.note-editor__tags-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.note-editor__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip--removable {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  background: none;
}

.tag-chip--removable:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.tag-chip__remove {
  width: 12px;
  height: 12px;
}

.note-editor__content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.note-editor__content :deep(.tiptap-editor) {
  min-height: 100%;
  outline: none;
}

.note-editor__content :deep(.ProseMirror) {
  min-height: 100%;
  outline: none;
  cursor: text;
}

.note-editor__content :deep(.ProseMirror:focus) {
  outline: none;
}

.note-editor__content :deep(.tiptap-editor p) {
  margin: 0 0 16px 0;
}

.note-editor__content :deep(.tiptap-editor h1) {
  font-size: 32px;
  font-weight: 700;
  margin: 24px 0 16px 0;
}

.note-editor__content :deep(.tiptap-editor h2) {
  font-size: 24px;
  font-weight: 600;
  margin: 20px 0 12px 0;
}

.note-editor__content :deep(.tiptap-editor h3) {
  font-size: 20px;
  font-weight: 600;
  margin: 16px 0 8px 0;
}

.note-editor__content :deep(.tiptap-editor ul),
.note-editor__content :deep(.tiptap-editor ol) {
  padding-left: 24px;
  margin: 0 0 16px 0;
}

.note-editor__content :deep(.tiptap-editor ul) {
  list-style-type: disc;
}

.note-editor__content :deep(.tiptap-editor ol) {
  list-style-type: decimal;
}

.note-editor__content :deep(.tiptap-editor li) {
  margin-bottom: 4px;
  display: list-item;
}

.note-editor__content :deep(.tiptap-editor blockquote) {
  border-left: 3px solid #8b5cf6;
  padding-left: 16px;
  margin: 16px 0;
  color: #6b7280;
}

.note-editor__content :deep(.tiptap-editor code) {
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.note-editor__content :deep(.tiptap-editor pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.note-editor__content :deep(.tiptap-editor pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.note-editor__content :deep(.tiptap-editor .note-link) {
  color: #8b5cf6;
  text-decoration: underline;
  cursor: pointer;
}

.note-editor__content :deep(.tiptap-editor .task-item) {
  display: flex;
  align-items: start;
  gap: 8px;
}

.note-editor__content :deep(.tiptap-editor p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #d1d5db;
  pointer-events: none;
  height: 0;
}

/* Strikethrough */
.note-editor__content :deep(.tiptap-editor s) {
  text-decoration: line-through;
  color: #6b7280;
}

/* Horizontal Rule */
.note-editor__content :deep(.tiptap-editor hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 24px 0;
}
</style>
