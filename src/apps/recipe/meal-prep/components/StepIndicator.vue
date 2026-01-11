<template>
  <div class="step-indicator">
    <button
      v-for="(step, index) in steps"
      :key="step.value"
      @click="canNavigate(index) ? $emit('go-to-step', step.value) : null"
      :class="['step-dot', {
        active: currentStep === step.value,
        completed: isCompleted(index),
        clickable: canNavigate(index)
      }]"
      :disabled="!canNavigate(index)"
    >
      <span class="step-number">{{ index + 1 }}</span>
      <span class="step-label">{{ step.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
type StepType = 'preferences' | 'review' | 'menu'

interface Step {
  value: StepType
  label: string
}

const props = defineProps<{
  currentStep: StepType
}>()

defineEmits<{
  goToStep: [step: StepType]
}>()

const steps: Step[] = [
  { value: 'preferences', label: 'Preferences' },
  { value: 'review', label: 'Review' },
  { value: 'menu', label: 'Menu' }
]

function getCurrentStepIndex(): number {
  return steps.findIndex(s => s.value === props.currentStep)
}

function isCompleted(stepIndex: number): boolean {
  return stepIndex < getCurrentStepIndex()
}

function canNavigate(stepIndex: number): boolean {
  // Can navigate to current step or previous steps
  return stepIndex <= getCurrentStepIndex()
}
</script>

<style scoped>
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-4) 0;
}

.step-dot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.step-dot.clickable {
  cursor: pointer;
}

.step-dot:not(.clickable) {
  cursor: not-allowed;
}

.step-number {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-18);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  transition: all var(--duration-fast) var(--ease-in-out);
  color: var(--color-text-muted);
  background-color: var(--color-bg-primary);
}

.step-dot.active .step-number {
  border-color: var(--color-success-solid);
  background-color: var(--color-success-solid);
  color: white;
}

.step-dot.completed .step-number {
  border-color: var(--color-success-solid);
  background-color: var(--color-success-bg);
  color: var(--color-success-solid);
}

.step-dot.clickable:active .step-number {
  border-color: var(--color-success-border);
  background-color: var(--color-success-bg);
}

.step-dot.active:active .step-number {
  border-color: #059669;
  background-color: #059669;
}

.step-label {
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--ease-in-out);
  color: var(--color-text-muted);
}

.step-dot.active .step-label {
  color: var(--color-success-solid);
  font-weight: var(--font-weight-semibold);
}

.step-dot.completed .step-label {
  color: var(--color-success-solid);
}
</style>
