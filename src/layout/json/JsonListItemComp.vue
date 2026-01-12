<template>
  <div class="json-list-item">
    <component :is="dataComponent" v-bind="dataComponentProps">
      <slot />
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import JsonTextComp from './JsonTextComp.vue'
import JsonNumberComp from './JsonNumberComp.vue'
import JsonBoolComp from './JsonBoolComp.vue'
import JsonNullComp from './JsonNullComp.vue'
import EmptyDict from './EmptyDict.vue'
import './JsonComp.css'

interface Props {
  data: any
  index: number
  path: string
  isEditable: boolean
  onChange?: (path: string, changeData: any) => Promise<{ code: number; message?: string }>
  depth: number
}

const props = defineProps<Props>()

// Check if data is a primitive (can be edited inline)
const isPrimitive = computed(() => 
  props.data === null || props.data === undefined || typeof props.data !== 'object'
)
const dataType = computed(() => 
  props.data === null || props.data === undefined ? 'null' : typeof props.data
)

// Render appropriate component based on type
const dataComponent = computed(() => {
  if (!isPrimitive.value) {
    // Check if it's an empty object
    if (typeof props.data === 'object' && props.data !== null && !Array.isArray(props.data) && Object.keys(props.data).length === 0) {
      return EmptyDict
    }
    return 'span' // Will use slot for complex values
  }

  if (dataType.value === 'null') {
    return JsonNullComp
  } else if (dataType.value === 'boolean') {
    return JsonBoolComp
  } else if (dataType.value === 'number') {
    return JsonNumberComp
  } else {
    return JsonTextComp
  }
})

const dataComponentProps = computed(() => {
  if (!isPrimitive.value) {
    if (typeof props.data === 'object' && props.data !== null && !Array.isArray(props.data) && Object.keys(props.data).length === 0) {
      return { path: props.path }
    }
    return { class: 'json-list-item-complex' }
  }

  if (dataType.value === 'null') {
    return { path: props.path }
  } else if (dataType.value === 'boolean') {
    return {
      value: props.data,
      path: props.path,
      isEditable: props.isEditable,
      onChange: props.onChange
    }
  } else if (dataType.value === 'number') {
    return {
      value: props.data,
      path: props.path,
      isEditable: props.isEditable,
      onChange: props.onChange
    }
  } else {
    return {
      value: props.data,
      path: props.path,
      isEditable: props.isEditable,
      onChange: props.onChange
    }
  }
})
</script>
