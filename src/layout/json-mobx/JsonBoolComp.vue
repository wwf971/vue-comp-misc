<template>
  <span class="json-value-wrapper">
    <span
      :class="valueClasses"
      :title="props.isEditable && !error ? 'Click to toggle' : ''"
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      {{ String(value) }}
    </span>
    <span v-if="isDebug" style="color: #999; font-size: 11px; margin-left: 6px;">
      #{{ renderCount }}
    </span>
    <span v-if="error" class="json-error" style="color: #f44336; font-size: 11px; margin-left: 6px;">
      {{ error }}
    </span>
  </span>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useJsonContext } from './JsonContext'
import { getAvailableConversions } from './typeConvert'
import { useRenderCount } from './renderCountStore'
import './JsonComp.css'

const props = defineProps({
  data: null,
  objKey: [String, Number],
  value: Boolean,
  path: String,
  getPath: Function,
  isEditable: { type: Boolean, default: true },
  onChange: Function
})

const isSubmitting = ref(false)
const error = ref(null)

const { showConversionMenu, queryParentInfo, isDebug } = useJsonContext()

// Get persistent render count
const renderCount = useRenderCount(props.data, props.objKey)

// Use propValue if provided (for avoiding array access), otherwise access data[objKey]
const value = computed(() => props.value !== undefined ? props.value : props.data[props.objKey])

const resolvePath = () => (props.getPath ? props.getPath() : props.path || '')

const valueClasses = computed(() => [
  'json-value',
  'json-boolean',
  {
    'editable': props.isEditable && !error.value,
    'clickable': props.isEditable && !error.value
  }
])

const handleClick = async () => {
  if (!props.isEditable || isSubmitting.value || error.value) return

  const oldValue = value.value
  const newValue = !oldValue

  try {
    if (props.onChange) {
      const changeData = {
        old: { type: 'boolean', value: oldValue },
        new: { type: 'boolean', value: newValue }
      }
      const result = await props.onChange(resolvePath(), changeData)
      
      if (result && result.code !== 0) {
        error.value = result.message || 'Update failed'
        setTimeout(() => error.value = null, 3000)
        return
      }
    }
    
    props.data[props.objKey] = newValue
  } catch (err) {
    error.value = err.message || 'Error'
    setTimeout(() => error.value = null, 3000)
  }
}

const handleContextMenu = e => {
  e.preventDefault()
  e.stopPropagation()

  if (showConversionMenu) {
    const currentPath = resolvePath()
    const pathParts = currentPath.split('..')
    const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.')
    const parentInfo = queryParentInfo ? queryParentInfo(currentPath) : { isSingleEntryInParent: false }
    
    showConversionMenu({
      position: { x: e.clientX, y: e.clientY },
      currentValue: value.value,
      currentType: 'boolean',
      path: currentPath,
      menuType: isArrayItem ? 'arrayItem' : 'value',
      value: value.value,
      itemKey: props.objKey,
      availableConversions: getAvailableConversions(value.value, 'boolean', { includeArray: true, includeObject: true }),
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    })
  }
}
</script>
