<template>
  <div style="padding: 20px; height: 100vh;">
    <h1>TabsOnTop Example</h1>
    <p>Test that tab content state is preserved when switching tabs</p>
    
    <TabsOnTop defaultTab="Counter">
      <TabOnTop label="Counter">
        <div>
          <h2>Counter Tab</h2>
          <p>This counter increments every second. Switch to another tab and come back - it should keep counting!</p>
          <div style="font-size: 48px; font-weight: bold; color: #0066cc; margin: 20px 0;">
            {{ counter }}
          </div>
          <p style="color: #666;">Started at: {{ startTime }}</p>
        </div>
      </TabOnTop>
      
      <TabOnTop label="Info">
        <div>
          <h2>Info Tab</h2>
          <p>This is just a static tab with some information.</p>
          <ul>
            <li>TabsOnTop preserves component state</li>
            <li>All tabs are rendered but only active one is visible</li>
            <li>Uses v-show instead of v-if to maintain state</li>
          </ul>
        </div>
      </TabOnTop>
      
      <TabOnTop label="Another Counter">
        <div>
          <h2>Another Counter</h2>
          <p>This one increments every 2 seconds</p>
          <div style="font-size: 36px; font-weight: bold; color: #cc6600; margin: 20px 0;">
            {{ counter2 }}
          </div>
        </div>
      </TabOnTop>
    </TabsOnTop>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TabsOnTop from './TabsOnTop.vue'
import { TabOnTop } from './TabsOnTopSlots'

// This example demonstrates that TabsOnTop preserves component state
// when switching between tabs. Both counters keep running even when
// their tabs are not visible.

const counter = ref(0)
const counter2 = ref(0)
const startTime = ref('')

let interval1 = null
let interval2 = null

onMounted(() => {
  startTime.value = new Date().toLocaleTimeString()
  
  // Counter 1: increment every second
  interval1 = setInterval(() => {
    counter.value++
  }, 1000)
  
  // Counter 2: increment every 2 seconds
  interval2 = setInterval(() => {
    counter2.value++
  }, 2000)
})

onUnmounted(() => {
  if (interval1) clearInterval(interval1)
  if (interval2) clearInterval(interval2)
})
</script>

