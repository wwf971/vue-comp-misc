<template>
  <span class="json-value-wrapper">
    <span
      :class="['json-value json-boolean', { editable: isEditable, clickable: isEditable }]"
      :title="isEditable ? 'Click to toggle' : ''"
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      {{ String(value) }}
    </span>
    <span v-if="isSubmitting" class="json-spinner">
      <SpinningCircle :width="14" :height="14" color="#666" />
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SpinningCircle from '../../icon/SpinningCircle.vue'
import { useJsonContext } from './JsonContext'
import { getAvailableConversions } from './typeConvert'
import './JsonComp.css'

interface Props {
  value: boolean
  path: string
  isEditable: boolean
  onChange?: (path: string, changeData: any) => Promise<{ code: number; message?: string }>
}

const props = defineProps<Props>()

const isSubmitting = ref(false)

const { showConversionMenu, queryParentInfo } = useJsonContext()

const handleClick = async () => {
  if (!props.isEditable || isSubmitting.value) return

  const newValue = !props.value
  isSubmitting.value = true
  
  try {
    if (props.onChange) {
      const changeData = {
        old: { type: 'boolean', value: props.value },
        new: { type: 'boolean', value: newValue }
      }
      const result = await props.onChange(props.path, changeData)
      
      if (result.code !== 0) {
        console.error('Failed to update value:', result.message)
      }
    }
  } catch (error) {
    console.error('Failed to update value:', error)
  } finally {
    isSubmitting.value = false
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
      currentType: 'boolean',
      path: props.path,
      menuType: isArrayItem ? 'arrayItem' : 'value',
      value: props.value,
      availableConversions: getAvailableConversions(props.value, 'boolean'),
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    })
  }
}
</script>
