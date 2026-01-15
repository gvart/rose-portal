import { computed, h } from 'vue'
import type { Editor } from '@tiptap/vue-3'

export interface ToolbarAction {
  name: string
  title: string
  icon: any
  command: () => void
  isActive: () => boolean
}

export interface ToolbarGroup {
  name: string
  actions: ToolbarAction[]
}

export function useEditorToolbar(editor: Editor) {
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
      command: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold')
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
      command: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic')
    },
    {
      name: 'link',
      title: 'Add Link (Cmd+K)',
      icon: () =>
        h(
          'svg',
          { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
          h('path', {
            d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71m-4.71 4.71a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
            stroke: 'currentColor',
            'stroke-width': 2,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          })
        ),
      command: () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('Enter URL:', previousUrl || 'https://')

        // Cancelled
        if (url === null) {
          return
        }

        // Empty string - remove link
        if (url === '') {
          editor.chain().focus().extendMarkRange('link').unsetLink().run()
          return
        }

        // Update link
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      },
      isActive: () => editor.isActive('link')
    },
    {
      name: 'strike',
      title: 'Strikethrough',
      icon: () =>
        h(
          'svg',
          { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
          [
            h('path', { d: 'M3 12h18', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
            h('path', { d: 'M17 5H7a3 3 0 0 0 0 6h10a3 3 0 0 1 0 6H7', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
          ]
        ),
      command: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike')
    },
    {
      name: 'code',
      title: 'Inline Code',
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
      command: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive('code')
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
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 })
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
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 })
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
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 })
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
      command: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList')
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
      command: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList')
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
      command: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock')
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
      command: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote')
    },
    {
      name: 'horizontalRule',
      title: 'Horizontal Rule',
      icon: () =>
        h(
          'svg',
          { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
          h('path', {
            d: 'M3 12h18',
            stroke: 'currentColor',
            'stroke-width': 2,
            'stroke-linecap': 'round'
          })
        ),
      command: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: () => false
    }
  ])

  const toolbarGroups = computed<ToolbarGroup[]>(() => [
    {
      name: 'text-style',
      actions: [
        toolbarActions.value.find(a => a.name === 'bold'),
        toolbarActions.value.find(a => a.name === 'italic'),
        toolbarActions.value.find(a => a.name === 'strike'),
        toolbarActions.value.find(a => a.name === 'code'),
        toolbarActions.value.find(a => a.name === 'link')
      ].filter(Boolean) as ToolbarAction[]
    },
    {
      name: 'headings',
      actions: [
        toolbarActions.value.find(a => a.name === 'heading1'),
        toolbarActions.value.find(a => a.name === 'heading2'),
        toolbarActions.value.find(a => a.name === 'heading3')
      ].filter(Boolean) as ToolbarAction[]
    },
    {
      name: 'lists',
      actions: [
        toolbarActions.value.find(a => a.name === 'bulletList'),
        toolbarActions.value.find(a => a.name === 'orderedList')
      ].filter(Boolean) as ToolbarAction[]
    },
    {
      name: 'insert',
      actions: [
        toolbarActions.value.find(a => a.name === 'codeBlock'),
        toolbarActions.value.find(a => a.name === 'blockquote'),
        toolbarActions.value.find(a => a.name === 'horizontalRule')
      ].filter(Boolean) as ToolbarAction[]
    }
  ])

  return {
    toolbarActions,
    toolbarGroups
  }
}
