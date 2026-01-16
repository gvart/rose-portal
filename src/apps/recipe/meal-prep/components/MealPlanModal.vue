<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)">
    <q-card class="meal-plan-card">
      <q-card-section class="modal-header">
        <div class="text-h5">Meal Plan #{{ planIndex + 1 }}</div>
        <q-btn icon="close" flat round dense @click="closeModal" />
      </q-card-section>

      <q-card-section class="q-pb-none">
        <div class="row q-gutter-sm">
          <q-chip color="positive" text-color="white">
            {{ plan.dishList.length }} dish{{ plan.dishList.length !== 1 ? 'es' : '' }}
          </q-chip>
          <q-chip color="positive" text-color="white">
            {{ plan.groceryList.length }} ingredient{{ plan.groceryList.length !== 1 ? 's' : '' }}
          </q-chip>
        </div>
      </q-card-section>

      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-7"
        active-color="positive"
        indicator-color="positive"
        align="left"
      >
        <q-tab name="dishes" label="Dishes" />
        <q-tab name="grocery" label="Grocery List" />
      </q-tabs>

      <q-separator />

      <q-card-section class="modal-content">
            <!-- Dishes Tab -->
            <div v-if="activeTab === 'dishes'" class="dishes-list">
              <div
                v-for="dish in plan.dishList"
                :key="dish.id"
                class="dish-item"
              >
                <div class="dish-main">
                  <h4 class="dish-name">{{ dish.name }}</h4>
                  <span class="dish-time">{{ dish.preparationTime }} min</span>
                </div>
                <div class="dish-description markdown-content" v-html="parseMarkdown(dish.description)"></div>
                <div v-if="dish.ingredients && dish.ingredients.length > 0" class="dish-ingredients">
                  <h5 class="ingredients-title">Ingredients:</h5>
                  <ul class="ingredients-list">
                    <li v-for="(ingredient, idx) in dish.ingredients" :key="idx" class="ingredient-item">
                      {{ ingredient.quantity }} {{ formatUnit(ingredient.unitType) }} {{ ingredient.name }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Grocery List Tab -->
            <div v-else class="grocery-list">
              <div
                v-for="(ingredient, idx) in plan.groceryList"
                :key="idx"
                class="grocery-item"
              >
                <span class="item-quantity">{{ ingredient.quantity }}</span>
                <span class="item-unit">{{ formatUnit(ingredient.unitType) }}</span>
                <span class="item-name">{{ ingredient.name }}</span>
              </div>
            </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { marked } from 'marked'
import type { WeeklyMenuResponse } from '../types'

interface Props {
  modelValue: boolean
  plan: WeeklyMenuResponse
  planIndex: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const activeTab = ref<'dishes' | 'grocery'>('dishes')

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
})

function closeModal() {
  emit('update:modelValue', false)
}

function formatUnit(unitType: string): string {
  const unitMap: Record<string, string> = {
    'GRAM': 'g',
    'KILOGRAM': 'kg',
    'LITER': 'L',
    'MILLILITER': 'ml',
    'TEA_SPOON': 'tsp',
    'TABLE_SPOON': 'tbsp',
    'UNIT': '',
    'CUP': 'cup',
    'OUNCE': 'oz',
    'POUND': 'lb'
  }
  return unitMap[unitType] || unitType
}

function parseMarkdown(text: string): string {
  return marked.parse(text) as string
}
</script>

<style scoped>
.meal-plan-card {
  max-width: 64rem;
  width: 100%;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-content {
  overflow-y: auto;
  max-height: 60vh;
}

.dishes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.dish-item {
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
}

.dish-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.dish-name {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.dish-time {
  padding: var(--space-1) var(--space-3);
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border-radius: var(--radius-full);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.dish-description {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}

/* Markdown styling */
.markdown-content :deep(p) {
  margin-bottom: var(--space-2);
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-top: var(--space-3);
  margin-bottom: var(--space-2);
}

.markdown-content :deep(h1) {
  font-size: var(--font-size-18);
}

.markdown-content :deep(h2) {
  font-size: var(--font-size-16);
}

.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-size: var(--font-size-14);
}

.markdown-content :deep(strong) {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: var(--space-4);
  margin-bottom: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
}

.markdown-content :deep(code) {
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-12);
  font-family: var(--font-mono);
  color: var(--color-text-primary);
}

.markdown-content :deep(pre) {
  padding: var(--space-2);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-12);
  overflow-x: auto;
  margin-bottom: var(--space-2);
}

.markdown-content :deep(pre code) {
  padding: 0;
  background: transparent;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--color-success-solid);
  padding-left: var(--space-3);
  font-style: italic;
  color: var(--color-text-muted);
  margin: var(--space-2) 0;
}

.markdown-content :deep(a) {
  color: var(--color-success-solid);
  text-decoration: underline;
}

.markdown-content :deep(a:active) {
  color: #059669;
}

.markdown-content :deep(hr) {
  border-top: 1px solid var(--color-border-primary);
  margin: var(--space-3) 0;
}

.dish-ingredients {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-primary);
}

.ingredients-title {
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.ingredients-list {
  list-style-type: disc;
  list-style-position: inside;
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.ingredient-item {
  margin-left: var(--space-2);
}

.grocery-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.grocery-item {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-16);
}

.item-quantity {
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--color-success-text);
  min-width: 3rem;
  text-align: right;
}

.item-unit {
  color: var(--color-text-muted);
  min-width: 3rem;
}

.item-name {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}
</style>
