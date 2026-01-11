<template>
  <AppLayout title="Notes" theme-color="#8B5CF6">
    <div class="notes-app">
      <!-- Desktop Layout -->
      <div v-if="isDesktop" class="notes-desktop-layout">
        <!-- Left Sidebar: Notes List -->
        <aside class="notes-sidebar notes-sidebar--left">
          <NotesList
            :notes="notesStore.notes"
            :selected-id="notesStore.selectedNoteId"
            :loading="notesStore.loading"
            :has-more="notesStore.pagination.hasMore"
            @select="handleSelectNote"
            @create="handleCreateNote"
            @load-more="notesStore.loadMore()"
            @delete="handleDeleteNote"
          />
        </aside>

        <!-- Center: Editor -->
        <main class="notes-editor-panel">
          <NoteEditor
            v-if="notesStore.selectedNote"
            :note="notesStore.selectedNote"
            :content="notesStore.editorContent"
            :dirty="notesStore.editorDirty"
            @update:content="notesStore.updateEditorContent($event)"
            @save="handleSaveNote"
          />
          <EmptyNotesState v-else @create="handleCreateNote" />
        </main>

        <!-- Right Sidebar: Tag Filters -->
        <aside class="notes-sidebar notes-sidebar--right">
          <TagFilter
            :tags="tagsStore.tags"
            :selected-ids="tagsStore.selectedTagIds"
            @toggle="tagsStore.toggleTagFilter($event)"
            @clear="tagsStore.clearFilters()"
            @manage="tagsStore.openTagManager()"
          />
        </aside>
      </div>

      <!-- Mobile Layout -->
      <div v-else class="notes-mobile-layout">
        <!-- Show list if no note selected -->
        <NotesList
          v-if="!notesStore.selectedNoteId"
          :notes="notesStore.notes"
          :selected-id="notesStore.selectedNoteId"
          :loading="notesStore.loading"
          :has-more="notesStore.pagination.hasMore"
          @select="handleSelectNote"
          @create="handleCreateNote"
          @load-more="notesStore.loadMore()"
          @delete="handleDeleteNote"
        />

        <!-- Show detail if note selected -->
        <MobileNoteView
          v-else
          :note="notesStore.selectedNote"
          :content="notesStore.editorContent"
          :dirty="notesStore.editorDirty"
          @back="notesStore.selectNote(null)"
          @update:content="notesStore.updateEditorContent($event)"
          @save="handleSaveNote"
        />
      </div>

      <!-- Tag Manager Modal -->
      <TagManager
        v-model="tagsStore.showTagManager"
        :tags="tagsStore.tags"
        @create="tagsStore.createTag($event)"
        @update="tagsStore.updateTag($event.id, { name: $event.name, color: $event.color })"
        @delete="tagsStore.deleteTag($event)"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import AppLayout from '@/layouts/AppLayout.vue'
import NotesList from './components/NotesList.vue'
import NoteEditor from './components/NoteEditor.vue'
import MobileNoteView from './components/MobileNoteView.vue'
import TagFilter from './components/TagFilter.vue'
import TagManager from './components/TagManager.vue'
import EmptyNotesState from './components/EmptyNotesState.vue'
import { useNotesStore } from './stores/notesStore'
import { useTagsStore } from './stores/tagsStore'

const { isDesktop } = useDeviceDetection()
const notesStore = useNotesStore()
const tagsStore = useTagsStore()

async function handleSelectNote(noteId: number) {
  // Auto-save current note if there are unsaved changes
  if (notesStore.editorDirty && notesStore.selectedNote) {
    await handleSaveNote()
  }
  // Select the new note
  notesStore.selectNote(noteId)
}

async function handleCreateNote() {
  const newNote = await notesStore.createNote({
    name: 'Untitled Note',
    content: '',
    tagIds: []
  })
  if (newNote) {
    notesStore.selectNote(newNote.id)
  }
}

async function handleSaveNote() {
  if (notesStore.selectedNote) {
    await notesStore.updateNote(notesStore.selectedNote.id, {
      name: notesStore.editorTitle,
      content: notesStore.editorContent,
      tagIds: notesStore.selectedNote.tags.map((t) => t.id)
    })
  }
}

async function handleDeleteNote(noteId: number) {
  await notesStore.deleteNote(noteId)
}

onMounted(() => {
  tagsStore.fetchTags()
  notesStore.fetchNotes(true)
})

onUnmounted(() => {
  notesStore.resetStore()
})
</script>

<style scoped>
.notes-app {
  width: 100%;
  height: 100%;
}

.notes-desktop-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.notes-sidebar {
  background: white;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.notes-sidebar--left {
  width: 300px;
  flex-shrink: 0;
}

.notes-sidebar--right {
  width: 250px;
  flex-shrink: 0;
  border-right: none;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

.notes-editor-panel {
  flex: 1;
  overflow: auto;
  background: white;
}

.notes-mobile-layout {
  width: 100%;
  height: 100%;
}
</style>
