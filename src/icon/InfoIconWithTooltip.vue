<template>
  <span
    ref="iconRef"
    class="info-icon-with-tooltip-wrap"
    :style="{ color: color }"
    @mouseenter="onEnter"
    @mouseleave="showTooltip = false"
  >
    <InfoIcon :width="size" :height="size" />
    <Teleport to="body">
      <div
        v-if="showTooltip"
        class="info-icon-tooltip"
        :style="tooltipStyle"
      >
        {{ tooltipText }}
      </div>
    </Teleport>
  </span>
</template>

<script setup>
import { ref, computed } from 'vue'
import InfoIcon from './InfoIcon.vue'

defineProps({
  tooltipText: { type: String, default: '' },
  size: { type: Number, default: 14 },
  color: { type: String, default: '#999' }
})

const iconRef = ref(null)
const showTooltip = ref(false)
const tooltipPosition = ref({ top: 0, left: 0 })

function onEnter() {
  if (iconRef.value) {
    const rect = iconRef.value.getBoundingClientRect()
    tooltipPosition.value = {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX - 60
    }
  }
  showTooltip.value = true
}

const tooltipStyle = computed(() => ({
  position: 'absolute',
  top: `${tooltipPosition.value.top}px`,
  left: `${tooltipPosition.value.left}px`,
  width: '180px',
  padding: '8px 10px',
  background: '#333',
  color: '#fff',
  borderRadius: '4px',
  fontSize: '11px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  zIndex: 10000,
  pointerEvents: 'none',
  lineHeight: '1.4'
}))
</script>

<style scoped>
.info-icon-with-tooltip-wrap {
  display: inline-flex;
  align-items: center;
  cursor: help;
}
</style>

<style>
.info-icon-tooltip {
  position: absolute;
  width: 180px;
  padding: 8px 10px;
  background: #333;
  color: #fff;
  border-radius: 4px;
  font-size: 11px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 10000;
  pointer-events: none;
  line-height: 1.4;
}
</style>
