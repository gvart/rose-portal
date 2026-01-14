<template>
  <div class="chore-description-editor">
    <!-- Toolbar -->
    <div class="editor-toolbar">
      <button
        v-for="action in toolbarActions"
        :key="action.name"
        :class="['toolbar-btn', { active: action.isActive?.() }]"
        @click="action.command"
        @mousedown.prevent
        type="button"
        :title="action.title"
      >
        <component :is="action.icon" class="toolbar-icon" />
      </button>
    </div>

    <!-- Editor Content -->
    <editor-content :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { markdownToTipTap, tipTapToMarkdown } from '@/apps/notes/utils/markdownConverter'

interface Props {
  modelValue: string // Markdown string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Add details about this chore...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Editor instance
const editor = ref<Editor | null>(null)
const isMobile = window.innerWidth < 768

// Initialize editor
onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable headings for simplicity
        horizontalRule: false
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'chore-link',
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Placeholder.configure({
        placeholder: props.placeholder
      })
    ],
    content: markdownToTipTap(props.modelValue),
    editable: true,
    editorProps: {
      attributes: {
        class: isMobile ? 'tiptap-editor tiptap-editor--mobile' : 'tiptap-editor',
        spellcheck: 'true'
      }
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      const markdown = tipTapToMarkdown(json)
      emit('update:modelValue', markdown)
    }
  })
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (editor.value && !editor.value.isFocused) {
    const currentContent = tipTapToMarkdown(editor.value.getJSON())
    if (currentContent !== newValue) {
      editor.value.commands.setContent(markdownToTipTap(newValue))
    }
  }
})

// Cleanup
onBeforeUnmount(() => {
  editor.value?.destroy()
})

// Toolbar actions
const toolbarActions = computed(() => {
  if (!editor.value) return []

  return [
    {
      name: 'bold',
      title: 'Bold',
      icon: defineComponent({
        template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9m-9-6h9m-9 12h9m3-6V6a2 2 0 00-2-2h-7a2 2 0 00-2 2v12a2 2 0 002 2h7a2 2 0 002-2v-3"/></svg>`
      }),
      command: () => editor.value?.chain().focus().toggleBold().run(),
      isActive: () => editor.value?.isActive('bold')
    },
    {
      name: 'italic',
      title: 'Italic',
      icon: defineComponent({
        template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m8 4H6"/></svg>`
      }),
      command: () => editor.value?.chain().focus().toggleItalic().run(),
      isActive: () => editor.value?.isActive('italic')
    },
    {
      name: 'link',
      title: 'Add Link',
      icon: defineComponent({
        template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`
      }),
      command: () => {
        const previousUrl = editor.value?.getAttributes('link').href
        const url = window.prompt('Enter URL:', previousUrl)

        if (url === null) {
          return // User cancelled
        }

        if (url === '') {
          editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
          return
        }

        editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      },
      isActive: () => editor.value?.isActive('link')
    },
    {
      name: 'bulletList',
      title: 'Bullet List',
      icon: defineComponent({
        template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>`
      }),
      command: () => editor.value?.chain().focus().toggleBulletList().run(),
      isActive: () => editor.value?.isActive('bulletList')
    },
    {
      name: 'orderedList',
      title: 'Numbered List',
      icon: defineComponent({
        template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m-3 8h10m-10 4h10"/></svg>`
      }),
      command: () => editor.value?.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.value?.isActive('orderedList')
    }
  ]
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'
</script>

<style scoped>
.chore-description-editor {
  border: var(--depth-1-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-bg-primary);
}

.editor-toolbar {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-2);
  background: var(--color-bg-secondary);
  border-bottom: var(--depth-1-border);
  flex-wrap: wrap;
}

.toolbar-btn {
  min-width: var(--space-11);
  min-height: var(--space-11);
  width: var(--space-11);
  height: var(--space-11);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  padding: 0;
}

.toolbar-btn:active {
  background: var(--color-bg-active);
  transform: scale(0.95);
}

.toolbar-btn.active {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-secondary);
  color: var(--color-text-primary);
}

.toolbar-icon {
  width: 18px;
  height: 18px;
}

.editor-content {
  padding: var(--space-3);
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
}

/* TipTap editor styles */
.editor-content :deep(.tiptap) {
  outline: none;
  font-size: var(--font-size-14);
  color: var(--color-text-primary);
  line-height: 1.5;
}

.editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: var(--color-text-muted);
  pointer-events: none;
  float: left;
  height: 0;
}

.editor-content :deep(.tiptap p) {
  margin: 0;
}

.editor-content :deep(.tiptap p + p) {
  margin-top: var(--space-2);
}

.editor-content :deep(.tiptap a) {
  color: var(--color-accent-primary);
  text-decoration: underline;
  cursor: pointer;
}

.editor-content :deep(.tiptap strong) {
  font-weight: var(--font-weight-semibold);
}

.editor-content :deep(.tiptap em) {
  font-style: italic;
}

.editor-content :deep(.tiptap ul),
.editor-content :deep(.tiptap ol) {
  padding-left: var(--space-5);
  margin: var(--space-2) 0;
}

.editor-content :deep(.tiptap li) {
  margin: var(--space-1) 0;
}

.editor-content :deep(.tiptap code) {
  font-family: var(--font-mono);
  font-size: var(--font-size-13);
  background: var(--color-bg-tertiary);
  padding: 2px var(--space-1);
  border-radius: var(--radius-xs);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .editor-toolbar {
    gap: var(--space-2);
  }

  .toolbar-btn {
    min-width: var(--space-11);
    min-height: var(--space-11);
  }
}
</style>
