<template>
  <div class="chore-card-skeleton">
    <div class="skeleton-header">
      <div class="skeleton-title"></div>
      <div class="skeleton-badge"></div>
    </div>
    <div class="skeleton-description"></div>
    <div class="skeleton-description short"></div>
    <div class="skeleton-meta">
      <div class="skeleton-meta-item"></div>
      <div class="skeleton-meta-item"></div>
    </div>
  </div>
</template>

<style scoped>
.chore-card-skeleton {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  position: relative;
  overflow: hidden;
}

.chore-card-skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.skeleton-title {
  flex: 1;
  height: 1.25rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
}

.skeleton-badge {
  width: 3.5rem;
  height: 1.5rem;
  background: #e5e7eb;
  border-radius: 0.375rem;
}

.skeleton-description {
  height: 1rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-description.short {
  width: 70%;
}

.skeleton-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.skeleton-meta-item {
  width: 50%;
  height: 0.875rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
}

@media (max-width: 768px) {
  .chore-card-skeleton {
    padding: 0.875rem;
  }
}
</style>
