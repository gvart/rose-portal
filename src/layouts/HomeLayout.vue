<template>
  <div class="home-layout">
    <!-- Animated Background -->
    <div class="background-mesh">
      <div class="mesh-gradient mesh-1"></div>
      <div class="mesh-gradient mesh-2"></div>
      <div class="mesh-gradient mesh-3"></div>
    </div>

    <!-- Content -->
    <div class="home-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home-layout {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: visible;
}

.background-mesh {
  position: fixed;
  inset: 0;
  z-index: 0;
  filter: blur(60px);
  pointer-events: none;
}

.mesh-gradient {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  opacity: 0.5;
  animation: float 20s ease-in-out infinite;
}

.mesh-1 {
  background: radial-gradient(circle, #10b981 0%, transparent 70%);
  top: -10%;
  left: -10%;
  animation-delay: 0s;
}

.mesh-2 {
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
  bottom: -10%;
  right: -10%;
  animation-delay: 7s;
}

.mesh-3 {
  background: radial-gradient(circle, #6366f1 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.home-content {
  position: relative;
  z-index: 1;
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
  @apply max-w-7xl mx-auto px-8 py-12;
}
</style>
