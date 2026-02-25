<template>
  <KeyValues
    :data="data"
    :is-editable="isEditable"
    :is-key-editable="isKeyEditable"
    :is-value-editable="isValueEditable"
    :align-column="alignColumn"
    :key-col-width="keyColWidth"
    :on-change-attempt="onChangeAttempt"
  />
</template>

<script setup lang="ts">
import KeyValues from './KeyValues.vue'

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

withDefaults(defineProps<Props>(), {
  data: () => [],
  isEditable: true,
  isKeyEditable: false,
  isValueEditable: true,
  alignColumn: true,
  keyColWidth: 'min'
})
</script>
