<template>
  <div
    v-haptic
    role="button"
    :aria-label="`Open ${name} app`"
    tabindex="0"
    class="app-icon"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <div class="icon-container" :style="{ '--app-color': color }">
      <img :src="icon" alt="" class="icon-image" aria-hidden="true" />
    </div>
    <span class="app-name">{{ name }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  icon: string
  color: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.app-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 80px;
  transition: transform 0.2s var(--spring-bounce);
  outline: none;
}

/* Desktop/Pi5 - bigger icons */
@media (min-width: 768px) {
  .app-icon {
    width: 120px;
    gap: 12px;
  }
}

.app-icon:active {
  transform: scale(0.9);
}

.app-icon:focus-visible .icon-container {
  outline: 3px solid #3b82f6;
  outline-offset: 3px;
}

.icon-container {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* iOS-style gradient background */
  background: linear-gradient(135deg, var(--app-color), color-mix(in srgb, var(--app-color) 80%, black));

  /* Subtle shadow for depth */
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Desktop/Pi5 - bigger icon containers */
@media (min-width: 768px) {
  .icon-container {
    width: 100px;
    height: 100px;
    border-radius: 22px;
  }
}

.icon-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Desktop/Pi5 - bigger icon images */
@media (min-width: 768px) {
  .icon-image {
    width: 64px;
    height: 64px;
  }
}

.app-name {
  font-size: 12px;
  font-weight: 500;
  color: #1f2937;
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Desktop/Pi5 - bigger text */
@media (min-width: 768px) {
  .app-name {
    font-size: 14px;
    max-width: 120px;
  }
}
</style>
