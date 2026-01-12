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
        :disabled="isSubmitting || !!errorMessage"
        style="width: 100px; border: none; outline: none; background: transparent"
      />
      <span v-if="isSubmitting && !errorMessage" class="json-spinner">
        <SpinningCircle :width="14" :height="14" color="#666" />
      </span>
      <span v-if="errorMessage" style="margin-left: 8px; font-size: 12px; color: #d32f2f">
        ✗ {{ errorMessage }}
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import SpinningCircle from '../../icon/SpinningCircle.vue'
import './JsonComp.css'

interface Props {
  path: string
  onChange: (path: string, changeData: any) => Promise<{ code: number; message?: string }>
  onCancel: () => void
  depth: number
}

const props = defineProps<Props>()

const value = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const valueRef = ref<HTMLInputElement>()

onMounted(async () => {
  // Focus on value input when component mounts
  await nextTick()
  valueRef.value?.focus()
})

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    const changeData = {
      old: { type: 'pseudo' },
      new: { type: 'string', value: value.value },
      _action: 'createItem'
    }
    
    const result = await props.onChange(props.path, changeData)
    
    if (result && result.code === 0) {
      // Success - parent will remove isPseudo flag and re-render with normal component
    } else {
      // Failed - show error briefly then remove via onCancel
      const errMsg = result?.message || 'Failed to create item'
      errorMessage.value = errMsg
      isSubmitting.value = false
      
      // Auto-remove after showing error for 2 seconds
      setTimeout(() => {
        props.onCancel()
      }, 2000)
    }
  } catch (error: any) {
    console.error('Failed to create item:', error)
    errorMessage.value = error.message || 'Network error'
    isSubmitting.value = false
    
    // Auto-remove after showing error for 2 seconds
    setTimeout(() => {
      props.onCancel()
    }, 2000)
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    props.onCancel()
  }
}

const handleBlur = () => {
  // If value is empty, cancel instead of submitting
  if (!value.value.trim()) {
    props.onCancel()
  } else {
    // Submit on blur (clicking outside)
    handleSubmit()
  }
}
</script>
