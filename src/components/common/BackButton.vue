<template>
  <q-btn
    flat
    round
    dense
    icon="chevron_left"
    @click="$emit('click')"
    aria-label="Go back"
    size="md"
    class="back-button"
  />
</template>

<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>

<style scoped>
.back-button {
  min-width: 44px;
  min-height: 44px;
}
</style>
