<template>
  <Transition name="fade">
    <div
      v-if="active"
      :class="['edge-drop-zone', `edge-${edge}`]"
      :style="edgeStyle"
    >
      <div class="edge-content">
        <QIcon :name="statusIcon" size="32px" :color="iconColor" />
        <div class="edge-label">{{ statusLabel }}</div>
      </div>
      <Particles
        v-if="active"
        :id="`particles-${edge}`"
        :options="particlesOptions"
        class="particles-container"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Particles from '@tsparticles/vue3';
import type { ISourceOptions } from '@tsparticles/engine';
import { ChoreStatus } from '../types/chores';

interface Props {
  edge: 'top' | 'bottom' | 'left' | 'right';
  targetStatus: ChoreStatus;
  active: boolean;
}

const props = defineProps<Props>();

const statusConfig = computed(() => {
  switch (props.targetStatus) {
    case ChoreStatus.TODO:
      return {
        color: '#6B7280',
        icon: 'list',
        label: 'Move to To Do',
      };
    case ChoreStatus.IN_PROGRESS:
      return {
        color: '#3B82F6',
        icon: 'play_arrow',
        label: 'Start Task',
      };
    case ChoreStatus.DONE:
      return {
        color: '#10B981',
        icon: 'check_circle',
        label: 'Mark Complete',
      };
    default:
      return {
        color: '#6B7280',
        icon: 'circle',
        label: 'Move',
      };
  }
});

const edgeStyle = computed(() => ({
  borderColor: statusConfig.value.color,
  backgroundColor: `${statusConfig.value.color}33`, // 20% opacity
}));

const statusIcon = computed(() => statusConfig.value.icon);
const iconColor = computed(() => statusConfig.value.color);
const statusLabel = computed(() => statusConfig.value.label);

// Particle movement direction based on edge
const particleDirection = computed(() => {
  switch (props.edge) {
    case 'top':
      return 'top'; // Particles move up
    case 'bottom':
      return 'bottom'; // Particles move down
    case 'left':
      return 'left'; // Particles move left
    case 'right':
      return 'right'; // Particles move right
  }
});

const particlesOptions = computed<ISourceOptions>(() => ({
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 60,
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        width: 400,
        height: 400,
      },
    },
    color: {
      value: statusConfig.value.color,
    },
    shape: {
      type: 'circle',
    },
    opacity: {
      value: { min: 0.3, max: 0.7 },
    },
    size: {
      value: { min: 2, max: 4 },
    },
    move: {
      enable: true,
      speed: 2,
      direction: particleDirection.value,
      random: false,
      straight: false,
      outModes: {
        default: 'out',
      },
    },
  },
  detectRetina: true,
}));
</script>

<style scoped lang="scss">
.edge-drop-zone {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  border-radius: 12px;
  transition: opacity 0.2s ease-in-out;
}

.edge-top {
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  border-bottom: 3px solid;
}

.edge-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  border-top: 3px solid;
}

.edge-left {
  top: 0;
  bottom: 0;
  left: 0;
  width: 80px;
  border-right: 3px solid;
}

.edge-right {
  top: 0;
  bottom: 0;
  right: 0;
  width: 80px;
  border-left: 3px solid;
}

.edge-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.edge-label {
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
