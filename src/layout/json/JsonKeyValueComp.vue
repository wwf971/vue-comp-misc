<template>
  <div :class="['json-keyvalue', { 'has-complex-value': !isPrimitive }]">
    <div class="json-key-and-colon">
      <span class="json-key-wrapper">
        <span
          ref="keyRef"
          :class="['json-key', { editable: canEditKey, editing: isEditingKey }]"
          :contenteditable="isEditingKey"
          @blur="handleKeyBlur"
          @keydown="handleKeyDown"
          @click="handleKeyClick"
          @contextmenu="handleKeyContextMenu"
        >
          {{ itemKey }}
        </span>
        <span v-if="isSubmitting && isEditingKey" class="json-spinner">
          <SpinningCircle :width="14" :height="14" color="#666" />
        </span>
      </span>
      
      <span class="json-colon">:</span>
    </div>
    
    <component :is="valueComponent" v-bind="valueComponentProps">
      <slot />
    </component>
    
    <span v-if="isKeyProcessing" class="json-spinner" style="margin-left: 8px">
      <SpinningCircle :width="14" :height="14" color="#666" />
    </span>
    
    <span v-if="keyError" class="json-error" style="color: #f44336; margin-left: 8px; font-size: 13px">
      {{ keyError }}
    </span>
    
    <span v-if="keyWarning" class="json-warning" style="color: #ff9800; margin-left: 8px; font-size: 13px">
      ⚠ {{ keyWarning }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import SpinningCircle from '../../icon/SpinningCircle.vue'
import JsonTextComp from './JsonTextComp.vue'
import JsonNumberComp from './JsonNumberComp.vue'
import JsonBoolComp from './JsonBoolComp.vue'
import JsonNullComp from './JsonNullComp.vue'
import EmptyDict from './EmptyDict.vue'
import { useJsonContext } from './JsonContext'
import './JsonComp.css'

interface Props {
  itemKey: string
  value: any
  path: string
  isEditable: boolean
  isKeyEditable: boolean
  isValueEditable: boolean
  onChange?: (path: string, changeData: any) => Promise<{ code: number; message?: string }>
  depth: number
  keyOperationState?: { path: string; isProcessing?: boolean; error?: string | null; warning?: string | null } | null
}

const props = defineProps<Props>()

const isEditingKey = ref(false)
const isSubmitting = ref(false)
const keyRef = ref<HTMLElement>()
const originalValue = ref('')

const { showConversionMenu, queryParentInfo } = useJsonContext()

const canEditKey = computed(() => props.isEditable && props.isKeyEditable)
const canEditValue = computed(() => props.isEditable && props.isValueEditable)

const isPrimitive = computed(() => 
  props.value === null || props.value === undefined || typeof props.value !== 'object'
)
const valueType = computed(() => 
  props.value === null || props.value === undefined ? 'null' : typeof props.value
)

// Check if this key has an ongoing operation or error
const hasKeyOperation = computed(() => props.keyOperationState && props.keyOperationState.path === props.path)
const isKeyProcessing = computed(() => hasKeyOperation.value && props.keyOperationState?.isProcessing)
const keyError = computed(() => hasKeyOperation.value && props.keyOperationState?.error)
const keyWarning = computed(() => hasKeyOperation.value && props.keyOperationState?.warning)

watch(isEditingKey, async (newVal) => {
  if (newVal) {
    await nextTick()
    if (keyRef.value) {
      keyRef.value.focus()
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(keyRef.value)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }
})

const handleKeyClick = () => {
  if (!canEditKey.value || isSubmitting.value) return
  originalValue.value = props.itemKey
  isEditingKey.value = true
}

const handleKeySubmit = async () => {
  if (!keyRef.value) return
  
  const newKey = keyRef.value.textContent?.trim() || ''
  
  // Don't submit if value hasn't changed or is empty
  if (newKey === originalValue.value || newKey === '') {
    isEditingKey.value = false
    if (keyRef.value) {
      keyRef.value.textContent = originalValue.value
    }
    return
  }

  isSubmitting.value = true
  
  try {
    if (props.onChange) {
      // For key changes, send structured format with special _keyRename marker
      const changeData = {
        old: { type: 'key', value: originalValue.value },
        new: { type: 'key', value: newKey },
        _keyRename: true
      }
      
      const result = await props.onChange(props.path, changeData)
      
      if (result.code !== 0) {
        console.error('Failed to update key:', result.message)
        if (keyRef.value) {
          keyRef.value.textContent = originalValue.value
        }
      }
    }
  } catch (error) {
    console.error('Failed to update key:', error)
    if (keyRef.value) {
      keyRef.value.textContent = originalValue.value
    }
  } finally {
    isSubmitting.value = false
    isEditingKey.value = false
  }
}

const handleKeyBlur = () => {
  if (!isSubmitting.value) {
    handleKeySubmit()
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleKeySubmit()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    if (keyRef.value) {
      keyRef.value.textContent = originalValue.value
    }
    isEditingKey.value = false
  }
}

const handleKeyContextMenu = (e: MouseEvent) => {
  if (!props.isEditable) return
  e.preventDefault()
  e.stopPropagation()
  
  if (showConversionMenu) {
    const parentInfo = queryParentInfo ? queryParentInfo(props.path) : { isSingleEntryInParent: false }
    showConversionMenu({
      position: { x: e.clientX, y: e.clientY },
      menuType: 'key',
      itemKey: props.itemKey,
      path: props.path,
      value: props.value,
      currentValue: props.itemKey,
      currentType: 'key',
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    })
  }
}

// Render appropriate value component based on type
const valueComponent = computed(() => {
  if (!isPrimitive.value) {
    // Check if it's an empty object
    if (typeof props.value === 'object' && props.value !== null && !Array.isArray(props.value) && Object.keys(props.value).length === 0) {
      return EmptyDict
    }
    return 'span' // Will use slot for complex values
  }

  if (valueType.value === 'null') {
    return JsonNullComp
  } else if (valueType.value === 'boolean') {
    return JsonBoolComp
  } else if (valueType.value === 'number') {
    return JsonNumberComp
  } else {
    return JsonTextComp
  }
})

const valueComponentProps = computed(() => {
  if (!isPrimitive.value) {
    if (typeof props.value === 'object' && props.value !== null && !Array.isArray(props.value) && Object.keys(props.value).length === 0) {
      return { path: props.path }
    }
    return { class: 'json-value-complex' }
  }

  if (valueType.value === 'null') {
    return { path: props.path }
  } else if (valueType.value === 'boolean') {
    return {
      value: props.value,
      path: props.path,
      isEditable: canEditValue.value,
      onChange: props.onChange
    }
  } else if (valueType.value === 'number') {
    return {
      value: props.value,
      path: props.path,
      isEditable: canEditValue.value,
      onChange: props.onChange
    }
  } else {
    return {
      value: props.value,
      path: props.path,
      isEditable: canEditValue.value,
      onChange: props.onChange
    }
  }
})
</script>
