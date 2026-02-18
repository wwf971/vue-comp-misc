<template>
  <div class="config-section" :style="style">
    <div :style="{ padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }">
      <div 
        v-if="title"
        class="section-title" 
        :style="{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none'
        }"
        @click="isExpanded = !isExpanded"
      >
        <MinusIcon 
          v-if="isExpanded"
          :width="14" 
          :height="14" 
          color="#666" 
          :stroke-width="2" 
          :style="{ marginRight: '8px' }" 
        />
        <PlusIcon 
          v-else
          :width="14" 
          :height="14" 
          color="#666" 
          :stroke-width="2" 
          :style="{ marginRight: '8px' }" 
        />
        {{ title }}
      </div>
      <div :style="{ display: isExpanded ? 'block' : 'none' }">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MinusIcon, PlusIcon } from '../icon/Icon'

interface Props {
  title?: string
  defaultExpanded?: boolean
  style?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpanded: false,
  style: () => ({})
})

const isExpanded = ref(props.defaultExpanded)
</script>
