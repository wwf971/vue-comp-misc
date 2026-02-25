<template>
  <div class="json-list-item json-pseudo">
    <span class="json-value-wrapper">
      <input
        ref="valueRef"
        type="text"
        class="json-value json-string editing"
        v-model="value"
        @keydown="handleKeyDown"
        @blur="handleBlur"
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
import SpinningCircle from '../../icon/SpinningCircle.vue'
import './JsonComp.css'

const props = defineProps({
  path: String,
  getPath: Function,
  parentData: Array,
  index: Number,
  onChange: Function,
  onCancel: Function,
  depth: { type: Number, default: 0 }
})

const value = ref('')
const isSubmitting = ref(false)
const isShowingError = ref('')
const valueRef = ref(null)

onMounted(() => {
  if (valueRef.value) {
    valueRef.value.focus()
  }
})

const handleSubmit = async () => {
  isSubmitting.value = true
  isShowingError.value = ''
  try {
    const changeData = {
      old: { type: 'pseudo' },
      new: { type: 'string', value: value.value },
      _action: 'createItem'
    }
    
    const currentPath = props.getPath ? props.getPath() : props.path || ''
    const result = await props.onChange(currentPath, changeData)
    
    if (result && result.code === 0) {
      props.parentData[props.index] = value.value
    } else {
      const errMsg = result?.message || 'Failed to create item'
      isShowingError.value = errMsg
      isSubmitting.value = false
      
      setTimeout(() => {
        props.onCancel()
      }, 2000)
    }
  } catch (error) {
    console.error('Failed to create item:', error)
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
    handleSubmit()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    props.onCancel()
  }
}

const handleBlur = () => {
  if (!value.value.trim()) {
    props.onCancel()
  } else {
    handleSubmit()
  }
}
</script>
