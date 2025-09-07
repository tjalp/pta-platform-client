import { ref, watch, computed } from 'vue'

const THEME_STORAGE_KEY = 'pta-platform-theme'
const THEME_CLASS = 'p-dark'

/**
 * Composable for managing application theme
 * Handles dark/light mode switching with localStorage persistence
 */
export function useTheme() {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = () => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored !== null) {
      return stored === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const isDark = ref(getInitialTheme())
  const root = document.getElementsByTagName('html')[0]

  // Apply theme to DOM
  const applyTheme = (dark) => {
    if (dark) {
      root.classList.add(THEME_CLASS)
    } else {
      root.classList.remove(THEME_CLASS)
    }
  }

  // Initialize theme
  applyTheme(isDark.value)

  // Watch for theme changes and persist
  watch(isDark, (newValue) => {
    applyTheme(newValue)
    localStorage.setItem(THEME_STORAGE_KEY, newValue ? 'dark' : 'light')
  })

  // Toggle theme function
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // Get appropriate icon for current theme
  const themeIcon = computed(() => {
    return isDark.value ? 'pi pi-fw pi-sun' : 'pi pi-fw pi-moon'
  })

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = (e) => {
    // Only apply system theme if user hasn't manually set a preference
    if (localStorage.getItem(THEME_STORAGE_KEY) === null) {
      isDark.value = e.matches
    }
  }

  mediaQuery.addEventListener('change', handleSystemThemeChange)

  return {
    isDark,
    toggleTheme,
    themeIcon
  }
}