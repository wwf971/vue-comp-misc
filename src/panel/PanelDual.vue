<template>
  <div
    ref="containerRef"
    :class="`panel-dual ${orientationClass} ${isDragging ? 'panel-dual-dragging' : ''}`"
  >
    <div ref="paneARef" class="panel-dual-pane">
      <slot name="first">
        {{ children[0] }}
      </slot>
    </div>
    <div
      :class="`${dividerClass} ${fixedDivider ? 'panel-dual-divider-fixed' : ''}`"
      @mousedown="startDragging"
    />
    <div ref="paneBRef" class="panel-dual-pane">
      <slot name="second">
        {{ children[1] }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, useSlots } from 'vue'
import './PanelDual.css'

interface Props {
  orientation?: 'vertical' | 'horizontal'
  initialRatio?: number
  fixedDivider?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'vertical',
  initialRatio: 0.5,
  fixedDivider: false
})

const slots = useSlots()
const children = computed(() => {
  const defaultSlot = slots.default?.()
  return defaultSlot || []
})

const containerRef = ref<HTMLElement | null>(null)
const paneARef = ref<HTMLElement | null>(null)
const paneBRef = ref<HTMLElement | null>(null)
const ratioRef = ref(clampRatio(props.initialRatio))
const isDragging = ref(false)

let dragHandlers = { onMove: null as ((e: MouseEvent) => void) | null, onUp: null as (() => void) | null }

function clampRatio(value: number): number {
  if (Number.isNaN(value)) {
    return 0.5
  }
  return Math.min(0.95, Math.max(0.05, value))
}

function applyRatio(ratio: number) {
  const container = containerRef.value
  const paneA = paneARef.value
  const paneB = paneBRef.value
  if (!container || !paneA || !paneB) {
    return
  }
  const rect = container.getBoundingClientRect()
  const totalSize = props.orientation === 'horizontal' ? rect.height : rect.width
  if (!totalSize || totalSize <= 0) {
    return
  }
  const clampedRatio = clampRatio(ratio)
  const sizeA = Math.round(totalSize * clampedRatio)
  const sizeB = Math.max(0, totalSize - sizeA)
  if (props.orientation === 'horizontal') {
    paneA.style.flexBasis = `${sizeA}px`
    paneB.style.flexBasis = `${sizeB}px`
  } else {
    paneA.style.flexBasis = `${sizeA}px`
    paneB.style.flexBasis = `${sizeB}px`
  }
}

function stopDragging() {
  const { onMove, onUp } = dragHandlers
  if (onMove) {
    window.removeEventListener('mousemove', onMove)
  }
  if (onUp) {
    window.removeEventListener('mouseup', onUp)
  }
  dragHandlers = { onMove: null, onUp: null }
  isDragging.value = false
}

function startDragging(event: MouseEvent) {
  if (props.fixedDivider) {
    return
  }
  event.preventDefault()
  const container = containerRef.value
  if (!container) {
    return
  }
  isDragging.value = true
  const onMove = (moveEvent: MouseEvent) => {
    const rect = container.getBoundingClientRect()
    if (props.orientation === 'horizontal') {
      const nextRatio = (moveEvent.clientY - rect.top) / rect.height
      ratioRef.value = clampRatio(nextRatio)
    } else {
      const nextRatio = (moveEvent.clientX - rect.left) / rect.width
      ratioRef.value = clampRatio(nextRatio)
    }
    applyRatio(ratioRef.value)
  }
  const onUp = () => {
    stopDragging()
  }
  dragHandlers = { onMove, onUp }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

const orientationClass = computed(() => 
  props.orientation === 'horizontal' ? 'panel-dual-horizontal' : 'panel-dual-vertical'
)

const dividerClass = computed(() => 
  props.orientation === 'horizontal'
    ? 'panel-dual-divider panel-dual-divider-horizontal'
    : 'panel-dual-divider panel-dual-divider-vertical'
)

watch(() => [props.initialRatio, props.orientation], () => {
  ratioRef.value = clampRatio(props.initialRatio)
  applyRatio(ratioRef.value)
}, { immediate: true })

onMounted(() => {
  applyRatio(ratioRef.value)
  
  const container = containerRef.value
  if (!container) {
    return
  }
  
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(() => applyRatio(ratioRef.value))
    observer.observe(container)
    
    onUnmounted(() => {
      observer.disconnect()
    })
  } else {
    const handleResize = () => applyRatio(ratioRef.value)
    window.addEventListener('resize', handleResize)
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
  }
})

onUnmounted(() => {
  stopDragging()
})
</script>
