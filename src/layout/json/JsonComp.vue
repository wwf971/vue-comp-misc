<template>
  <div v-if="isRoot">
    <!-- Root component provides context -->
    <ContentRenderer />
    
    <!-- Menu -->
    <MenuComp
      v-if="conversionMenu"
      :items="getMenuItems()"
      :position="conversionMenu.position"
      :onClose="closeMenu"
      :onItemClick="handleMenuItemClick"
    />

    <!-- StringInput Dialog -->
    <StringInput
      v-if="stringInputState"
      :onConfirm="handleStringInputConfirm"
      :onCancel="handleStringInputCancel"
      :title="stringInputState.action === 'mergeDictWithJson' ? 'Merge dict with JSON/YAML' : 'Replace with JSON/YAML'"
      :isObjectOnly="stringInputState.action === 'mergeDictWithJson'"
    />

    <!-- Raw JSON Display -->
    <JsonRaw
      v-if="rawJsonDisplay"
      :data="rawJsonDisplay.data"
      :title="rawJsonDisplay.title"
      :onClose="() => rawJsonDisplay = null"
    />
  </div>
  <ContentRenderer v-else />
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h } from 'vue'
import JsonKeyValueComp from './JsonKeyValueComp.vue'
import JsonListItemComp from './JsonListItemComp.vue'
import PseudoKeyValueComp from './PseudoKeyValueComp.vue'
import PseudoListItem from './PseudoListItem.vue'
import EmptyDict from './EmptyDict.vue'
import EmptyList from './EmptyList.vue'
import { provideJsonContext, createQueryParentInfo, type ConversionMenuRequest, type TypeConversionBehavior } from './JsonContext'
import MenuComp, { type MenuCompItem, type MenuCompItemSingle } from '../../menu/MenuComp.vue'
import StringInput from './StringInput.vue'
import JsonRaw from './JsonRaw.vue'
import { convertValue } from './typeConvert'
import { parsePathToSegments, segmentsToPath } from './pathUtils'
import './JsonComp.css'

/**
 * JsonComp - Component for displaying and editing deeply nested JSON-like objects
 * 
 * @param data - The JSON data to display
 * @param isEditable - Whether the data is editable (default: true)
 * @param isKeyEditable - Whether keys are editable (default: false)
 * @param isValueEditable - Whether values are editable (default: true)
 * @param onChange - Callback: (path, changeData) => Promise<{code: number, message?: string}>
 *   - path: string using "." for object keys and ".." for array indices (e.g., "user.name", "tags..0", "items..1.name")
 *   - changeData: { old: { type: string, value: any }, new: { type: string, value: any } }
 * @param indent - Indentation in pixels (default: 20)
 * @param typeConversionBehavior - 'allow' | 'reject' (default: 'allow')
 * @param pathPrefix - Internal: path prefix for nested objects
 * @param depth - Internal: current nesting depth
 * @param isArrayItem - Internal: whether this object is an array item
 * @param keyOperationStateFromParent - Internal: key operation state passed from parent
 */
interface Props {
  data: any
  isEditable?: boolean
  isKeyEditable?: boolean
  isValueEditable?: boolean
  onChange?: (path: string, changeData: any) => Promise<{ code: number; message?: string; warning?: string }>
  indent?: number
  typeConversionBehavior?: TypeConversionBehavior
  pathPrefix?: string
  depth?: number
  isArrayItem?: boolean
  keyOperationStateFromParent?: KeyOperationState | null
}

interface KeyOperationState {
  path: string
  isProcessing?: boolean
  error?: string | null
  warning?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isEditable: true,
  isKeyEditable: false,
  isValueEditable: true,
  indent: 20,
  typeConversionBehavior: 'allow',
  pathPrefix: '',
  depth: 0,
  isArrayItem: false,
  keyOperationStateFromParent: null
})

const conversionMenu = ref<ConversionMenuRequest | null>(null)
const stringInputState = ref<{ path: string; oldValue: any; oldType: string; action?: string; currentKey?: string } | null>(null)
const rawJsonDisplay = ref<{ data: any; title: string } | null>(null)
const keyOperationStateInternal = ref<KeyOperationState | null>(null)

// Only root (depth 0) provides context
const isRoot = computed(() => props.depth === 0)

// Use internal state for root, prop for nested
const keyOperationState = computed(() => isRoot.value ? keyOperationStateInternal.value : props.keyOperationStateFromParent)
const setKeyOperationState = (state: KeyOperationState | null) => {
  if (isRoot.value) {
    keyOperationStateInternal.value = state
  }
}

// Setup context for root component
if (isRoot.value) {
  const showConversionMenu = (request: ConversionMenuRequest) => {
    conversionMenu.value = request
  }
  
  const queryParentInfo = createQueryParentInfo(props.data)
  
  provideJsonContext({
    typeConversionBehavior: props.typeConversionBehavior,
    showConversionMenu,
    queryParentInfo
  })
}

// Close menu
const closeMenu = () => {
  conversionMenu.value = null
}

// Handle StringInput confirmation
const handleStringInputConfirm = async (parsedValue: any) => {
  if (!stringInputState.value || !props.onChange) return

  const { path, oldValue, oldType, action, currentKey } = stringInputState.value
  const parsedType = Array.isArray(parsedValue) ? 'array' : typeof parsedValue

  // Close dialog first
  stringInputState.value = null

  // For key operations (replace/merge dict), show spinner on the key's row
  if ((action === 'replaceDictWithJson' || action === 'mergeDictWithJson') && isRoot.value) {
    const keyPath = path ? `${path}.${currentKey}` : (currentKey || '')
    setKeyOperationState({ path: keyPath, isProcessing: true, error: null })
  }

  // Then execute the operation
  try {
    let result
    if (action === 'mergeDictWithJson') {
      // Merge action: insert entries from parsedValue below the current entry
      const changeData = {
        old: { type: oldType, value: oldValue },
        new: { type: 'object', value: parsedValue },
        _action: 'mergeDictWithJson',
        _currentKey: currentKey
      }
      result = await props.onChange(path, changeData)
    } else if (action === 'replaceDictWithJson') {
      // Replace dict action
      const changeData = {
        old: { type: oldType, value: oldValue },
        new: { type: parsedType, value: parsedValue },
        _action: 'replaceDictWithJson'
      }
      result = await props.onChange(path, changeData)
    } else {
      // Default replace action
      const changeData = {
        old: { type: oldType, value: oldValue },
        new: { type: parsedType, value: parsedValue }
      }
      result = await props.onChange(path, changeData)
    }
    
    // Handle result for key operations
    if ((action === 'replaceDictWithJson' || action === 'mergeDictWithJson') && isRoot.value) {
      const keyPath = path ? `${path}.${currentKey}` : currentKey!
      if (result && result.code !== 0) {
        // Show error on the key's row
        setKeyOperationState({ path: keyPath, isProcessing: false, error: result.message || 'Operation failed' })
        // Auto-clear error after 3 seconds
        setTimeout(() => {
          if (keyOperationState.value && keyOperationState.value.path === keyPath) {
            setKeyOperationState(null)
          }
        }, 3000)
      } else if (result && result.warning) {
        // Show warning on the key's row
        setKeyOperationState({ path: keyPath, isProcessing: false, warning: result.warning })
        // Auto-clear warning after 5 seconds
        setTimeout(() => {
          if (keyOperationState.value && keyOperationState.value.path === keyPath) {
            setKeyOperationState(null)
          }
        }, 5000)
      } else {
        // Clear processing state on success
        setKeyOperationState(null)
      }
    }
  } catch (error) {
    console.error('Failed to apply string input:', error)
    // Clear processing state on exception
    if ((action === 'replaceDictWithJson' || action === 'mergeDictWithJson') && isRoot.value) {
      const keyPath = path ? `${path}.${currentKey}` : currentKey!
      setKeyOperationState({ path: keyPath, isProcessing: false, error: 'Operation failed' })
      setTimeout(() => {
        if (keyOperationState.value && keyOperationState.value.path === keyPath) {
          setKeyOperationState(null)
        }
      }, 3000)
    }
  }
}

// Handle StringInput cancellation
const handleStringInputCancel = () => {
  stringInputState.value = null
}

// Get parent container data from path
const getContainerData = (path: string) => {
  if (!props.data) return null

  // Root level
  if (!path || path === '') {
    return props.data
  }

  // Parse path to get parent container
  if (path.includes('..')) {
    // Array path like "tags..0" or "items..1.name"
    const parts = path.split('..')
    let current = props.data

    // Navigate through object keys in first part
    if (parts[0]) {
      const objKeys = parts[0].split('.').filter(k => k !== '')
      for (const key of objKeys) {
        current = current[key]
        if (!current) return null
      }
    }

    // Navigate through array parts
    for (let i = 1; i < parts.length; i++) {
      const segments = parts[i].split('.')
      const arrayIndex = parseInt(segments[0])
      const isLastPart = i === parts.length - 1
      const hasObjectKeys = segments.length > 1
      
      if (isLastPart) {
        // This is the last part - we're at or inside the item we're viewing
        if (hasObjectKeys) {
          // Path like "..0.key" - we're viewing a property inside the array item
          // Navigate to the array item (which is the parent container)
          current = current[arrayIndex]
          if (!current) return null
          
          // Navigate through object keys except the last one
          for (let j = 1; j < segments.length - 1; j++) {
            const key = segments[j]
            if (key) {
              current = current[key]
              if (!current) return null
            }
          }
          // Current is now the parent object containing the last key
        } else {
          // Path like "..0" - we're viewing the array item itself
          // Don't navigate through it; current is already the parent array
        }
      } else {
        // Not the last part - navigate through completely
        current = current[arrayIndex]
        if (!current) return null
        
        for (let j = 1; j < segments.length; j++) {
          const key = segments[j]
          if (key) {
            current = current[key]
            if (!current) return null
          }
        }
      }
    }

    // Current is now the parent container
    return current
  } else {
    // Object path like "user.name"
    const pathParts = path.split('.').filter(p => p !== '')
    
    if (pathParts.length === 0) {
      return props.data
    }

    let current = props.data
    // Navigate to parent object (all parts except the last)
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
      if (!current) return null
    }

    // Current is now the parent object
    return current
  }
}

// Handle menu item selection (both conversion and delete actions)
const handleMenuItemClick = async (item: MenuCompItemSingle) => {
  if (!conversionMenu.value || !props.onChange) return

  const action = item.data?.action
  const { path } = conversionMenu.value

  try {
    if (action === 'deleteEntry') {
      // Delete this entry from dict
      const changeData = {
        old: { type: typeof conversionMenu.value.value === 'object' && conversionMenu.value.value !== null ? 'object' : typeof conversionMenu.value.value, value: conversionMenu.value.value },
        new: { type: 'deleted' },
        _action: 'deleteEntry',
        _entryPath: path
      }
      await props.onChange(path, changeData)
    } else if (action === 'deleteDict') {
      // Delete/clear the parent dict that contains this entry
      const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'))
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : ''
      const changeData = {
        old: { type: 'object', value: null },
        new: { type: 'deleted' },
        _action: 'deleteParentDict',
        _entryPath: path,
        _parentPath: parentPath
      }
      await props.onChange(path, changeData)
    } else if (action === 'deleteAllEntries') {
      // Clear all entries in the parent dict
      const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'))
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : ''
      const changeData = {
        old: { type: 'object', value: null },
        new: { type: 'object', value: {} },
        _action: 'clearParentDict',
        _entryPath: path,
        _parentPath: parentPath
      }
      await props.onChange(path, changeData)
    } else if (action === 'deleteArrayItem') {
      // Delete this item from array
      const changeData = {
        old: { type: typeof conversionMenu.value.value === 'object' && conversionMenu.value.value !== null ? (Array.isArray(conversionMenu.value.value) ? 'array' : 'object') : typeof conversionMenu.value.value, value: conversionMenu.value.value },
        new: { type: 'deleted' },
        _action: 'deleteArrayItem',
        _itemPath: path
      }
      await props.onChange(path, changeData)
    } else if (action === 'deleteArray') {
      // Delete/clear the parent array that contains this item
      const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'))
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : ''
      const changeData = {
        old: { type: 'array', value: null },
        new: { type: 'deleted' },
        _action: 'deleteParentArray',
        _itemPath: path,
        _parentPath: parentPath
      }
      await props.onChange(path, changeData)
    } else if (action === 'clearArray') {
      // Clear all items in the parent array
      const pathParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'))
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : ''
      const changeData = {
        old: { type: 'array', value: null },
        new: { type: 'array', value: [] },
        _action: 'clearParentArray',
        _itemPath: path,
        _parentPath: parentPath
      }
      await props.onChange(path, changeData)
    } else if (action === 'addEntry' || action === 'addEntryAbove' || action === 'addEntryBelow') {
      // Add a new entry to dict
      const changeData = {
        old: { type: 'none' },
        new: { type: 'pseudo' },
        _action: action,
        _targetPath: path
      }
      await props.onChange(path, changeData)
    } else if (action === 'addItem' || action === 'addItemAbove' || action === 'addItemBelow') {
      // Add a new item to array
      const changeData = {
        old: { type: 'none' },
        new: { type: 'pseudo' },
        _action: action,
        _targetPath: path
      }
      await props.onChange(path, changeData)
    } else if (action === 'convertParentDictToText') {
      // Convert single-entry dict {key:value} to text "key:value"
      const parentParts = path.split('.').filter(p => p !== '')
      const parentPath = parentParts.length > 1 ? parentParts.slice(0, -1).join('.') : ''
      const key = conversionMenu.value.itemKey
      const value = conversionMenu.value.value
      const textValue = `${key}:${String(value)}`
      
      const changeData = {
        old: { type: 'object', value: { [key as string]: value } },
        new: { type: 'string', value: textValue },
        _action: 'convertParentToText',
        _parentPath: parentPath
      }
      await props.onChange(parentPath, changeData)
    } else if (action === 'convertParentArrayToText') {
      // Convert single-item array [value] to text "value"
      const parentParts = path.split('.').filter(p => p !== '' && !p.startsWith('.'))
      const parentPath = parentParts.length > 0 ? parentParts.slice(0, -1).join('.') : ''
      const value = conversionMenu.value.value
      const textValue = String(value)
      
      const changeData = {
        old: { type: 'array', value: [value] },
        new: { type: 'string', value: textValue },
        _action: 'convertParentToText',
        _parentPath: parentPath
      }
      await props.onChange(parentPath, changeData)
    } else if (action === 'moveEntryUp' || action === 'moveEntryDown') {
      // Move dict entry up or down
      const pathParts = path.split('.').filter(p => p !== '')
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : ''
      const changeData = {
        old: { type: 'entry' },
        new: { type: 'entry' },
        _action: action,
        _parentPath: parentPath
      }
      await props.onChange(path, changeData)
    } else if (action === 'moveItemUp' || action === 'moveItemDown') {
      // Move array item up or down
      const parts = path.split('..')
      const arrayPath = parts.length > 1 ? parts[0] + (parts.length > 2 ? '..' + parts.slice(1, -1).join('..') : '') : ''
      const changeData = {
        old: { type: 'arrayItem' },
        new: { type: 'arrayItem' },
        _action: action,
        _parentPath: arrayPath
      }
      await props.onChange(path, changeData)
    } else if (action === 'moveEntryToTop' || action === 'moveEntryToBottom') {
      // Move dict entry to top or bottom
      const pathParts = path.split('.').filter(p => p !== '')
      const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('.') : ''
      const changeData = {
        old: { type: 'entry' },
        new: { type: 'entry' },
        _action: action,
        _parentPath: parentPath
      }
      await props.onChange(path, changeData)
    } else if (action === 'moveItemToTop' || action === 'moveItemToBottom') {
      // Move array item to top or bottom
      const parts = path.split('..')
      const arrayPath = parts.length > 1 ? parts[0] + (parts.length > 2 ? '..' + parts.slice(1, -1).join('..') : '') : ''
      const changeData = {
        old: { type: 'arrayItem' },
        new: { type: 'arrayItem' },
        _action: action,
        _parentPath: arrayPath
      }
      await props.onChange(path, changeData)
    } else if (action === 'replaceWithJson') {
      // Replace current value with JSON/YAML object/array
      // Open StringInput dialog
      stringInputState.value = {
        path: path,
        oldValue: conversionMenu.value.currentValue,
        oldType: conversionMenu.value.currentType
      }
      // Close the menu
      closeMenu()
      return // Don't close menu at end
    } else if (action === 'replaceDictWithJson') {
      // Replace parent dict with JSON/YAML object
      // Compute parent path (remove last segment from path)
      const segments = parsePathToSegments(path)
      const parentSegments = segments.slice(0, -1)
      const parentPath = segmentsToPath(parentSegments)
      
      // Get the current parent dict value
      const parentData = getContainerData(parentPath)
      
      // Open StringInput dialog with parent path and parent data
      stringInputState.value = {
        path: parentPath,
        oldValue: parentData,
        oldType: 'object'
      }
      // Close the menu
      closeMenu()
      return // Don't close menu at end
    } else if (action === 'mergeDictWithJson') {
      // Merge JSON dict entries below the current entry
      // Compute parent path (remove last segment from path)
      const segments = parsePathToSegments(path)
      const currentKey = segments[segments.length - 1].key || ''
      const parentSegments = segments.slice(0, -1)
      const parentPath = segmentsToPath(parentSegments)
      
      // Get the current parent dict value
      const parentData = getContainerData(parentPath)
      
      // Open StringInput dialog with parent path and action info
      stringInputState.value = {
        path: parentPath,
        oldValue: parentData,
        oldType: 'object',
        action: 'mergeDictWithJson',
        currentKey: currentKey
      }
      // Close the menu
      closeMenu()
      return // Don't close menu at end
    } else if (action === 'viewRawJson') {
      // View raw JSON of parent container
      const containerData = getContainerData(path)
      if (containerData) {
        const isArray = Array.isArray(containerData)
        rawJsonDisplay.value = {
          data: containerData,
          title: isArray ? 'Raw JSON (Array)' : 'Raw JSON (Object)'
        }
      }
      // Close the menu
      closeMenu()
      return
    } else if (item.data?.targetType) {
      // Type conversion
      const { currentValue, currentType } = conversionMenu.value
      const { targetType } = item.data
      const convertedValue = convertValue(currentValue, targetType)
      const changeData = {
        old: { type: currentType, value: currentValue },
        new: { type: targetType, value: convertedValue }
      }
      await props.onChange(path, changeData)
    }
    
    // Close menu after action
    closeMenu()
  } catch (error) {
    console.error('Menu action failed:', error)
  }
}

// Generate menu items based on menu type
const getMenuItems = (): MenuCompItem[] => {
  if (!conversionMenu.value) return []

  const items: MenuCompItem[] = []
  const { menuType } = conversionMenu.value
  
  // Add type conversion menu if available (for values)
  if (conversionMenu.value.availableConversions) {
    items.push({
      type: 'menu',
      name: 'Convert to',
      children: conversionMenu.value.availableConversions.map(conv => ({
        type: 'item',
        name: conv.targetType,
        disabled: !conv.canConvert,
        data: { targetType: conv.targetType }
      }))
    })
  }
  
  // Add "Replace with JSON" for values and array items
  if (menuType === 'value' || menuType === 'arrayItem') {
    items.push({
      type: 'item',
      name: 'Replace with JSON',
      data: { action: 'replaceWithJson' }
    })
  }
  
  // Add "Replace dict with JSON" and "Merge dict with JSON" for keys
  if (menuType === 'key') {
    items.push({
      type: 'item',
      name: 'Replace dict with JSON',
      data: { action: 'replaceDictWithJson' }
    })
    items.push({
      type: 'item',
      name: 'Merge dict with JSON',
      data: { action: 'mergeDictWithJson' }
    })
  }
  
  // Add "View raw JSON" for all types (shows parent container)
  if (menuType === 'key' || menuType === 'value' || menuType === 'arrayItem') {
    items.push({
      type: 'item',
      name: 'View raw JSON',
      data: { action: 'viewRawJson' }
    })
  }
  
  // Add delete options based on menu type
  if (menuType === 'key' || menuType === 'value') {
    // For dict entries (key or value)
    items.push(
      {
        type: 'item',
        name: 'Add entry above',
        data: { action: 'addEntryAbove' }
      },
      {
        type: 'item',
        name: 'Add entry below',
        data: { action: 'addEntryBelow' }
      },
      {
        type: 'item',
        name: 'Delete entry',
        data: { action: 'deleteEntry' }
      },
      {
        type: 'item',
        name: 'Delete dict',
        data: { action: 'deleteDict' }
      },
      {
        type: 'item',
        name: 'Delete all entries',
        data: { action: 'deleteAllEntries' }
      }
    )
    
    // If this is the only entry in parent dict, show option (disabled if value is not primitive)
    if (conversionMenu.value.isSingleEntryInParent && conversionMenu.value.itemKey) {
      const valueIsPrimitive = conversionMenu.value.value === null || 
                               conversionMenu.value.value === undefined || 
                               typeof conversionMenu.value.value !== 'object'
      items.push({
        type: 'item',
        name: 'Convert parent dict to text',
        disabled: !valueIsPrimitive,
        data: { action: 'convertParentDictToText' }
      })
    }
    
    // Add move up/down for dict entries
    if (menuType === 'key' || (menuType === 'value' && 
        (conversionMenu.value.value === null || 
         conversionMenu.value.value === undefined || 
         typeof conversionMenu.value.value !== 'object'))) {
      items.push(
        {
          type: 'item',
          name: 'Move up',
          disabled: conversionMenu.value.isFirstInParent,
          data: { action: 'moveEntryUp' }
        },
        {
          type: 'item',
          name: 'Move down',
          disabled: conversionMenu.value.isLastInParent,
          data: { action: 'moveEntryDown' }
        },
        {
          type: 'item',
          name: 'Move to top',
          disabled: conversionMenu.value.isFirstInParent,
          data: { action: 'moveEntryToTop' }
        },
        {
          type: 'item',
          name: 'Move to bottom',
          disabled: conversionMenu.value.isLastInParent,
          data: { action: 'moveEntryToBottom' }
        }
      )
    }
  } else if (menuType === 'arrayItem') {
    // For array items
    items.push(
      {
        type: 'item',
        name: 'Add item above',
        data: { action: 'addItemAbove' }
      },
      {
        type: 'item',
        name: 'Add item below',
        data: { action: 'addItemBelow' }
      },
      {
        type: 'item',
        name: 'Delete item',
        data: { action: 'deleteArrayItem' }
      },
      {
        type: 'item',
        name: 'Delete array',
        data: { action: 'deleteArray' }
      },
      {
        type: 'item',
        name: 'Delete all items',
        data: { action: 'clearArray' }
      }
    )
    
    // If this is the only item in parent array, show option (disabled if item is not primitive)
    if (conversionMenu.value.isSingleEntryInParent) {
      const valueIsPrimitive = conversionMenu.value.value === null || 
                               conversionMenu.value.value === undefined || 
                               typeof conversionMenu.value.value !== 'object'
      items.push({
        type: 'item',
        name: 'Convert parent array to text',
        disabled: !valueIsPrimitive,
        data: { action: 'convertParentArrayToText' }
      })
    }
    
    // Add move up/down for array items (only for primitive values)
    const itemIsPrimitive = conversionMenu.value.value === null || 
                            conversionMenu.value.value === undefined || 
                            typeof conversionMenu.value.value !== 'object'
    if (itemIsPrimitive) {
      items.push(
        {
          type: 'item',
          name: 'Move up',
          disabled: conversionMenu.value.isFirstInParent,
          data: { action: 'moveItemUp' }
        },
        {
          type: 'item',
          name: 'Move down',
          disabled: conversionMenu.value.isLastInParent,
          data: { action: 'moveItemDown' }
        },
        {
          type: 'item',
          name: 'Move to top',
          disabled: conversionMenu.value.isFirstInParent,
          data: { action: 'moveItemToTop' }
        },
        {
          type: 'item',
          name: 'Move to bottom',
          disabled: conversionMenu.value.isLastInParent,
          data: { action: 'moveItemToBottom' }
        }
      )
    }
  } else if (menuType === 'emptyDict') {
    // For empty dict
    items.push(
      {
        type: 'item',
        name: 'Add entry',
        data: { action: 'addEntry' }
      },
      {
        type: 'item',
        name: 'Delete dict',
        data: { action: 'deleteDict' }
      }
    )
  } else if (menuType === 'emptyList') {
    // For empty list
    items.push(
      {
        type: 'item',
        name: 'Add item',
        data: { action: 'addItem' }
      }
    )
  }
  
  return items
}

// Render function for the actual content
const renderContent: any = (componentProps: any, SelfComponent: any): any => {
  // Handle null/undefined
  if (componentProps.data === null || componentProps.data === undefined) {
    return h('span', { class: 'json-null' }, 'null')
  }

  // Handle primitive types
  if (typeof componentProps.data !== 'object') {
    return h('span', { class: `json-primitive json-${typeof componentProps.data}` }, String(componentProps.data))
  }

  // Handle arrays
  if (Array.isArray(componentProps.data)) {
    // Check for pseudo items (marked with isPseudo: true)
    const realItems = componentProps.data.filter((item: any) => !(item && typeof item === 'object' && (item as any).isPseudo))
    const pseudoItems = componentProps.data.filter((item: any) => item && typeof item === 'object' && (item as any).isPseudo)
    
    if (realItems.length === 0 && pseudoItems.length === 0) {
      return h(EmptyList, { path: componentProps.pathPrefix || '' })
    }

    return h('div', {
      class: ['json-array', componentProps.isArrayItem ? 'json-array-in-array' : ''],
      style: { '--depth': componentProps.depth, '--json-indent': `${componentProps.indent}px` }
    }, [
      h('div', { class: 'json-bracket' }, '['),
      h('div', { class: 'json-array-items' }, componentProps.data.map((item: any, index: number) => {
        const itemPath = componentProps.pathPrefix ? `${componentProps.pathPrefix}..${index}` : `..${index}`
        const isLastItem = index === componentProps.data.length - 1
        const isPrimitive = item === null || item === undefined || typeof item !== 'object'
        const isPseudo = item && typeof item === 'object' && (item as any).isPseudo

        if (isPseudo) {
          return h('div', { key: `pseudo-${index}`, class: 'json-array-item' }, [
            h(PseudoListItem, {
              path: itemPath,
              onChange: componentProps.onChange!,
              onCancel: () => {
                // Handle cancel - notify parent to remove pseudo item
                if (componentProps.onChange) {
                  componentProps.onChange(itemPath, {
                    old: { type: 'pseudo' },
                    new: { type: 'deleted' },
                    _action: 'cancelCreate'
                  })
                }
              },
              depth: componentProps.depth
            })
          ])
        }

        return h('div', { key: index, class: 'json-array-item' }, [
          h(JsonListItemComp, {
            data: item,
            index: index,
            path: itemPath,
            isEditable: componentProps.isEditable && componentProps.isValueEditable,
            onChange: componentProps.onChange,
            depth: componentProps.depth
          }, () => [
            h(SelfComponent, {
              data: item,
              isEditable: componentProps.isEditable,
              isKeyEditable: componentProps.isKeyEditable,
              isValueEditable: componentProps.isValueEditable,
              onChange: componentProps.onChange,
              indent: componentProps.indent,
              pathPrefix: itemPath,
              depth: componentProps.depth + 1,
              isArrayItem: true,
              keyOperationStateFromParent: componentProps.keyOperationStateFromParent
            })
          ]),
          !isLastItem && isPrimitive ? h('span', { class: 'json-comma' }, ',') : null
        ])
      })),
      h('div', { class: 'json-bracket' }, ']')
    ])
  }

  // Handle objects
  const allKeys = Object.keys(componentProps.data)
  
  // Separate regular keys from pseudo keys
  const pseudoKeys = allKeys.filter(k => k.startsWith('__pseudo__'))
  const regularKeys = allKeys.filter(k => !k.startsWith('__pseudo__'))
  
  if (regularKeys.length === 0 && pseudoKeys.length === 0) {
    return h(EmptyDict, { path: componentProps.pathPrefix || '' })
  }

  // Build ordered list of items (keys + pseudo items in correct positions)
  const orderedItems: Array<{ type: 'key' | 'pseudo'; key: string; index?: number; pseudoData?: any }> = []
  
  regularKeys.forEach((key, index) => {
    // Check for pseudo items that should appear above this key
    pseudoKeys.forEach(pseudoKey => {
      const pseudoData = componentProps.data[pseudoKey]
      if (pseudoData && typeof pseudoData === 'object' && (pseudoData as any).__pseudo__ === true &&
          (pseudoData as any).position === 'above' && (pseudoData as any).referenceKey === key) {
        orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData })
      }
    })
    
    // Add the regular key
    orderedItems.push({ type: 'key', key, index })
    
    // Check for pseudo items that should appear below this key
    pseudoKeys.forEach(pseudoKey => {
      const pseudoData = componentProps.data[pseudoKey]
      if (pseudoData && typeof pseudoData === 'object' && (pseudoData as any).__pseudo__ === true &&
          (pseudoData as any).position === 'below' && (pseudoData as any).referenceKey === key) {
        orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData })
      }
    })
  })
  
  // Add any pseudo items without position (for empty dicts or at end)
  pseudoKeys.forEach(pseudoKey => {
    const pseudoData = componentProps.data[pseudoKey]
    if (pseudoData && typeof pseudoData === 'object' && (pseudoData as any).__pseudo__ === true &&
        !(pseudoData as any).position && !(pseudoData as any).referenceKey) {
      orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData })
    }
  })

  return h('div', {
    class: ['json-object', componentProps.isArrayItem ? 'json-object-in-array' : ''],
    style: { '--depth': componentProps.depth, '--json-indent': `${componentProps.indent}px` }
  }, [
    h('div', { class: 'json-bracket' }, '{'),
    h('div', { class: 'json-object-items' }, orderedItems.map((item, itemIndex) => {
      if (item.type === 'key') {
        const key = item.key
        const value = componentProps.data[key]
        const keyPath = componentProps.pathPrefix ? `${componentProps.pathPrefix}.${key}` : key
        const isLastItem = itemIndex === orderedItems.length - 1
        const isPrimitive = value === null || value === undefined || typeof value !== 'object'

        return h('div', { key, class: 'json-object-item' }, [
          h(JsonKeyValueComp, {
            itemKey: key,
            value: value,
            path: keyPath,
            isEditable: componentProps.isEditable,
            isKeyEditable: componentProps.isKeyEditable,
            isValueEditable: componentProps.isValueEditable,
            onChange: componentProps.onChange,
            depth: componentProps.depth,
            keyOperationState: componentProps.keyOperationStateFromParent
          }, () => [
            h(SelfComponent, {
              data: value,
              isEditable: componentProps.isEditable,
              isKeyEditable: componentProps.isKeyEditable,
              isValueEditable: componentProps.isValueEditable,
              onChange: componentProps.onChange,
              indent: componentProps.indent,
              pathPrefix: keyPath,
              depth: componentProps.depth + 1,
              keyOperationStateFromParent: componentProps.keyOperationStateFromParent
            })
          ]),
          !isLastItem && isPrimitive ? h('span', { class: 'json-comma' }, ',') : null
        ])
      } else {
        // Pseudo item
        const { key } = item
        const pseudoPath = componentProps.pathPrefix ? `${componentProps.pathPrefix}.${key}` : key
        return h('div', { key, class: 'json-object-item' }, [
          h(PseudoKeyValueComp, {
            path: pseudoPath,
            onChange: componentProps.onChange!,
            onCancel: () => {
              // Handle cancel - notify parent to remove pseudo item
              if (componentProps.onChange) {
                componentProps.onChange(pseudoPath, {
                  old: { type: 'pseudo' },
                  new: { type: 'deleted' },
                  _action: 'cancelCreate'
                })
              }
            },
            depth: componentProps.depth
          })
        ])
      }
    })),
    h('div', { class: 'json-bracket' }, '}')
  ])
}

// Create a recursive component reference
// We need to define this after renderContent is defined
const RecursiveJsonComp: any = defineComponent({
  name: 'RecursiveJsonComp',
  props: {
    data: { required: true },
    isEditable: { type: Boolean, default: true },
    isKeyEditable: { type: Boolean, default: false },
    isValueEditable: { type: Boolean, default: true },
    onChange: { type: Function },
    indent: { type: Number, default: 20 },
    pathPrefix: { type: String, default: '' },
    depth: { type: Number, default: 0 },
    isArrayItem: { type: Boolean, default: false },
    keyOperationStateFromParent: { type: Object, default: null }
  },
  setup(recursiveProps: any) {
    return () => {
      // Pass through keyOperationStateFromParent to child components
      const propsWithState = {
        ...recursiveProps,
        keyOperationStateFromParent: recursiveProps.keyOperationStateFromParent || null
      }
      // Just render the same logic, but use RecursiveJsonComp for recursive calls
      return renderContent(propsWithState, RecursiveJsonComp)
    }
  }
})

// Content renderer component that uses render function
const ContentRenderer = defineComponent({
  name: 'JsonContentRenderer',
  setup() {
    return () => {
      const propsWithState = {
        ...props,
        keyOperationStateFromParent: keyOperationState.value
      }
      return renderContent(propsWithState, RecursiveJsonComp)
    }
  }
})
</script>
