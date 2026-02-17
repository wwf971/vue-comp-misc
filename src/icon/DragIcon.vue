<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="`icon drag-icon ${className}`"
    v-bind="$attrs"
  >
    <circle cx="5" cy="4" r="1" :fill="color" />
    <circle cx="11" cy="4" r="1" :fill="color" />
    <circle cx="5" cy="8" r="1" :fill="color" />
    <circle cx="11" cy="8" r="1" :fill="color" />
    <circle cx="5" cy="12" r="1" :fill="color" />
    <circle cx="11" cy="12" r="1" :fill="color" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 16 },
  color: { type: String, default: 'currentColor' },
  className: { type: String, default: '' }
})
</script>
