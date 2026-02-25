<template>
  <div :class="`html-render ${className}`.trim()">
    <div v-if="title" class="html-render-title">{{ title }}</div>
    <div class="html-render-body">
      <PanelDual :orientation="'vertical'" :initial-ratio="initialRatio" :fixed-divider="fixedDivider">
        <template #first>
          <div class="html-render-pane">
            <div class="html-render-label">{{ leftLabel }}</div>
            <textarea
              v-model="text"
              class="html-render-textarea"
              :readonly="!isEditable"
              @input="handleChange"
            />
          </div>
        </template>
        <template #second>
          <div class="html-render-pane">
            <div class="html-render-label">{{ rightLabel }}</div>
            <div v-if="errorMessage" class="html-render-error">
              {{ errorMessage }}
            </div>
            <div
              v-else
              class="html-render-output"
              v-html="text"
            />
          </div>
        </template>
      </PanelDual>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import PanelDual from '../panel/PanelDual.vue'
import './HtmlRender.css'

interface Props {
  title?: string
  rawHtml?: string
  isEditable?: boolean
  leftLabel?: string
  rightLabel?: string
  onChange?: (value: string) => void
  initialRatio?: number
  fixedDivider?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  rawHtml: '',
  isEditable: false,
  leftLabel: 'HTML Raw Text',
  rightLabel: 'Rendered',
  initialRatio: 0.5,
  fixedDivider: true,
  className: ''
})

const text = ref(props.rawHtml || '')

watch(() => props.rawHtml, (newValue) => {
  text.value = newValue || ''
})

const validateHtml = (rawHtml: string): string => {
  const parser = new DOMParser()
  const wrapped = `<root>${rawHtml}</root>`
  const doc = parser.parseFromString(wrapped, 'text/xml')
  const errorNode = doc.querySelector('parsererror')
  if (errorNode) {
    return errorNode.textContent || 'Invalid HTML'
  }
  return ''
}

const errorMessage = computed(() => validateHtml(text.value))

const handleChange = () => {
  if (props.onChange) {
    props.onChange(text.value)
  }
}
</script>
