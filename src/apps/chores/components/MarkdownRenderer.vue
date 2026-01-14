<template>
  <div
    class="markdown-renderer"
    :class="maxLinesClass"
    v-html="renderedHtml"
    @click.stop="handleClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

interface Props {
  markdown: string
  maxLines?: number // Default: 3
}

const props = withDefaults(defineProps<Props>(), {
  maxLines: 3
})

// Initialize markdown-it with security settings
const md = new MarkdownIt({
  html: false, // Disable HTML tags for security
  breaks: true, // Convert \n to <br>
  linkify: true // Auto-detect URLs and linkify
})

// Add target="_blank" to all links
const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  // Add target="_blank" and rel="noopener noreferrer" to all links
  const token = tokens[idx]
  const aIndex = token.attrIndex('target')

  if (aIndex < 0) {
    token.attrPush(['target', '_blank']) // add new attribute
  } else {
    if (token.attrs) {
      token.attrs[aIndex][1] = '_blank' // replace value of existing attr
    }
  }

  const relIndex = token.attrIndex('rel')
  if (relIndex < 0) {
    token.attrPush(['rel', 'noopener noreferrer'])
  } else {
    if (token.attrs) {
      token.attrs[relIndex][1] = 'noopener noreferrer'
    }
  }

  // Pass token to default renderer
  return defaultRender(tokens, idx, options, env, self)
}

const renderedHtml = computed(() => {
  if (!props.markdown) return ''
  return md.render(props.markdown)
})

const maxLinesClass = computed(() => {
  return props.maxLines ? `clamp-${props.maxLines}` : ''
})

function handleClick(event: MouseEvent): void {
  const target = event.target as HTMLElement

  // If a link was clicked, prevent card selection
  if (target.tagName === 'A') {
    event.stopPropagation()
    // Link will open naturally due to target="_blank"
  }
}
</script>

<style scoped>
.markdown-renderer {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  line-height: 1.5;
  overflow: hidden;
  word-wrap: break-word;
}

/* Line clamping classes */
.clamp-1,
.clamp-2,
.clamp-3,
.clamp-4,
.clamp-5 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.clamp-1 {
  -webkit-line-clamp: 1;
}

.clamp-2 {
  -webkit-line-clamp: 2;
}

.clamp-3 {
  -webkit-line-clamp: 3;
}

.clamp-4 {
  -webkit-line-clamp: 4;
}

.clamp-5 {
  -webkit-line-clamp: 5;
}

/* Markdown element styling */
.markdown-renderer :deep(p) {
  margin: 0;
}

.markdown-renderer :deep(p + p) {
  margin-top: var(--space-2);
}

.markdown-renderer :deep(a) {
  color: var(--color-accent-primary);
  text-decoration: underline;
  cursor: pointer;
}

.markdown-renderer :deep(a):active {
  color: var(--color-info-solid);
}

.markdown-renderer :deep(strong) {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.markdown-renderer :deep(em) {
  font-style: italic;
}

.markdown-renderer :deep(code) {
  font-family: var(--font-mono);
  font-size: var(--font-size-13);
  background: var(--color-bg-tertiary);
  padding: 2px var(--space-1);
  border-radius: var(--radius-xs);
}

.markdown-renderer :deep(ul),
.markdown-renderer :deep(ol) {
  margin: var(--space-2) 0;
  padding-left: var(--space-5);
}

.markdown-renderer :deep(li) {
  margin: var(--space-1) 0;
}
</style>
