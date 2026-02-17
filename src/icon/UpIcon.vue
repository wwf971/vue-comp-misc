<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="`icon up-icon ${className}`"
    v-bind="$attrs"
  >
    <polyline points="18,15 12,9 6,15"></polyline>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 24 },
  className: { type: String, default: '' }
})
</script>
