<template>
  <span class="json-value-wrapper">
    <span
      ref="valueRef"
      :class="valueClasses"
      :contenteditable="isEditing"
      :style="editingStyle"
      @blur="handleBlur"
      @keydown="handleKeyDown"
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      {{ displayValue }}
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
import { ref, computed, watch, nextTick } from 'vue'
import { useJsonContext } from './JsonContext'
import { getAvailableConversions } from './typeConvert'
import { useRenderCount } from './renderCountStore'
import './JsonComp.css'

const props = defineProps({
  data: null,
  objKey: [String, Number],
  value: String,
  path: String,
  getPath: Function,
  isEditable: { type: Boolean, default: true },
  onChange: Function
})

const isEditing = ref(false)
const isSubmitting = ref(false)
const error = ref(null)
const valueRef = ref(null)
const originalValue = ref('')

const { showConversionMenu, queryParentInfo, isDebug } = useJsonContext()

// Get persistent render count
const renderCount = useRenderCount(props.data, props.objKey)

// Use propValue if provided (for avoiding array access), otherwise access data[objKey]
const value = computed(() => props.value !== undefined ? props.value : props.data[props.objKey])

const resolvePath = () => (props.getPath ? props.getPath() : props.path || '')

const isEmpty = computed(() => !value.value || value.value.trim() === '')
const isWhitespaceOnly = computed(() => value.value && value.value.trim() === '' && value.value.length > 0)

const valueClasses = computed(() => [
  'json-value',
  'json-string',
  {
    'editable': props.isEditable && !error.value,
    'editing': isEditing.value,
    'whitespace-only': isWhitespaceOnly.value,
    'empty-text': isEmpty.value
  }
])

const editingStyle = computed(() => {
  if (isEditing.value && isEmpty.value) {
    return { minWidth: '80px' }
  }
  return {}
})

const displayValue = computed(() => {
  if (isEmpty.value && !isEditing.value) {
    return 'EMPTY'
  }
  return value.value
})

watch(isEditing, async (newVal) => {
  if (newVal && valueRef.value) {
    await nextTick()
    valueRef.value.focus()
    const range = document.createRange()
    const selection = window.getSelection()
    if (selection) {
      range.selectNodeContents(valueRef.value)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
})

const handleClick = () => {
  if (!props.isEditable || isSubmitting.value || error.value) return
  originalValue.value = String(value.value)
  isEditing.value = true
}

const handleSubmit = async () => {
  if (!valueRef.value) return
  
  const newValue = valueRef.value.textContent || ''
  
  if (newValue === originalValue.value) {
    isEditing.value = false
    return
  }

  // Exit edit mode immediately to reduce re-renders
  isEditing.value = false
  
  try {
    if (props.onChange) {
      const changeData = {
        old: { type: 'string', value: originalValue.value },
        new: { type: 'string', value: newValue }
      }
      const result = await props.onChange(resolvePath(), changeData)
      
      if (result && result.code !== 0) {
        error.value = result.message || 'Update failed'
        if (valueRef.value) {
          valueRef.value.textContent = originalValue.value
        }
        setTimeout(() => error.value = null, 3000)
        return
      }
    }
    
    props.data[props.objKey] = newValue
  } catch (err) {
    error.value = err.message || 'Error'
    if (valueRef.value) {
      valueRef.value.textContent = originalValue.value
    }
    setTimeout(() => error.value = null, 3000)
  }
}

const handleBlur = () => {
  handleSubmit()
}

const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    if (valueRef.value) {
      valueRef.value.textContent = originalValue.value
    }
    isEditing.value = false
  }
}

const handleContextMenu = (e) => {
  e.preventDefault()
  e.stopPropagation()

  if (showConversionMenu) {
    // Check if this is a direct array item
    const currentPath = resolvePath()
    const pathParts = currentPath.split('..')
    const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.')
    const parentInfo = queryParentInfo ? queryParentInfo(currentPath) : { isSingleEntryInParent: false }
    
    showConversionMenu({
      position: { x: e.clientX, y: e.clientY },
      currentValue: value.value,
      currentType: 'string',
      path: currentPath,
      menuType: isArrayItem ? 'arrayItem' : 'value',
      value: value.value,
      itemKey: props.objKey,
      availableConversions: getAvailableConversions(value.value, 'string', { includeArray: true, includeObject: true }),
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    })
  }
}
</script>
