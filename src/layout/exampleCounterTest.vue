<template>
  <div style="padding: 20px">
    <h3>Auto-incrementing Counter</h3>
    <p>This counter increments every second to test state persistence.</p>
    
    <div style="font-size: 48px; font-weight: bold; color: #2196F3; margin: 20px 0">
      {{ count }}
    </div>
    
    <p style="color: #666">
      Counter has been running for <strong>{{ elapsed }}</strong> seconds since component mounted.
    </p>
    
    <p style="margin-top: 20px; padding: 12px; background: #f0f0f0; border-radius: 4px">
      <strong>Test:</strong> 
      Switch to another subtab and come back. The counter should continue from where it was, 
      proving the component stays mounted (lazy rendering working).
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
const count = ref(0)
const startTime = ref(Date.now())
let intervalId: number | null = null

const elapsed = computed(() => {
  return Math.floor((Date.now() - startTime.value) / 1000)
})

onMounted(() => {
  console.log('Counter mounted - starting interval')
  intervalId = setInterval(() => {
    count.value++
  }, 1000)
})

onUnmounted(() => {
  console.log('Counter unmounted - clearing interval')
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

