<template>
  <span 
    class="json-value json-empty-array"
    @contextmenu="handleContextMenu"
  >
    {{ '[ ]' }}
  </span>
</template>

<script setup>
import { useJsonContext } from './JsonContext'
import './JsonComp.css'

const props = defineProps({
  path: String
})

const { showConversionMenu } = useJsonContext()

const handleContextMenu = e => {
  if (!props.path) return
  
  e.preventDefault()
  e.stopPropagation()

  if (showConversionMenu) {
    showConversionMenu({
      position: { x: e.clientX, y: e.clientY },
      menuType: 'emptyList',
      path: props.path
    })
  }
}
</script>
