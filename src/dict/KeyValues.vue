<template>
  <div class="keyvalues-container">
    <div v-if="data.length === 0" class="keyvalues-empty">No data</div>
    <div v-else class="keyvalues-list">
      <div
        v-for="(item, index) in data"
        :key="index"
        class="keyvalues-row"
        :style="{
          display: 'flex',
          alignItems: 'flex-start',
          ...(alignColumn && keyColWidthValue ? { '--key-col-width': keyColWidthValue } : {})
        }"
      >
        <div
          :class="`keyvalues-cell key-cell ${canEditKey ? 'editable' : ''}`"
          :style="alignColumn && keyColWidthValue ? { width: keyColWidthValue, flexShrink: 0 } : {}"
          @click="(e) => handleCellClick(index, 'key', e)"
        >
          <span
            :ref="el => setKeyRef(el, index)"
            :class="`keyvalues-text ${editingIndex === index && editingField === 'key' ? 'editing' : ''}`"
            :contenteditable="editingIndex === index && editingField === 'key'"
            @blur="handleEditBlur"
            @keydown="handleEditKeyDown"
          >
            {{ item.key }}
          </span>
        </div>
        <div
          :class="`keyvalues-cell value-cell ${canEditValue ? 'editable' : ''}`"
          :style="alignColumn ? { flex: 1 } : {}"
          @click="(e) => handleCellClick(index, 'value', e)"
        >
          <span
            :ref="el => { if (editingIndex === index && editingField === 'value') editRef = el }"
            :class="`keyvalues-text ${editingIndex === index && editingField === 'value' ? 'editing' : ''}`"
            :contenteditable="editingIndex === index && editingField === 'value'"
            @blur="handleEditBlur"
            @keydown="handleEditKeyDown"
          >
            {{ item.value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import './KeyValues.css'

interface KeyValueItem {
  key: string
  value: any
}

interface Props {
  data?: KeyValueItem[]
  isEditable?: boolean
  isKeyEditable?: boolean
  isValueEditable?: boolean
  alignColumn?: boolean
  keyColWidth?: string
  onChangeAttempt?: (index: number, field: 'key' | 'value', newValue: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  isEditable: true,
  isKeyEditable: false,
  isValueEditable: true,
  alignColumn: true,
  keyColWidth: 'min'
})

const emit = defineEmits<{
  'change-attempt': [index: number, field: 'key' | 'value', newValue: string]
}>()

const editingIndex = ref<number | null>(null)
const editingField = ref<'key' | 'value' | null>(null)
const keyColWidthValue = ref<string | null>(null)
const editRef = ref<HTMLElement | null>(null)
const originalValue = ref('')
const keyRefs = ref<(HTMLElement | null)[]>([])

const canEditKey = computed(() => props.isEditable && props.isKeyEditable)
const canEditValue = computed(() => props.isEditable && props.isValueEditable)

const setKeyRef = (el: any, index: number) => {
  keyRefs.value[index] = el
  if (editingIndex.value === index && editingField.value === 'key') {
    editRef.value = el
  }
}

watch(() => [props.data, props.alignColumn, props.keyColWidth], () => {
  if (!props.alignColumn || props.keyColWidth !== 'min' || props.data.length === 0) {
    keyColWidthValue.value = props.keyColWidth === 'min' ? null : props.keyColWidth
    return
  }

  nextTick(() => {
    let maxWidth = 0
    keyRefs.value.forEach(ref => {
      if (ref) {
        const cell = ref.closest('.keyvalues-cell')
        if (cell) {
          const width = cell.getBoundingClientRect().width
          if (width > maxWidth) maxWidth = width
        }
      }
    })
    if (maxWidth > 0) {
      keyColWidthValue.value = `${Math.ceil(maxWidth)}px`
    }
  })
}, { deep: true, immediate: true })

const handleCellClick = (index: number, field: 'key' | 'value', event: MouseEvent) => {
  if (field === 'key' && !canEditKey.value) return
  if (field === 'value' && !canEditValue.value) return

  const selection = window.getSelection()
  if (selection && selection.toString().length > 0) return

  const currentValue = field === 'key' ? props.data[index].key : props.data[index].value
  originalValue.value = String(currentValue)
  editingIndex.value = index
  editingField.value = field

  nextTick(() => {
    if (editRef.value) {
      editRef.value.focus()
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(editRef.value)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  })
}

const handleEditBlur = () => {
  if (editingIndex.value !== null && editingField.value !== null && editRef.value) {
    const newValue = editRef.value.textContent || ''

    if (newValue !== originalValue.value) {
      if (props.onChangeAttempt) {
        props.onChangeAttempt(editingIndex.value, editingField.value, newValue)
      }
      emit('change-attempt', editingIndex.value, editingField.value, newValue)
    }
  }

  editingIndex.value = null
  editingField.value = null
  originalValue.value = ''
}

const handleEditKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleEditBlur()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    if (editRef.value) {
      editRef.value.textContent = originalValue.value
    }
    editingIndex.value = null
    editingField.value = null
    originalValue.value = ''
  }
}
</script>
