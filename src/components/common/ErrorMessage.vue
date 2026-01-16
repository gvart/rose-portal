<template>
  <q-banner
    class="error-banner"
    rounded
  >
    <template v-slot:avatar>
      <q-icon name="warning" color="negative" size="48px" />
    </template>

    <div class="error-content">
      <p class="error-message">{{ message }}</p>
    </div>

    <template v-slot:action>
      <q-btn
        flat
        color="negative"
        label="Try Again"
        @click="$emit('retry')"
      />
    </template>
  </q-banner>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.error-banner {
  max-width: 448px;
  margin: 0 auto;
  background: var(--color-error-bg);
  border: 2px solid var(--color-error-border);
  border-radius: 12px;
  padding: 32px;
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-message {
  color: var(--color-error-text);
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}
</style>
