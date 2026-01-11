<template>
  <div v-if="note" class="mobile-note-view">
    <div class="mobile-note-view__header">
      <button class="back-btn" @click="$emit('back')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div class="mobile-note-view__status">
        <span v-if="notesStore.isSaving" class="status-text status-text--saving">Saving...</span>
        <span v-else-if="notesStore.lastSaved && !dirty" class="status-text status-text--saved">Saved</span>
      </div>
    </div>

    <div class="mobile-note-view__content">
      <input
        :value="notesStore.editorTitle"
        class="note-title-input"
        placeholder="Note title"
        @input="notesStore.updateEditorTitle(($event.target as HTMLInputElement).value)"
      />

      <!-- Tag section with selector -->
      <div class="mobile-note-tags-section">
        <!-- Display selected tags -->
        <div v-if="note.tags.length > 0" class="mobile-note-tags">
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

        <!-- Tag selector (compact mode for mobile) -->
        <TagSelector
          :available-tags="tagsStore.tags"
          :selected-tag-ids="note.tags.map(t => t.id)"
          :compact="true"
          @toggle="notesStore.toggleNoteTag($event)"
          @create-new="tagsStore.openTagManager()"
        />
      </div>

      <EditorToolbar v-if="editor" :editor="editor" />

      <EditorContent :editor="editor" class="editor-content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onUnmounted, onBeforeUnmount } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import { useTipTapEditor } from '../composables/useTipTapEditor'
import { markdownToTipTap, tipTapToMarkdown } from '../utils/markdownConverter'
import { useNotesStore } from '../stores/notesStore'
import { useTagsStore } from '../stores/tagsStore'
import { useAutoSave } from '../composables/useAutoSave'
import EditorToolbar from './EditorToolbar.vue'
import TagSelector from './TagSelector.vue'
import type { Note } from '../types/notes'

const props = defineProps<{
  note: Note | null
  content: string
  dirty: boolean
}>()

const emit = defineEmits<{
  back: []
  'update:content': [markdown: string]
  save: []
}>()

const notesStore = useNotesStore()
const tagsStore = useTagsStore()

const { editor } = useTipTapEditor({
  initialMarkdown: props.content,
  onUpdate: (markdown) => emit('update:content', markdown),
  isMobile: true
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
.mobile-note-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.mobile-note-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #374151;
}

.back-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.mobile-note-view__status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
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

.mobile-note-view__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}

.note-title-input {
  padding: 20px 16px 12px;
  font-size: 22px;
  font-weight: 600;
  border: none;
  outline: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.note-title-input::placeholder {
  color: #d1d5db;
}

.mobile-note-tags-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.mobile-note-view__content :deep(.editor-toolbar) {
  flex-shrink: 0;
}

.mobile-note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip--removable {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  background: none;
  min-height: 44px;
}

.tag-chip--removable:hover,
.tag-chip--removable:active {
  opacity: 0.8;
  transform: scale(1.05);
}

.tag-chip__remove {
  width: 12px;
  height: 12px;
}

.editor-content {
  flex: 1;
  padding: 16px;
  min-height: 300px;
  overflow: visible;
}

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
</style>
