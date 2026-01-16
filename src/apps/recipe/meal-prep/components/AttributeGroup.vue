<template>
  <q-expansion-item
    :model-value="isExpanded"
    @update:model-value="isExpanded = $event"
    :label="title"
    header-class="group-header"
    class="attribute-group"
  >
    <div class="attributes-container q-pa-md">
      <q-chip
        v-for="attribute in attributes"
        :key="attribute"
        :label="formatAttribute(attribute)"
        clickable
        :color="isSelected(attribute) ? 'positive' : undefined"
        :outline="!isSelected(attribute)"
        @click="toggleAttribute(attribute)"
        class="attribute-chip"
      />
    </div>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DishAttribute, formatAttribute } from '../types'

const props = defineProps<{
  title: string
  attributes: DishAttribute[]
  selectedAttributes: DishAttribute[]
  defaultExpanded?: boolean
}>()

const emit = defineEmits<{
  toggle: [attribute: DishAttribute]
}>()

const isExpanded = ref(props.defaultExpanded ?? false)

function toggleAttribute(attribute: DishAttribute) {
  emit('toggle', attribute)
}

function isSelected(attribute: DishAttribute): boolean {
  return props.selectedAttributes.includes(attribute)
}
</script>

<style scoped>
.attributes-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.attribute-chip {
  min-height: 44px;
}
</style>
