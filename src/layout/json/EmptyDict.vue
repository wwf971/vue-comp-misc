<template>
  <span 
    class="json-value json-empty-object"
    @contextmenu="handleContextMenu"
  >
    {{ '{ }' }}
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
    // Check if this is root (empty path or just "")
    const isRoot = !props.path || props.path === ''
    
    // Get parent info for position
    const parentInfo = queryParentInfo ? queryParentInfo(props.path) : { isSingleEntryInParent: false }
    
    // Get conversion options - string and null conversions disabled if root
    const conversions = getAvailableConversions({}, 'object').map(conv => {
      if ((conv.targetType === 'string' || conv.targetType === 'null') && isRoot) {
        return { ...conv, canConvert: false } // Grey out string/null conversion for root
      }
      return conv
    })
    
    showConversionMenu({
      position: { x: e.clientX, y: e.clientY },
      menuType: isArrayItem ? 'arrayItem' : 'emptyDict',
      path: props.path,
      value: {},
      currentValue: {},
      currentType: 'object',
      availableConversions: conversions,
      isSingleEntryInParent: parentInfo.isSingleEntryInParent,
      isFirstInParent: parentInfo.isFirstInParent,
      isLastInParent: parentInfo.isLastInParent
    })
  }
}
</script>
