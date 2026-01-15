import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { markdownToTipTap, tipTapToMarkdown } from '../utils/markdownConverter'

export interface UseTipTapEditorOptions {
  initialMarkdown: string
  onUpdate: (markdown: string) => void
  isMobile?: boolean
  placeholder?: string
  customExtensions?: any[] // Allow apps to add custom extensions
  enableHeadings?: boolean
  enableTasks?: boolean
  enableHorizontalRule?: boolean
}

/**
 * Initialize TipTap editor with markdown support
 * @param options - Editor configuration options
 * @returns Editor instance
 */
export function useTipTapEditor(options: UseTipTapEditorOptions) {
  const {
    initialMarkdown,
    onUpdate,
    isMobile = false,
    placeholder = 'Start writing your note...',
    customExtensions = [],
    enableHeadings = true,
    enableTasks = true,
    enableHorizontalRule = true
  } = options

  const extensions = [
    StarterKit.configure({
      heading: enableHeadings ? { levels: [1, 2, 3] } : false,
      horizontalRule: enableHorizontalRule ? {} : false
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'editor-link',
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    }),
    Placeholder.configure({
      placeholder
    }),
    ...customExtensions
  ]

  // Add task extensions if enabled
  if (enableTasks) {
    extensions.push(
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item'
        }
      })
    )
  }

  const editor = new Editor({
    extensions,
    content: markdownToTipTap(initialMarkdown),
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
      onUpdate(markdown)
    }
  })

  return { editor }
}
