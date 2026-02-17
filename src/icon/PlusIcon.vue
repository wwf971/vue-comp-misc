<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="`icon plus-icon ${className}`"
    :style="style"
    v-bind="$attrs"
  >
    <line
      x1="8"
      y1="4"
      x2="8"
      y2="12"
      :stroke="color"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
    />
    <line
      x1="4"
      y1="8"
      x2="12"
      y2="8"
      :stroke="color"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  className?: string
  style?: Record<string, any>
}

withDefaults(defineProps<Props>(), {
  width: 16,
  height: 16,
  color: 'currentColor',
  strokeWidth: 2,
  className: '',
  style: () => ({})
})
</script>
