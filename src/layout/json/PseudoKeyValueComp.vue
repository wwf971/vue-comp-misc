<template>
  <div class="json-keyvalue json-pseudo">
    <div class="json-key-and-colon">
      <span class="json-key-wrapper">
        <input
          ref="keyRef"
          type="text"
          class="json-key editing"
          v-model="key"
          @keydown="(e) => handleKeyDown(e, 'key')"
          @blur="(e) => handleBlur(e, 'key')"
          placeholder="key"
          :disabled="isSubmitting"
          style="width: 80px; border: none; outline: none; background: transparent"
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
        @keydown="(e) => handleKeyDown(e, 'value')"
        @blur="(e) => handleBlur(e, 'value')"
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

const key = ref('')
const value = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const keyRef = ref<HTMLInputElement>()
const valueRef = ref<HTMLInputElement>()

onMounted(async () => {
  // Focus on key input when component mounts
  await nextTick()
  keyRef.value?.focus()
})

const handleSubmit = async () => {
  if (!key.value.trim()) {
    // Key is required - don't submit
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  try {
    const changeData = {
      old: { type: 'pseudo' },
      new: { type: 'string', value: value.value },
      _action: 'createEntry',
      _key: key.value.trim()
    }
    
    const result = await props.onChange(props.path, changeData)
    
    if (result && result.code === 0) {
      // Success - parent will remove __pseudo__ marker and re-render with normal component
    } else {
      // Failed - show error briefly then remove via onCancel
      const errMsg = result?.message || 'Failed to create entry'
      errorMessage.value = errMsg
      isSubmitting.value = false
      
      // Auto-remove after showing error for 2 seconds
      setTimeout(() => {
        props.onCancel()
      }, 2000)
    }
  } catch (error: any) {
    console.error('Failed to create entry:', error)
    errorMessage.value = error.message || 'Network error'
    isSubmitting.value = false
    
    // Auto-remove after showing error for 2 seconds
    setTimeout(() => {
      props.onCancel()
    }, 2000)
  }
}

const handleKeyDown = (e: KeyboardEvent, field: string) => {
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

const handleBlur = (e: FocusEvent, field: string) => {
  // Check if the blur is moving to the other input field
  const relatedTarget = e.relatedTarget as HTMLElement
  if (relatedTarget && (relatedTarget === keyRef.value || relatedTarget === valueRef.value)) {
    // Moving between key and value inputs - don't submit or cancel
    return
  }
  
  // Clicking outside - submit if we have a key, otherwise cancel
  if (key.value.trim()) {
    handleSubmit()
  } else {
    props.onCancel()
  }
}
</script>
