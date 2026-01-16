<template>
  <q-chip
    :label="label"
    clickable
    outline
    color="positive"
    @click="$emit('click')"
    class="suggestion-chip"
  />
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.suggestion-chip {
  min-height: 48px;
}
</style>
