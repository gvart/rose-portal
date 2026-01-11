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
  gap: var(--space-2);
  cursor: pointer;
  width: 80px;
  transition: transform var(--duration-normal) var(--ease-in-out);
  outline: none;
}

/* Desktop/Pi5 - bigger icons */
@media (min-width: 768px) {
  .app-icon {
    width: 120px;
    gap: var(--space-3);
  }
}

.app-icon:active {
  transform: scale(0.94);
}

.app-icon:focus-visible .icon-container {
  outline: 3px solid var(--color-border-focus);
  outline-offset: 3px;
}

.icon-container {
  width: 70px;
  height: 70px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;

  /* Keep gradient for visual brand identity */
  background: linear-gradient(135deg, var(--app-color), color-mix(in srgb, var(--app-color) 80%, black));

  /* Minimal border instead of shadow */
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Desktop/Pi5 - bigger icon containers */
@media (min-width: 768px) {
  .icon-container {
    width: 100px;
    height: 100px;
    border-radius: 16px;
  }
}

.icon-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

/* Desktop/Pi5 - bigger icon images */
@media (min-width: 768px) {
  .icon-image {
    width: 64px;
    height: 64px;
  }
}

.app-name {
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Desktop/Pi5 - bigger text */
@media (min-width: 768px) {
  .app-name {
    font-size: var(--font-size-14);
    max-width: 120px;
  }
}
</style>
