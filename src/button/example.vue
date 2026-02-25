<template>
  <div :style="{ maxWidth: '600px', padding: '20px' }">
    <div :style="{ marginBottom: '20px' }">
      <div :style="{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }">
        BoolSlider Component
      </div>
      <div :style="{ fontSize: '13px', color: '#666', marginBottom: '16px' }">
        A toggle switch component for boolean values
      </div>
    </div>

    <div :style="{ marginBottom: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '4px' }">
      <div :style="{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }">
        <span :style="{ minWidth: '100px' }">Basic:</span>
        <BoolSlider :checked="checked1" @change="checked1 = $event" />
        <span :style="{ fontSize: '13px', color: '#666' }">{{ checked1 ? 'ON' : 'OFF' }}</span>
      </div>

      <div :style="{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }">
        <span :style="{ minWidth: '100px' }">Custom color:</span>
        <BoolSlider :checked="checked2" @change="checked2 = $event" color="#10b981" />
        <span :style="{ fontSize: '13px', color: '#666' }">{{ checked2 ? 'ON' : 'OFF' }}</span>
      </div>

      <div :style="{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }">
        <span :style="{ minWidth: '100px' }">Disabled:</span>
        <BoolSlider :checked="true" disabled />
        <span :style="{ fontSize: '13px', color: '#666' }">Disabled ON</span>
      </div>

      <div :style="{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '12px' }">
        <span :style="{ minWidth: '100px' }">Disabled:</span>
        <BoolSlider :checked="false" disabled />
        <span :style="{ fontSize: '13px', color: '#666' }">Disabled OFF</span>
      </div>
    </div>

    <div :style="{ fontSize: '14px', background: '#e3f2fd', padding: '12px', borderRadius: '4px' }">
      <strong>Usage:</strong>
      <pre :style="{ marginTop: '8px', fontSize: '12px', background: '#fff', padding: '8px', borderRadius: '3px', overflow: 'auto' }">{{ `<BoolSlider :checked="value" @change="value = $event" />` }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BoolSlider from './BoolSlider.vue'

const checked1 = ref(false)
const checked2 = ref(true)
</script>
