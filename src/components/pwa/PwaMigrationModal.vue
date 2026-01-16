<template>
  <q-dialog :model-value="show" @update:model-value="val => !val && $emit('close')" persistent>
    <q-card class="pwa-migration-card">
      <q-card-section class="text-center">
        <div class="q-mb-md">
          <q-avatar size="64px" color="positive" text-color="white" icon="settings" />
        </div>
        <div class="text-h5 q-mb-xs">Setup Required</div>
        <div class="text-caption text-grey-7">
          Configure your backend connection to use ROSE
        </div>
      </q-card-section>

      <q-card-section>
        <!-- iOS QR Scan Option -->
        <q-banner v-if="isIOS" rounded class="bg-positive text-white q-mb-md">
          <template v-slot:avatar>
            <q-icon name="qr_code_scanner" />
          </template>
          <div class="text-subtitle2 q-mb-xs">Quick Setup (Recommended)</div>
          <div class="text-caption">
            If you installed via QR code, scan it again to automatically transfer settings
          </div>
        </q-banner>

        <!-- Manual Setup Button -->
        <q-btn
          label="Configure in Settings"
          color="primary"
          unelevated
          @click="handleManualSetup"
          class="full-width q-mb-md"
        />

        <!-- Info -->
        <q-banner rounded class="bg-info text-white">
          <div class="text-caption">
            <strong>Note:</strong> PWA apps have separate storage from your browser. Configuration must be set up once for the installed app.
          </div>
        </q-banner>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePwaStorage } from '@/composables/usePwaStorage'
import { useRouter } from 'vue-router'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const pwaStorage = usePwaStorage()
const router = useRouter()

const isIOS = computed(() => /iPad|iPhone|iPod/.test(navigator.userAgent))

function handleManualSetup() {
  pwaStorage.completeMigration()
  emit('close')
  router.push('/settings')
}
</script>

<style scoped>
.pwa-migration-card {
  max-width: 448px;
  width: 100%;
}
</style>
