<template>
  <label :style="labelStyle">
    <input
      type="checkbox"
      :checked="checked"
      @change="handleChange"
      :disabled="disabled"
      :style="inputStyle"
    />
    <span :style="trackStyle">
      <span :style="thumbStyle"></span>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  checked?: boolean
  disabled?: boolean
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  checked: false,
  disabled: false,
  color: '#3b82f6'
})

const emit = defineEmits<{
  change: [value: boolean]
}>()

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('change', target.checked)
}

const labelStyle = computed(() => ({
  position: 'relative',
  display: 'inline-block',
  width: '44px',
  height: '24px',
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  opacity: props.disabled ? 0.5 : 1
}))

const inputStyle = {
  opacity: 0,
  width: 0,
  height: 0
}

const trackStyle = computed(() => ({
  position: 'absolute',
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: props.checked ? props.color : '#cbd5e1',
  transition: '.3s',
  borderRadius: '24px'
}))

const thumbStyle = computed(() => ({
  position: 'absolute',
  content: '',
  height: '18px',
  width: '18px',
  left: '3px',
  bottom: '3px',
  backgroundColor: 'white',
  transition: '.3s',
  borderRadius: '50%',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
  transform: props.checked ? 'translateX(20px)' : 'translateX(0)'
}))
</script>
