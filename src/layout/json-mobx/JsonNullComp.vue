<template>
  <span class="json-value-wrapper">
    <span 
      class="json-value json-null"
      @contextmenu="handleContextMenu"
    >
      null
    </span>
  </span>
</template>

<script setup>
import { useJsonContext } from './JsonContext'
import { getAvailableConversions } from './typeConvert'
import './JsonComp.css'

const props = defineProps({
  path: String,
  getPath: Function
})

const { showConversionMenu, queryParentInfo } = useJsonContext()

const handleContextMenu = e => {
  const currentPath = props.getPath ? props.getPath() : props.path
  if (!currentPath) return
  
  e.preventDefault()
  e.stopPropagation()

  if (showConversionMenu) {
    const pathParts = currentPath.split('..')
    const isArrayItem = pathParts.length > 1 && !pathParts[pathParts.length - 1].includes('.')
    const parentInfo = queryParentInfo ? queryParentInfo(currentPath) : { isSingleEntryInParent: false }
    
    showConversionMenu({
      position: { x: e.clientX, y: e.clientY },
      currentValue,
      currentType: 'null',
      path: currentPath,
      menuType: isArrayItem ? 'arrayItem' : 'value',
      value,
      itemKey: undefined,
      availableConversions: getAvailableConversions(null, 'null', { includeArray: true, includeObject: true }),
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    })
  }
}
</script>
