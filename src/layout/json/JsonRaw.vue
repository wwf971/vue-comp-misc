<template>
  <div class="raw-json-overlay" @click="handleClose">
    <div 
      class="raw-json-panel" 
      @click.stop
      @keydown="handleKeyDown"
    >
      <div class="raw-json-header">
        <h3 class="raw-json-title">{{ title }}</h3>
        <div class="raw-json-header-buttons">
          <button
            class="raw-json-copy-button"
            @click="handleCopy"
            title="Copy to clipboard"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
          <button
            class="raw-json-close-button"
            @click="handleClose"
            title="Close (ESC)"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="raw-json-content">
        <pre class="raw-json-pre"><code class="raw-json-code">{{ jsonString }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatJson } from '../../utils/parseString'
import './JsonRaw.css'

interface Props {
  data: any
  onClose: () => void
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Raw JSON'
})

const copied = ref(false)

const jsonString = computed(() => formatJson(props.data, 2))

const handleCopy = () => {
  navigator.clipboard.writeText(jsonString.value).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }).catch(err => {
    console.error('Failed to copy:', err)
  })
}

const handleClose = () => {
  props.onClose()
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}
</script>

<style scoped src="./JsonRaw.css"></style>
