<template>
  <div class="string-input-overlay" @click="handleCancel">
    <div class="string-input-panel" @click.stop>
      <div class="string-input-header">
        <h3 class="string-input-title">{{ title }}</h3>
        <button
          class="string-input-close-button"
          @click="handleCancel"
          title="Close (ESC)"
        >
          ✕
        </button>
      </div>

      <div class="string-input-content">
        <textarea
          ref="textareaRef"
          class="string-input-textarea"
          v-model="inputValue"
          @keydown="handleKeyDown"
          :placeholder="placeholderText"
        />

        <div class="string-input-type-selector">
          <span class="string-input-type-label">Format:</span>
          <label class="string-input-radio-label">
            <input
              type="radio"
              name="parseType"
              value="json"
              v-model="parseType"
            />
            <span class="string-input-radio-text">JSON</span>
          </label>
          <label class="string-input-radio-label">
            <input
              type="radio"
              name="parseType"
              value="yaml"
              v-model="parseType"
            />
            <span class="string-input-radio-text">YAML</span>
          </label>
        </div>

        <div class="string-input-buttons">
          <button
            class="string-input-button string-input-button-confirm"
            @click="handleConfirm"
          >
            Confirm
          </button>
          <button
            class="string-input-button string-input-button-cancel"
            @click="handleCancel"
          >
            Cancel
          </button>
        </div>

        <div v-if="errorMessage" class="string-input-error">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { parseJsonString, parseYamlToJson } from '../../utils/parseString'
import './StringInput.css'

interface Props {
  onConfirm: (parsedValue: any) => void
  onCancel: () => void
  title?: string
  isObjectOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Insert JSON/YAML',
  isObjectOnly: false
})

const inputValue = ref('')
const parseType = ref<'json' | 'yaml'>('json')
const errorMessage = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

const placeholderText = computed(() => {
  return parseType.value === 'json' 
    ? 'Enter JSON: {"key": "value"} or ["item1", "item2"]' 
    : 'Enter YAML:\nkey: value\nlist:\n  - item1\n  - item2'
})

onMounted(async () => {
  await nextTick()
  textareaRef.value?.focus()
})

const handleConfirm = () => {
  if (!inputValue.value.trim()) {
    errorMessage.value = 'Input cannot be empty'
    return
  }

  // Parse based on selected type
  let result
  if (parseType.value === 'json') {
    result = parseJsonString(inputValue.value)
  } else if (parseType.value === 'yaml') {
    result = parseYamlToJson(inputValue.value)
  }

  if (result && result.code === 0) {
    // Success - validate if object-only is required
    if (props.isObjectOnly) {
      if (Array.isArray(result.data)) {
        errorMessage.value = 'Expected an object, but got an array'
        return
      }
      if (typeof result.data !== 'object' || result.data === null) {
        errorMessage.value = 'Expected an object, but got ' + typeof result.data
        return
      }
    }
    
    // Call onConfirm with parsed data
    props.onConfirm(result.data)
    errorMessage.value = ''
  } else {
    // Error - show error message
    errorMessage.value = result?.message || 'Parse error'
  }
}

const handleCancel = () => {
  props.onCancel()
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleCancel()
  }
  // Note: We don't handle Enter for confirm because multi-line input needs Enter
}
</script>

<style scoped src="./StringInput.css"></style>
