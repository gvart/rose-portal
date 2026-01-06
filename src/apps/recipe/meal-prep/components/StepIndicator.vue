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
  @apply flex items-center justify-center gap-3 py-4;
}

.step-dot {
  @apply flex flex-col items-center gap-2 transition-all duration-200;
}

.step-dot.clickable {
  @apply cursor-pointer;
}

.step-dot:not(.clickable) {
  @apply cursor-not-allowed;
}

.step-number {
  @apply w-12 h-12 flex items-center justify-center rounded-full
         border-2 font-semibold text-lg transition-all duration-200;
  border-color: #d1d5db;
  color: #9ca3af;
  background-color: white;
}

.step-dot.active .step-number {
  border-color: #10b981;
  background-color: #10b981;
  color: white;
}

.step-dot.completed .step-number {
  border-color: #059669;
  background-color: #d1fae5;
  color: #059669;
}

.step-dot.clickable:hover .step-number {
  border-color: #6ee7b7;
  background-color: #d1fae5;
}

.step-dot.active:hover .step-number {
  border-color: #059669;
  background-color: #059669;
}

.step-label {
  @apply text-sm font-medium transition-all duration-200;
  color: #9ca3af;
}

.step-dot.active .step-label {
  color: #10b981;
  font-weight: 700;
}

.step-dot.completed .step-label {
  color: #059669;
}
</style>
