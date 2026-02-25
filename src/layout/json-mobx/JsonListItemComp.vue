<template>
  <div class="json-list-item">
    <component :is="itemComponent" v-bind="itemProps">
      <slot />
    </component>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import JsonTextComp from './JsonTextComp.vue'
import JsonNumberComp from './JsonNumberComp.vue'
import JsonBoolComp from './JsonBoolComp.vue'
import JsonNullComp from './JsonNullComp.vue'

const props = defineProps({
  parentData: Array,
  index: Number,
  itemData: null,
  getPath: Function,
  isEditable: { type: Boolean, default: true },
  onChange: Function,
  depth: { type: Number, default: 0 }
})

const isPrimitive = computed(() => {
  const item = props.itemData
  return item === null || item === undefined || typeof item !== 'object'
})

const dataType = computed(() => {
  const item = props.itemData
  return item === null || item === undefined ? 'null' : typeof item
})

const itemComponent = computed(() => {
  if (!isPrimitive.value) {
    return 'span'
  }

  const type = dataType.value
  
  if (type === 'null') {
    return JsonNullComp
  } else if (type === 'boolean') {
    return JsonBoolComp
  } else if (type === 'number') {
    return JsonNumberComp
  } else {
    return JsonTextComp
  }
})

const itemProps = computed(() => {
  if (!isPrimitive.value) {
    return { class: 'json-list-item-complex' }
  }

  const type = dataType.value
  
  if (type === 'null') {
    return {
      getPath: props.getPath
    }
  } else if (type === 'boolean' || type === 'number' || type === 'string') {
    return {
      data: props.parentData,
      objKey: props.index,
      value: props.itemData,
      getPath: props.getPath,
      isEditable: props.isEditable,
      onChange: props.onChange
    }
  }
  
  return {}
})
</script>
