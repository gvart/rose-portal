<template>
  <div class="note-card-skeleton">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text skeleton-text--short"></div>
    <div class="skeleton-tags">
      <div class="skeleton skeleton-tag"></div>
      <div class="skeleton skeleton-tag"></div>
    </div>
  </div>
</template>

<style scoped>
.note-card-skeleton {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-title {
  height: 20px;
  width: 70%;
  margin-bottom: 12px;
}

.skeleton-text {
  height: 14px;
  width: 100%;
  margin-bottom: 6px;
}

.skeleton-text--short {
  width: 60%;
  margin-bottom: 12px;
}

.skeleton-tags {
  display: flex;
  gap: 6px;
}

.skeleton-tag {
  height: 24px;
  width: 60px;
  border-radius: 12px;
}
</style>
