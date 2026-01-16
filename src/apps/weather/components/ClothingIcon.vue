<template>
  <span class="clothing-icon" :style="{ fontSize: `${size}px` }">
    {{ emojiIcon }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClothingItem, CLOTHING_ICONS } from '../types/clothing'

const props = withDefaults(
  defineProps<{
    item: ClothingItem
    size?: number
  }>(),
  {
    size: 24
  }
)

const iconData = computed(() => CLOTHING_ICONS[props.item])

const emojiIcon = computed(() => iconData.value?.emoji || '👕')
</script>

<style scoped>
.clothing-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}
</style>
