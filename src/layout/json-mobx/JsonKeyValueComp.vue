<template>
  <div v-if="hasKey" :class="['json-keyvalue', { 'has-complex-value': !isPrimitive }]">
    <div class="json-key-and-colon">
      <span class="json-key-wrapper">
        <span
          ref="keyRef"
          :class="keyClasses"
          :contenteditable="isEditingKey"
          @blur="handleKeyBlur"
          @keydown="handleKeyDown"
          @click="handleKeyClick"
          @contextmenu="handleKeyContextMenu"
        >
          {{ itemKey }}
        </span>
        <span v-if="error" style="margin-left: 8px; font-size: 12px; color: #d32f2f;">
          {{ error }}
        </span>
      </span>
      
      <span class="json-colon">:</span>
    </div>
    
    <component :is="valueComponent" v-bind="valueProps">
      <slot />
    </component>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, h } from 'vue'
import { renameKeyIdentity, renameKeyInOrder } from './keyOrderStore'
import { useJsonContext } from './JsonContext'
import JsonTextComp from './JsonTextComp.vue'
import JsonNumberComp from './JsonNumberComp.vue'
import JsonBoolComp from './JsonBoolComp.vue'
import JsonNullComp from './JsonNullComp.vue'

const props = defineProps({
  data: null,
  itemKey: String,
  path: String,
  getPath: Function,
  isEditable: { type: Boolean, default: true },
  isKeyEditable: { type: Boolean, default: true },
  isValueEditable: { type: Boolean, default: true },
  onChange: Function,
  depth: { type: Number, default: 0 }
})

const { showConversionMenu, queryParentInfo } = useJsonContext()

const isEditingKey = ref(false)
const error = ref(null)
const keyRef = ref(null)
const originalKey = ref('')

const resolvePath = () => (props.getPath ? props.getPath() : props.path || '')

// Check if key exists in data
const hasKey = computed(() => Object.keys(props.data).includes(props.itemKey))

const value = computed(() => props.data[props.itemKey])

const isEmptyCollection = computed(() => {
  const val = value.value
  return (typeof val === 'object' && val !== null) && 
    ((Array.isArray(val) && val.length === 0) || 
     (!Array.isArray(val) && Object.keys(val).length === 0))
})

const isPrimitive = computed(() => {
  const val = value.value
  return val === null || val === undefined || typeof val !== 'object'
})

const valueType = computed(() => {
  const val = value.value
  return val === null || val === undefined ? 'null' : typeof val
})

const canEditKey = computed(() => props.isEditable && props.isKeyEditable)
const canEditValue = computed(() => props.isEditable && props.isValueEditable)

const keyClasses = computed(() => [
  'json-key',
  {
    'editable': canEditKey.value,
    'editing': isEditingKey.value
  }
])

watch(isEditingKey, async (newVal) => {
  if (newVal && keyRef.value) {
    await nextTick()
    keyRef.value.focus()
    const range = document.createRange()
    const selection = window.getSelection()
    if (selection) {
      range.selectNodeContents(keyRef.value)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
})

const handleKeyClick = () => {
  if (!canEditKey.value) return
  if (!hasKey.value) return
  originalKey.value = props.itemKey
  isEditingKey.value = true
}

const handleKeySubmit = async () => {
  if (!keyRef.value) return
  
  const newKey = (keyRef.value.textContent || '').trim()
  
  if (newKey === originalKey.value) {
    isEditingKey.value = false
    if (keyRef.value) {
      keyRef.value.textContent = originalKey.value
    }
    return
  }
  
  if (newKey === '') {
    error.value = 'Key cannot be empty'
    if (keyRef.value) {
      keyRef.value.textContent = originalKey.value
    }
    setTimeout(() => error.value = null, 3000)
    isEditingKey.value = false
    return
  }

  if (newKey in props.data) {
    error.value = `Key "${newKey}" already exists`
    if (keyRef.value) {
      keyRef.value.textContent = originalKey.value
    }
    setTimeout(() => error.value = null, 3000)
    isEditingKey.value = false
    return
  }

  isEditingKey.value = false
  
  try {
    if (props.onChange) {
      const changeData = {
        old: { type: 'key', value: originalKey.value },
        new: { type: 'key', value: newKey },
        _keyRename: true
      }
      
      const result = await props.onChange(resolvePath(), changeData)
      
      if (result && result.code !== 0) {
        error.value = result.message || 'Failed to update key'
        if (keyRef.value) {
          keyRef.value.textContent = originalKey.value
        }
        setTimeout(() => error.value = null, 3000)
        return
      }
    }
    
    renameKeyInOrder(props.data, originalKey.value, newKey)
    renameKeyIdentity(props.data, originalKey.value, newKey)
    const tempValue = props.data[originalKey.value]
    delete props.data[originalKey.value]
    props.data[newKey] = tempValue
  } catch (err) {
    error.value = err.message || 'Error renaming key'
    if (keyRef.value) {
      keyRef.value.textContent = originalKey.value
    }
    setTimeout(() => error.value = null, 3000)
  }
}

const handleKeyBlur = () => {
  handleKeySubmit()
}

const handleKeyDown = e => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleKeySubmit()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    if (keyRef.value) {
      keyRef.value.textContent = originalKey.value
    }
    isEditingKey.value = false
  }
}

const handleKeyContextMenu = e => {
  if (!props.isEditable) return
  e.preventDefault()
  e.stopPropagation()
  
  if (showConversionMenu) {
    const parentInfo = queryParentInfo ? queryParentInfo(resolvePath()) : { isSingleEntryInParent: false }
    showConversionMenu({
      position: { x: e.clientX, y: e.clientY },
      menuType: 'key',
      itemKey: props.itemKey,
      path: resolvePath(),
      value: value.value,
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    })
  }
}

const valueComponent = computed(() => {
  if (isEmptyCollection.value) {
    return 'span'
  }
  
  if (!isPrimitive.value) {
    return 'span'
  }

  const type = valueType.value
  
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

const valueProps = computed(() => {
  if (isEmptyCollection.value) {
    return {}
  }
  
  if (!isPrimitive.value) {
    return { class: 'json-value-complex' }
  }

  const type = valueType.value
  
  if (type === 'null') {
    return {
      getPath: resolvePath
    }
  } else if (type === 'boolean' || type === 'number' || type === 'string') {
    return {
      data: props.data,
      objKey: props.itemKey,
      getPath: resolvePath,
      isEditable: canEditValue.value,
      onChange: props.onChange
    }
  }
  
  return {}
})
</script>
