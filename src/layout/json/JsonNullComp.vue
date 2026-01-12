<template>
  <span 
    class="json-value json-null"
    @contextmenu="handleContextMenu"
  >
    null
  </span>
</template>

<script setup lang="ts">
import { useJsonContext } from './JsonContext'
import { getAvailableConversions } from './typeConvert'
import './JsonComp.css'

interface Props {
  path: string
}

const props = defineProps<Props>()

const { showConversionMenu, queryParentInfo } = useJsonContext()

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  if (showConversionMenu) {
    // Check if this is a direct array item (not a dict entry inside an array)
    const pathParts = props.path.split('..')
    const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.')
    
    const parentInfo = queryParentInfo ? queryParentInfo(props.path) : { isSingleEntryInParent: false }
    
    showConversionMenu({
      position: { x: e.clientX, y: e.clientY },
      currentValue: null,
      currentType: 'null',
      path: props.path,
      menuType: isArrayItem ? 'arrayItem' : 'value',
      value: null,
      availableConversions: getAvailableConversions(null, 'null'),
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    })
  }
}
</script>
