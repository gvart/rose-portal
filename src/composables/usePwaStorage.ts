import { ref, computed, onMounted } from 'vue'
import { useConfiguration } from './useConfiguration'
import { useMultiUserAuth } from './useMultiUserAuth'

const MIGRATION_KEY = 'rose_pwa_migrated'
const EXPORT_DATA_KEY = 'rose_export_data'

export interface ExportData {
  timestamp: string
  backendUrl: string
  voskUrl: string
  users: any[]
  lastUserId: string | null
}

export function usePwaStorage() {
  const config = useConfiguration()
  const multiUser = useMultiUserAuth()
  const isPWA = computed(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://')
  })

  const needsMigration = ref(false)
  const migrationData = ref<ExportData | null>(null)

  /**
   * Check if running in PWA mode without configuration
   */
  function checkMigrationNeeded(): boolean {
    const migrated = localStorage.getItem(MIGRATION_KEY)
    const hasBackendUrl = !!config.getBackendUrl()

    // If in PWA mode, not migrated, and no backend URL - need migration
    if (isPWA.value && !migrated && !hasBackendUrl) {
      return true
    }

    return false
  }

  /**
   * Check URL parameters for migration data
   */
  function checkUrlParams(): void {
    const urlParams = new URLSearchParams(window.location.search)
    const dataParam = urlParams.get('import')

    if (dataParam) {
      try {
        const decoded = decodeURIComponent(dataParam)
        const data: ExportData = JSON.parse(atob(decoded))
        migrationData.value = data
        needsMigration.value = true

        // Clean up URL
        const url = new URL(window.location.href)
        url.searchParams.delete('import')
        window.history.replaceState({}, '', url.toString())
      } catch (error) {
        console.error('Failed to parse migration data from URL:', error)
      }
    }
  }

  /**
   * Export current configuration and user data
   */
  function exportData(): string {
    const data: ExportData = {
      timestamp: new Date().toISOString(),
      backendUrl: config.getBackendUrl(),
      voskUrl: config.getVoskUrl() || '',
      users: multiUser.users.value,
      lastUserId: multiUser.lastUserId.value
    }

    const json = JSON.stringify(data)
    const encoded = btoa(json)
    return encoded
  }

  /**
   * Import configuration and user data
   */
  function importData(encoded: string): void {
    try {
      const json = atob(encoded)
      const data: ExportData = JSON.parse(json)

      // Import backend configuration
      if (data.backendUrl) {
        config.setBackendUrl(data.backendUrl)
      }
      if (data.voskUrl) {
        config.setVoskUrl(data.voskUrl)
      }

      // Import users
      if (data.users && Array.isArray(data.users)) {
        data.users.forEach(user => {
          multiUser.saveUser(user)
        })
      }

      // Mark as migrated
      localStorage.setItem(MIGRATION_KEY, 'true')
      needsMigration.value = false
      migrationData.value = null

      console.log('PWA data migration completed successfully')
    } catch (error) {
      console.error('Failed to import data:', error)
      throw new Error('Failed to import configuration data')
    }
  }

  /**
   * Auto-import from URL params if available
   */
  function autoImportFromUrl(): void {
    if (migrationData.value) {
      const encoded = btoa(JSON.stringify(migrationData.value))
      importData(encoded)
    }
  }

  /**
   * Generate a migration URL
   */
  function generateMigrationUrl(): string {
    const encoded = exportData()
    const baseUrl = window.location.origin + window.location.pathname
    return `${baseUrl}?import=${encodeURIComponent(encoded)}`
  }

  /**
   * Copy migration URL to clipboard
   */
  async function copyMigrationUrl(): Promise<void> {
    const url = generateMigrationUrl()
    await navigator.clipboard.writeText(url)
  }

  /**
   * Mark migration as completed (for manual configuration)
   */
  function completeMigration(): void {
    localStorage.setItem(MIGRATION_KEY, 'true')
    needsMigration.value = false
  }

  /**
   * Reset migration status (for testing)
   */
  function resetMigration(): void {
    localStorage.removeItem(MIGRATION_KEY)
  }

  /**
   * Initialize PWA storage handling
   */
  function initialize(): void {
    checkUrlParams()

    // Auto-import if we have data from URL
    if (migrationData.value) {
      autoImportFromUrl()
    } else {
      needsMigration.value = checkMigrationNeeded()
    }
  }

  return {
    isPWA,
    needsMigration,
    migrationData,
    exportData,
    importData,
    generateMigrationUrl,
    copyMigrationUrl,
    completeMigration,
    resetMigration,
    initialize
  }
}
