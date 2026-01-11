<template>
  <div class="editor-toolbar">
    <button
      v-for="action in toolbarActions"
      :key="action.name"
      :class="['toolbar-btn', { 'toolbar-btn--active': action.isActive() }]"
      :title="action.title"
      @click="action.command"
    >
      <component :is="action.icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{
  editor: Editor
}>()

interface ToolbarAction {
  name: string
  title: string
  icon: any
  command: () => void
  isActive: () => boolean
}

const toolbarActions = computed<ToolbarAction[]>(() => [
  {
    name: 'bold',
    title: 'Bold (Cmd+B)',
    icon: () =>
      h(
        'svg',
        { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
        h('path', {
          d: 'M6 12h8a4 4 0 1 0 0-8H6v8Zm0 0h9a4 4 0 1 1 0 8H6v-8Z',
          stroke: 'currentColor',
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })
      ),
    command: () => props.editor.chain().focus().toggleBold().run(),
    isActive: () => props.editor.isActive('bold')
  },
  {
    name: 'italic',
    title: 'Italic (Cmd+I)',
    icon: () =>
      h(
        'svg',
        { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
        h('path', {
          d: 'M19 4h-9m4 16H5M15 4 9 20',
          stroke: 'currentColor',
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })
      ),
    command: () => props.editor.chain().focus().toggleItalic().run(),
    isActive: () => props.editor.isActive('italic')
  },
  {
    name: 'heading1',
    title: 'Heading 1',
    icon: () =>
      h(
        'svg',
        { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
        h('text', { x: 2, y: 18, 'font-size': 16, 'font-weight': 'bold', fill: 'currentColor' }, 'H1')
      ),
    command: () => props.editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => props.editor.isActive('heading', { level: 1 })
  },
  {
    name: 'heading2',
    title: 'Heading 2',
    icon: () =>
      h(
        'svg',
        { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
        h('text', { x: 2, y: 18, 'font-size': 16, 'font-weight': 'bold', fill: 'currentColor' }, 'H2')
      ),
    command: () => props.editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => props.editor.isActive('heading', { level: 2 })
  },
  {
    name: 'heading3',
    title: 'Heading 3',
    icon: () =>
      h(
        'svg',
        { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
        h('text', { x: 2, y: 18, 'font-size': 16, 'font-weight': 'bold', fill: 'currentColor' }, 'H3')
      ),
    command: () => props.editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => props.editor.isActive('heading', { level: 3 })
  },
  {
    name: 'bulletList',
    title: 'Bullet List',
    icon: () =>
      h(
        'svg',
        { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
        [
          h('circle', { cx: 6, cy: 6, r: 1.5, fill: 'currentColor' }),
          h('circle', { cx: 6, cy: 12, r: 1.5, fill: 'currentColor' }),
          h('circle', { cx: 6, cy: 18, r: 1.5, fill: 'currentColor' }),
          h('line', { x1: 10, y1: 6, x2: 20, y2: 6, stroke: 'currentColor', 'stroke-width': 2 }),
          h('line', { x1: 10, y1: 12, x2: 20, y2: 12, stroke: 'currentColor', 'stroke-width': 2 }),
          h('line', { x1: 10, y1: 18, x2: 20, y2: 18, stroke: 'currentColor', 'stroke-width': 2 })
        ]
      ),
    command: () => props.editor.chain().focus().toggleBulletList().run(),
    isActive: () => props.editor.isActive('bulletList')
  },
  {
    name: 'orderedList',
    title: 'Numbered List',
    icon: () =>
      h(
        'svg',
        { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
        [
          h('text', { x: 3, y: 8, 'font-size': 10, fill: 'currentColor' }, '1.'),
          h('text', { x: 3, y: 14, 'font-size': 10, fill: 'currentColor' }, '2.'),
          h('text', { x: 3, y: 20, 'font-size': 10, fill: 'currentColor' }, '3.'),
          h('line', { x1: 10, y1: 6, x2: 20, y2: 6, stroke: 'currentColor', 'stroke-width': 2 }),
          h('line', { x1: 10, y1: 12, x2: 20, y2: 12, stroke: 'currentColor', 'stroke-width': 2 }),
          h('line', { x1: 10, y1: 18, x2: 20, y2: 18, stroke: 'currentColor', 'stroke-width': 2 })
        ]
      ),
    command: () => props.editor.chain().focus().toggleOrderedList().run(),
    isActive: () => props.editor.isActive('orderedList')
  },
  {
    name: 'codeBlock',
    title: 'Code Block',
    icon: () =>
      h(
        'svg',
        { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
        h('path', {
          d: 'M8 8l-4 4 4 4m8-8l4 4-4 4',
          stroke: 'currentColor',
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })
      ),
    command: () => props.editor.chain().focus().toggleCodeBlock().run(),
    isActive: () => props.editor.isActive('codeBlock')
  },
  {
    name: 'blockquote',
    title: 'Blockquote',
    icon: () =>
      h(
        'svg',
        { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
        h('path', {
          d: 'M6 15h15M6 11h15M6 7h15',
          stroke: 'currentColor',
          'stroke-width': 2,
          'stroke-linecap': 'round'
        })
      ),
    command: () => props.editor.chain().focus().toggleBlockquote().run(),
    isActive: () => props.editor.isActive('blockquote')
  }
])
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #fafafa;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
}

.toolbar-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.toolbar-btn--active {
  background-color: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  border-color: #8b5cf6;
}
</style>
