<template>
  <div 
    class="pathbar-container" 
    :style="{ height: `${height}px`, cursor: allowEditText ? 'text' : 'default' }"
    @click="handleBarClick"
  >
    <input
      v-if="isDisplayAsStr"
      ref="inputRef"
      type="text"
      class="pathbar-input"
      :value="buildPathString()"
      readonly
      @blur="handleInputBlur"
      @keydown="handleInputKeyDown"
    />
    <div v-else class="pathbar-content">
      <span v-if="segments.length === 0" class="pathbar-empty">
        (empty path)
      </span>
      <template v-else>
        <span v-if="addSlashBeforeFirstSeg" class="pathbar-separator">{{ separator }}</span>
        <template v-for="(seg, index) in segments" :key="index">
          <span 
            class="pathbar-segment"
            @click.stop="handleSegmentClick(index)"
          >
            {{ seg.name }}
          </span>
          <span 
            v-if="index < segments.length - 1" 
            class="pathbar-separator"
          >
            {{ separator }}
          </span>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import './PathBar.css'

export interface PathSegment {
  name: string
  id?: string
  [key: string]: any
}

export interface PathData {
  segments: PathSegment[]
}

interface Props {
  pathData?: PathData
  onPathSegClicked?: (segmentIndex: number) => void
  addSlashBeforeFirstSeg?: boolean
  allowEditText?: boolean
  height?: number
  separator?: string
}

const props = withDefaults(defineProps<Props>(), {
  pathData: () => ({ segments: [] }),
  addSlashBeforeFirstSeg: false,
  allowEditText: true,
  height: 32,
  separator: '/'
})

const emit = defineEmits<{
  'path-seg-clicked': [segmentIndex: number]
}>()

const isDisplayAsStr = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const segments = computed(() => props.pathData?.segments || [])

const buildPathString = (): string => {
  if (segments.value.length === 0) {
    return props.addSlashBeforeFirstSeg ? '/' : ''
  }
  const pathStr = segments.value.map(seg => seg.name).join(props.separator)
  return props.addSlashBeforeFirstSeg ? '/' + pathStr : pathStr
}

const handleSegmentClick = (index: number) => {
  if (props.onPathSegClicked) {
    props.onPathSegClicked(index)
  }
  emit('path-seg-clicked', index)
}

const handleBarClick = (e: MouseEvent) => {
  if (!props.allowEditText) return
  
  const target = e.target as HTMLElement
  if (target.classList.contains('pathbar-content') || 
      target.classList.contains('pathbar-container')) {
    isDisplayAsStr.value = true
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus()
        inputRef.value.select()
      }
    })
  }
}

const handleInputBlur = () => {
  isDisplayAsStr.value = false
}

const handleInputKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === 'Escape') {
    isDisplayAsStr.value = false
  }
}
</script>
