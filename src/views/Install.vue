<template>
  <AppLayout title="Install ROSE" theme-color="#10b981">
    <div class="install-page">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div class="welcome-icon">🌹</div>
        <h1 class="welcome-title">Welcome to ROSE</h1>
        <p class="welcome-subtitle">
          Let's get you set up in just a few simple steps
        </p>
      </div>

      <!-- Installation Steps Card -->
      <div class="instructions-card">
        <div class="card-header">
          <div class="header-icon">📱</div>
          <h2 class="card-title">Install the App</h2>
        </div>

        <!-- iOS Instructions -->
        <div v-if="isIOS" class="platform-instructions">
          <div class="platform-badge ios">
            <svg class="platform-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            iOS
          </div>

          <ol class="instruction-list">
            <li class="instruction-item">
              <span class="step-number">1</span>
              <div class="step-content">
                <p class="step-text">Tap the Share button</p>
                <span class="share-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
              </div>
            </li>
            <li class="instruction-item">
              <span class="step-number">2</span>
              <div class="step-content">
                <p class="step-text">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
              </div>
            </li>
            <li class="instruction-item">
              <span class="step-number">3</span>
              <div class="step-content">
                <p class="step-text">Tap <strong>"Add"</strong> in the top right corner</p>
              </div>
            </li>
          </ol>
        </div>

        <!-- Android Instructions -->
        <div v-else-if="isAndroid" class="platform-instructions">
          <div class="platform-badge android">
            <svg class="platform-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.5 11.5 0 0 0-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C4.9 10.53 3.84 12.45 3.6 14.59h16.8c-.24-2.14-1.3-4.06-2.8-5.11zM7.5 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm9 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"/>
            </svg>
            Android
          </div>

          <ol class="instruction-list">
            <li class="instruction-item">
              <span class="step-number">1</span>
              <div class="step-content">
                <p class="step-text">Tap the menu button <strong>(⋮)</strong> in Chrome</p>
              </div>
            </li>
            <li class="instruction-item">
              <span class="step-number">2</span>
              <div class="step-content">
                <p class="step-text">Tap <strong>"Add to Home screen"</strong></p>
              </div>
            </li>
            <li class="instruction-item">
              <span class="step-number">3</span>
              <div class="step-content">
                <p class="step-text">Confirm by tapping <strong>"Add"</strong></p>
              </div>
            </li>
          </ol>

          <button
            v-if="isInstallable"
            v-haptic
            @click="handleInstall"
            class="btn-install-pwa"
          >
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Install Now
          </button>
        </div>

        <!-- Desktop Message -->
        <div v-else class="platform-instructions desktop">
          <div class="desktop-icon">💻</div>
          <p class="desktop-message">
            Please visit this page on your mobile device to install ROSE as an app.
          </p>
          <p class="desktop-hint">
            Scan the QR code from your Pi5/desktop Settings page
          </p>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <div class="next-steps-icon">✨</div>
          <p class="next-steps-text">
            After installation, you'll need the <strong>setup code</strong> from your Pi5/desktop to complete the configuration.
          </p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePWA } from '@/composables/usePWA'
import AppLayout from '@/layouts/AppLayout.vue'

const { isInstallable, install } = usePWA()

// Platform detection
const isIOS = computed(() => /iPad|iPhone|iPod/.test(navigator.userAgent))
const isAndroid = computed(() => /Android/.test(navigator.userAgent))

async function handleInstall() {
  await install()
}
</script>

<style scoped>
.install-page {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* Welcome Header */
.welcome-header {
  text-align: center;
  animation: fadeInDown 0.6s ease-out;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  animation: pulse 2s ease-in-out infinite;
}

.welcome-title {
  font-size: var(--font-size-32);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-2);
}

.welcome-subtitle {
  font-size: var(--font-size-16);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

/* Instructions Card */
.instructions-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--depth-3-shadow);
  border: var(--depth-1-border);
  padding: var(--space-6);
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: var(--depth-1-border);
}

.header-icon {
  font-size: 2rem;
}

.card-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

/* Platform Badge */
.platform-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-14);
  margin-bottom: var(--space-6);
  animation: slideInRight 0.5s ease-out 0.4s both;
}

.platform-badge.ios {
  background: linear-gradient(135deg, #000000 0%, #434343 100%);
  color: white;
}

.platform-badge.android {
  background: linear-gradient(135deg, #3ddc84 0%, #2ba860 100%);
  color: white;
}

.platform-icon {
  width: 20px;
  height: 20px;
}

/* Instruction List */
.instruction-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.instruction-item {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  animation: fadeInLeft 0.5s ease-out calc(0.5s + var(--item-index, 0) * 0.1s) both;
}

.instruction-item:nth-child(1) { --item-index: 1; }
.instruction-item:nth-child(2) { --item-index: 2; }
.instruction-item:nth-child(3) { --item-index: 3; }

.step-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-14);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.step-content {
  flex: 1;
  padding-top: var(--space-1);
}

.step-text {
  font-size: var(--font-size-16);
  color: var(--color-text-primary);
  line-height: 1.6;
}

.step-text strong {
  color: #10b981;
  font-weight: var(--font-weight-semibold);
}

.share-icon {
  display: inline-flex;
  margin-left: var(--space-2);
  vertical-align: middle;
}

.share-icon svg {
  width: 20px;
  height: 20px;
  color: var(--color-text-secondary);
}

/* Install Button */
.btn-install-pwa {
  width: 100%;
  margin-top: var(--space-6);
  padding: var(--space-4) var(--space-6);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-16);
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  transition: all var(--duration-normal) var(--ease-in-out);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  animation: fadeInUp 0.5s ease-out 0.9s both;
}

.btn-install-pwa:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

/* Desktop Message */
.desktop {
  text-align: center;
  padding: var(--space-8) var(--space-4);
}

.desktop-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  animation: bounce 2s ease-in-out infinite;
}

.desktop-message {
  font-size: var(--font-size-18);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-3);
}

.desktop-hint {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
}

/* Next Steps */
.next-steps {
  margin-top: var(--space-6);
  padding: var(--space-4);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  border-radius: var(--radius-md);
  border: 1px solid rgba(16, 185, 129, 0.2);
  display: flex;
  gap: var(--space-3);
  animation: fadeIn 0.5s ease-out 1s both;
}

.next-steps-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.next-steps-text {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.next-steps-text strong {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .install-page {
    padding: var(--space-4) var(--space-3);
    gap: var(--space-6);
  }

  .welcome-title {
    font-size: var(--font-size-28);
  }

  .welcome-subtitle {
    font-size: var(--font-size-14);
  }

  .instructions-card {
    padding: var(--space-5);
  }

  .card-title {
    font-size: var(--font-size-20);
  }
}
</style>
