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
  @apply flex flex-col gap-3;
}

.selector-label {
  @apply text-base font-semibold text-gray-700;
}

.groups-container {
  @apply bg-white rounded-xl border-2 border-gray-200 divide-y divide-gray-200;
}
</style>
