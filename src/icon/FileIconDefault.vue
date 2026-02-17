<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="`icon file-icon-default ${className}`"
    v-bind="$attrs"
  >
    <path
      d="M12 8 L12 56 L52 56 L52 20 L40 8 Z"
      fill="#f8f9fa"
      stroke="#6c757d"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path
      d="M40 8 L40 20 L52 20"
      fill="none"
      stroke="#6c757d"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <line x1="18" y1="28" x2="46" y2="28" stroke="#adb5bd" stroke-width="1.5" stroke-linecap="round" />
    <line x1="18" y1="34" x2="42" y2="34" stroke="#adb5bd" stroke-width="1.5" stroke-linecap="round" />
    <line x1="18" y1="40" x2="46" y2="40" stroke="#adb5bd" stroke-width="1.5" stroke-linecap="round" />
    <line x1="18" y1="46" x2="38" y2="46" stroke="#adb5bd" stroke-width="1.5" stroke-linecap="round" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 24 },
  className: { type: String, default: '' }
})
</script>
