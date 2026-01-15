<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    class="spinning-circle"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      :stroke="color"
      stroke-width="3"
      fill="none"
      stroke-dasharray="50 15"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  width?: number
  height?: number
  color?: string
}

withDefaults(defineProps<Props>(), {
  width: 16,
  height: 16,
  color: '#666'
})
</script>

<style scoped>
.spinning-circle {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
