/**
 * Dark Mode Composable
 * Manages light/dark theme switching with system preference detection and localStorage persistence
 */
import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'rose-portal-theme'
type Theme = 'light' | 'dark' | 'auto'

// Reactive state (shared across all components)
const currentTheme = ref<Theme>('auto')
const isDark = ref(false)

/**
 * Apply theme to document root
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement

  if (theme === 'auto') {
    // Detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark

    if (prefersDark) {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
    }
  } else {
    isDark.value = theme === 'dark'

    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.setAttribute('data-theme', 'light')
    }
  }
}

/**
 * Save theme preference to localStorage
 */
function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch (error) {
    console.warn('Failed to save theme preference:', error)
  }
}

/**
 * Load theme preference from localStorage
 */
function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      return saved
    }
  } catch (error) {
    console.warn('Failed to load theme preference:', error)
  }
  return 'auto'
}

/**
 * Listen for system theme changes
 */
function setupSystemThemeListener() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleChange = () => {
    if (currentTheme.value === 'auto') {
      applyTheme('auto')
    }
  }

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
  } else {
    // Legacy browsers
    mediaQuery.addListener(handleChange)
  }

  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleChange)
    } else {
      mediaQuery.removeListener(handleChange)
    }
  }
}

export function useDarkMode() {
  /**
   * Toggle between light and dark modes (cycles: light → dark → auto)
   */
  function toggleTheme() {
    if (currentTheme.value === 'light') {
      setTheme('dark')
    } else if (currentTheme.value === 'dark') {
      setTheme('auto')
    } else {
      setTheme('light')
    }
  }

  /**
   * Set specific theme
   */
  function setTheme(theme: Theme) {
    currentTheme.value = theme
    applyTheme(theme)
    saveTheme(theme)
  }

  /**
   * Initialize dark mode (call once on app mount)
   */
  function initializeDarkMode() {
    const savedTheme = loadTheme()
    currentTheme.value = savedTheme
    applyTheme(savedTheme)

    // Listen for system changes
    const cleanup = setupSystemThemeListener()

    return cleanup
  }

  // Auto-initialize on mount
  onMounted(() => {
    if (!document.documentElement.hasAttribute('data-theme-initialized')) {
      initializeDarkMode()
      document.documentElement.setAttribute('data-theme-initialized', 'true')
    }
  })

  return {
    isDark,
    currentTheme,
    toggleTheme,
    setTheme,
    initializeDarkMode,
  }
}
