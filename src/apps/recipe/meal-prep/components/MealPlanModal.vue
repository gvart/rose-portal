<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)">
    <q-card class="meal-plan-card modal-xl">
      <q-card-section class="modal-header">
        <div>
          <div class="text-h6">Meal Plan #{{ planIndex + 1 }}</div>
          <div class="row q-gutter-sm q-mt-xs">
            <q-chip dense size="sm" color="positive" text-color="white">
              {{ plan.dishList?.length || 0 }} dishes
            </q-chip>
            <q-chip dense size="sm" color="positive" text-color="white">
              {{ plan.groceryList?.length || 0 }} items
            </q-chip>
          </div>
        </div>
        <q-btn icon="close" flat round dense @click="closeModal" />
      </q-card-section>

      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey-7"
        active-color="positive"
        indicator-color="positive"
        align="left"
        narrow-indicator
      >
        <q-tab name="dishes" label="Dishes" />
        <q-tab name="grocery" label="Grocery List" />
      </q-tabs>

      <q-separator />

      <q-card-section class="modal-content scrollable-content">
        <q-tab-panels v-model="activeTab" animated>
          <!-- Dishes Panel -->
          <q-tab-panel name="dishes" class="q-pa-none">
            <div class="dishes-grid">
              <div
                v-for="dish in (plan.dishList || [])"
                :key="dish.id"
                class="dish-card"
              >
                <div class="dish-header">
                  <h4 class="dish-name truncate">{{ dish.name }}</h4>
                  <q-chip dense size="sm" color="grey-3" text-color="grey-8">
                    {{ dish.preparationTime }} min
                  </q-chip>
                </div>

                <div class="dish-description line-clamp-2" v-html="parseMarkdown(dish.description)"></div>

                <q-expansion-item
                  v-if="dish.ingredients && dish.ingredients.length > 0"
                  dense
                  label="Ingredients"
                  header-class="text-grey-7 text-caption"
                >
                  <div class="ingredients-compact">
                    <span
                      v-for="(ingredient, idx) in dish.ingredients"
                      :key="idx"
                      class="ingredient-tag"
                    >
                      {{ ingredient.quantity }} {{ formatUnit(ingredient.unitType) }} {{ ingredient.name }}
                    </span>
                  </div>
                </q-expansion-item>
              </div>
            </div>
          </q-tab-panel>

          <!-- Grocery Panel -->
          <q-tab-panel name="grocery" class="q-pa-none">
            <q-list dense separator>
              <q-item
                v-for="(ingredient, idx) in (plan.groceryList || [])"
                :key="idx"
                class="grocery-item"
              >
                <q-item-section side class="grocery-quantity">
                  {{ ingredient.quantity }} {{ formatUnit(ingredient.unitType) }}
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ ingredient.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
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
  display: flex;
  flex-direction: column;
  width: 100%;
}

.modal-content {
  flex: 1;
  min-height: 0;
  max-height: 65vh;
}

/* Dishes Grid */
.dishes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
  padding: var(--space-3);
}

@media (min-width: 768px) {
  .dishes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.dish-card {
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border: var(--depth-1-border);
  border-radius: var(--radius-md);
}

.dish-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.dish-name {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
  min-width: 0;
}

.dish-description {
  font-size: var(--font-size-13);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

/* Compact ingredients */
.ingredients-compact {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  padding: var(--space-2) 0;
}

.ingredient-tag {
  font-size: var(--font-size-11);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
}

/* Grocery list */
.grocery-item {
  min-height: 40px;
}

.grocery-quantity {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--color-success-text);
  font-weight: var(--font-weight-semibold);
  min-width: 80px;
  text-align: right;
}

/* Ultra-compact optimizations for Pi5 */
@media (max-height: 768px) {
  .meal-plan-card.modal-xl {
    max-height: 92vh !important;
    max-width: 95vw !important; /* Maximize horizontal space */
  }

  /* Compact tabs */
  .q-tabs {
    min-height: 36px !important;
  }

  .q-tab {
    min-height: 36px !important;
    padding: 0 12px !important;
    font-size: 12px !important;
  }

  /* Compact expansion items */
  .q-expansion-item {
    font-size: 12px !important;
  }

  .q-expansion-item__content {
    padding: 8px !important;
  }

  .modal-content {
    max-height: 78vh;
  }

  .grocery-item {
    min-height: 36px;
  }
}
</style>
