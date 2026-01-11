<template>
  <div class="attribute-selector">
    <label class="selector-label">Dish Attributes</label>
    <div class="groups-container">
      <AttributeGroup
        title="Dietary"
        :attributes="ATTRIBUTE_GROUPS.dietary"
        :selected-attributes="modelValue"
        :default-expanded="true"
        @toggle="toggleAttribute"
      />
      <AttributeGroup
        title="Cuisine"
        :attributes="ATTRIBUTE_GROUPS.cuisine"
        :selected-attributes="modelValue"
        :default-expanded="false"
        @toggle="toggleAttribute"
      />
      <AttributeGroup
        title="Taste Profile"
        :attributes="ATTRIBUTE_GROUPS.taste"
        :selected-attributes="modelValue"
        :default-expanded="false"
        @toggle="toggleAttribute"
      />
      <AttributeGroup
        title="Characteristics"
        :attributes="ATTRIBUTE_GROUPS.characteristics"
        :selected-attributes="modelValue"
        :default-expanded="false"
        @toggle="toggleAttribute"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AttributeGroup from './AttributeGroup.vue'
import { DishAttribute, ATTRIBUTE_GROUPS } from '../types'

const props = defineProps<{
  modelValue: DishAttribute[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DishAttribute[]]
}>()

function toggleAttribute(attribute: DishAttribute) {
  const currentAttributes = [...props.modelValue]
  const index = currentAttributes.indexOf(attribute)

  if (index === -1) {
    // Add attribute
    currentAttributes.push(attribute)
  } else {
    // Remove attribute
    currentAttributes.splice(index, 1)
  }

  emit('update:modelValue', currentAttributes)
}
</script>

<style scoped>
.attribute-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.selector-label {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.groups-container {
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.groups-container > :not(:last-child) {
  border-bottom: 1px solid var(--color-border-primary);
}
</style>
