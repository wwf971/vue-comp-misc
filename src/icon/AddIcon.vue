<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="`icon add-icon ${className}`"
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
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

withDefaults(defineProps<Props>(), {
  size: 16,
  color: 'currentColor',
  strokeWidth: 2,
  className: ''
})
</script>
