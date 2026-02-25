<template>
  <div class="json-keyvalue json-pseudo">
    <div class="json-key-and-colon">
      <span class="json-key-wrapper">
        <input
          ref="keyRef"
          type="text"
          class="json-key editing"
          v-model="key"
          @keydown="handleKeyDown($event, 'key')"
          @blur="handleBlur($event, 'key')"
          placeholder="key"
          :disabled="isSubmitting || !!isShowingError"
          style="width: 80px; border: none; outline: none; background: transparent;"
        />
      </span>
      <span class="json-colon">:</span>
    </div>
    
    <span class="json-value-wrapper">
      <input
        ref="valueRef"
        type="text"
        class="json-value json-string editing"
        v-model="value"
        @keydown="handleKeyDown($event, 'value')"
        @blur="handleBlur($event, 'value')"
        placeholder="value"
        :disabled="isSubmitting || !!isShowingError"
        style="width: 100px; border: none; outline: none; background: transparent;"
      />
      <span v-if="isSubmitting && !isShowingError" class="json-spinner">
        <SpinningCircle :width="14" :height="14" color="#666" />
      </span>
      <span v-if="isShowingError" style="margin-left: 8px; font-size: 12px; color: #d32f2f;">
        {{ isShowingError }}
      </span>
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { addKeyInOrder, assignKeyIdentity } from './keyOrderStore'
import SpinningCircle from '../../icon/SpinningCircle.vue'
import './JsonComp.css'

const props = defineProps({
  path: String,
  data: null,
  pseudoKey: String,
  onChange: Function,
  onCancel: Function,
  depth: { type: Number, default: 0 }
})

const key = ref('')
const value = ref('')
const isSubmitting = ref(false)
const isShowingError = ref('')
const keyRef = ref(null)
const valueRef = ref(null)

onMounted(() => {
  if (keyRef.value) {
    keyRef.value.focus()
  }
})

const handleSubmit = async () => {
  const trimmedKey = key.value.trim()
  if (!trimmedKey) {
    return
  }

  if (trimmedKey in props.data && trimmedKey !== props.pseudoKey) {
    isShowingError.value = `Key "${trimmedKey}" already exists`
    isSubmitting.value = false
    
    setTimeout(() => {
      props.onCancel()
    }, 2000)
    return
  }

  isSubmitting.value = true
  isShowingError.value = ''
  try {
    const changeData = {
      old: { type: 'pseudo' },
      new: { type: 'string', value: value.value },
      _action: 'createEntry',
      _key: trimmedKey
    }
    
    const result = await props.onChange(props.path, changeData)
    
    if (result && result.code === 0) {
      const pseudoData = props.data[props.pseudoKey]
      const position = pseudoData?.position
      const referenceKey = pseudoData?.referenceKey
      
      delete props.data[props.pseudoKey]
      
      if (position && referenceKey) {
        addKeyInOrder(props.data, trimmedKey, position, referenceKey)
      }
      
      props.data[trimmedKey] = value.value
      assignKeyIdentity(props.data, trimmedKey)
    } else {
      const errMsg = result?.message || 'Failed to create entry'
      isShowingError.value = errMsg
      isSubmitting.value = false
      
      setTimeout(() => {
        props.onCancel()
      }, 2000)
    }
  } catch (error) {
    console.error('Failed to create entry:', error)
    isShowingError.value = error.message || 'Network error'
    isSubmitting.value = false
    
    setTimeout(() => {
      props.onCancel()
    }, 2000)
  }
}

const handleKeyDown = e => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (field === 'key' && valueRef.value) {
      valueRef.value.focus()
    } else if (field === 'value') {
      handleSubmit()
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    props.onCancel()
  }
}

const handleBlur = (e) => {
  const relatedTarget = e.relatedTarget
  if (relatedTarget && (relatedTarget === keyRef.value || relatedTarget === valueRef.value)) {
    return
  }
  
  if (key.value.trim()) {
    handleSubmit()
  } else {
    props.onCancel()
  }
}
</script>
