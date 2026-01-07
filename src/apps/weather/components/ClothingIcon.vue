<template>
  <span class="clothing-icon">
    <Icon v-if="iconName" :icon="iconName" :width="size" :height="size" />
    <span v-else class="emoji-fallback">{{ emojiIcon }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
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

const iconName = computed(() => iconData.value?.icon || null)

const emojiIcon = computed(() => iconData.value?.emoji || '👕')
</script>

<style scoped>
.clothing-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.emoji-fallback {
  font-size: 1.25rem;
  line-height: 1;
}
</style>
