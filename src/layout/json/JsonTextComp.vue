<template>
  <span class="json-value-wrapper">
    <span
      ref="valueRef"
      :class="[
        'json-value json-string',
        { editable: isEditable, editing: isEditing, 'whitespace-only': isWhitespaceOnly, 'empty-text': isEmpty }
      ]"
      :contenteditable="isEditing"
      :style="isEditing && isEmpty ? { minWidth: '80px' } : {}"
      @blur="handleBlur"
      @keydown="handleKeyDown"
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      {{ isEmpty && !isEditing ? 'EMPTY' : value }}
    </span>
    <span v-if="isSubmitting" class="json-spinner">
      <SpinningCircle :width="14" :height="14" color="#666" />
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import SpinningCircle from '../../icon/SpinningCircle.vue'
import { useJsonContext } from './JsonContext'
import { getAvailableConversions } from './typeConvert'
import './JsonComp.css'

interface Props {
  value: string
  path: string
  isEditable: boolean
  onChange?: (path: string, changeData: any) => Promise<{ code: number; message?: string }>
}

const props = defineProps<Props>()

const isEditing = ref(false)
const isSubmitting = ref(false)
const valueRef = ref<HTMLElement>()
const originalValue = ref('')

const { showConversionMenu, queryParentInfo } = useJsonContext()

const isEmpty = computed(() => !props.value || props.value.trim() === '')
const isWhitespaceOnly = computed(() => props.value && props.value.trim() === '' && props.value.length > 0)

watch(isEditing, async (newVal) => {
  if (newVal) {
    await nextTick()
    if (valueRef.value) {
      valueRef.value.focus()
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(valueRef.value)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }
})

const handleClick = () => {
  if (!props.isEditable || isSubmitting.value) return
  originalValue.value = String(props.value)
  isEditing.value = true
  
  // Clear the "EMPTY" placeholder text when starting to edit
  if ((!props.value || props.value.trim() === '') && valueRef.value) {
    valueRef.value.textContent = props.value || ''
  }
}

const handleSubmit = async () => {
  if (!valueRef.value) return
  
  const newValue = valueRef.value.textContent || ''
  
  // Don't submit if value hasn't changed
  if (newValue === originalValue.value) {
    isEditing.value = false
    return
  }

  isSubmitting.value = true
  
  try {
    if (props.onChange) {
      const changeData = {
        old: { type: 'string', value: originalValue.value },
        new: { type: 'string', value: newValue }
      }
      const result = await props.onChange(props.path, changeData)
      
      if (result.code !== 0) {
        console.error('Failed to update value:', result.message)
        if (valueRef.value) {
          valueRef.value.textContent = originalValue.value
        }
      }
    }
  } catch (error) {
    console.error('Failed to update value:', error)
    if (valueRef.value) {
      valueRef.value.textContent = originalValue.value
    }
  } finally {
    isSubmitting.value = false
    isEditing.value = false
  }
}

const handleBlur = () => {
  if (!isSubmitting.value) {
    handleSubmit()
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
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

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  if (showConversionMenu) {
    // Check if this is a direct array item (not a dict entry inside an array)
    const pathParts = props.path.split('..')
    const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.')
    const parentInfo = queryParentInfo ? queryParentInfo(props.path) : { isSingleEntryInParent: false }
    
    showConversionMenu({
      position: { x: e.clientX, y: e.clientY },
      currentValue: props.value,
      currentType: 'string',
      path: props.path,
      menuType: isArrayItem ? 'arrayItem' : 'value',
      value: props.value,
      availableConversions: getAvailableConversions(props.value, 'string', { includeArray: true, includeObject: true }),
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    })
  }
}
</script>
