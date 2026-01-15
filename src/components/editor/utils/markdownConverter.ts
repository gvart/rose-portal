import TurndownService from 'turndown'
import MarkdownIt from 'markdown-it'
import { generateHTML, type JSONContent } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

// ============================================================================
// Markdown Parser (markdown → HTML)
// ============================================================================

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true
})

// ============================================================================
// HTML to Markdown Converter (HTML → markdown)
// ============================================================================

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**'
})

// Add task list rule for Turndown
turndownService.addRule('taskListItems', {
  filter: (node) => {
    return (
      node.nodeName === 'LI' &&
      node.hasAttribute('data-type') &&
      node.getAttribute('data-type') === 'taskItem'
    )
  },
  replacement: (content, node) => {
    const isChecked = (node as HTMLElement).hasAttribute('data-checked')
    const checkbox = isChecked ? '[x]' : '[ ]'
    return `${checkbox} ${content}\n`
  }
})

// ============================================================================
// Converter Functions
// ============================================================================

/**
 * Convert markdown string to TipTap JSON format
 * @param markdown - Markdown string
 * @returns TipTap JSON content
 */
export function markdownToTipTap(markdown: string): JSONContent {
  if (!markdown || markdown.trim() === '') {
    return {
      type: 'doc',
      content: []
    }
  }

  // Convert markdown to HTML using markdown-it
  const html = md.render(markdown)

  // Convert HTML to TipTap JSON using generateHTML (reverse engineering)
  // This uses TipTap's HTML parser
  try {
    // TipTap can parse HTML directly, so we create a temporary element
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    // Generate TipTap JSON from HTML
    const json = htmlToTipTapJSON(html)
    return json
  } catch (error) {
    console.error('Failed to convert markdown to TipTap:', error)
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: markdown }]
        }
      ]
    }
  }
}

/**
 * Convert TipTap JSON to markdown string
 * @param json - TipTap JSON content
 * @returns Markdown string
 */
export function tipTapToMarkdown(json: JSONContent): string {
  if (!json || !json.content || json.content.length === 0) {
    return ''
  }

  try {
    // Convert TipTap JSON to HTML
    const html = generateHTML(json, [
      StarterKit,
      Link,
      TaskList,
      TaskItem
    ])

    // Convert HTML to markdown using turndown
    const markdown = turndownService.turndown(html)
    return markdown
  } catch (error) {
    console.error('Failed to convert TipTap to markdown:', error)
    return ''
  }
}

// ============================================================================
// Helper: HTML to TipTap JSON Parser
// ============================================================================

/**
 * Parse HTML string to TipTap JSON
 * This is a simplified parser that handles common markdown elements
 */
function htmlToTipTapJSON(html: string): JSONContent {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  return {
    type: 'doc',
    content: parseHTMLNodes(body.childNodes)
  }
}

/**
 * Parse HTML nodes to TipTap JSON nodes
 */
function parseHTMLNodes(nodes: NodeListOf<ChildNode>): JSONContent[] {
  const result: JSONContent[] = []

  nodes.forEach((node) => {
    const tipTapNode = parseHTMLNode(node)
    if (tipTapNode) {
      result.push(tipTapNode)
    }
  })

  return result
}

/**
 * Parse a single HTML node to TipTap JSON node
 */
function parseHTMLNode(node: ChildNode): JSONContent | null {
  // Text node
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    if (text.trim() === '') return null
    return { type: 'text', text }
  }

  // Element node
  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const element = node as HTMLElement
  const tagName = element.tagName.toLowerCase()

  switch (tagName) {
    case 'p':
      return {
        type: 'paragraph',
        content: parseHTMLNodes(element.childNodes)
      }

    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        type: 'heading',
        attrs: { level: parseInt(tagName[1]) },
        content: parseHTMLNodes(element.childNodes)
      }

    case 'ul':
      return {
        type: 'bulletList',
        content: parseHTMLNodes(element.childNodes)
      }

    case 'ol':
      return {
        type: 'orderedList',
        content: parseHTMLNodes(element.childNodes)
      }

    case 'li':
      return {
        type: 'listItem',
        content: parseHTMLNodes(element.childNodes)
      }

    case 'blockquote':
      return {
        type: 'blockquote',
        content: parseHTMLNodes(element.childNodes)
      }

    case 'pre':
      const codeElement = element.querySelector('code')
      const codeText = codeElement ? codeElement.textContent || '' : element.textContent || ''
      return {
        type: 'codeBlock',
        content: [{ type: 'text', text: codeText }]
      }

    case 'code':
      return {
        type: 'text',
        marks: [{ type: 'code' }],
        text: element.textContent || ''
      }

    case 'strong':
    case 'b':
      return parseInlineNode(element, 'bold')

    case 'em':
    case 'i':
      return parseInlineNode(element, 'italic')

    case 'a':
      return parseLink(element)

    case 'br':
      return { type: 'hardBreak' }

    case 'hr':
      return { type: 'horizontalRule' }

    default:
      // For unknown tags, parse children
      const children = parseHTMLNodes(element.childNodes)
      return children.length > 0 ? children[0] : null
  }
}

/**
 * Parse inline node with marks (bold, italic, etc.)
 */
function parseInlineNode(element: HTMLElement, markType: string): JSONContent | null {
  const children = parseHTMLNodes(element.childNodes)

  // Add mark to all text children
  return {
    type: 'text',
    marks: [{ type: markType }],
    text: element.textContent || ''
  }
}

/**
 * Parse link element
 */
function parseLink(element: HTMLElement): JSONContent | null {
  const href = element.getAttribute('href') || ''
  return {
    type: 'text',
    marks: [{ type: 'link', attrs: { href } }],
    text: element.textContent || ''
  }
}
