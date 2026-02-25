<template>
  <JsonContextProvider 
    v-if="isRoot"
    :typeConversionBehavior="typeConversionBehavior"
    :showConversionMenu="showConversionMenu"
    :rootData="data"
    :isDebug="isDebug"
  >
    <component :is="renderContent()" />
    
    <MenuComp
      v-if="conversionMenu"
      :items="getMenuItems(conversionMenu)"
      :position="conversionMenu.position"
      :onClose="closeMenu"
      :onItemClick="handleMenuItemClick"
      @contextmenu.prevent
    />
  </JsonContextProvider>
  <component v-else :is="renderContent()" />
</template>

<script setup>
import { ref, computed, h, getCurrentInstance } from 'vue'
import JsonKeyValueComp from './JsonKeyValueComp.vue'
import { getKeyIdentity, getOrderedKeys } from './keyOrderStore'
import PseudoKeyValueComp from './PseudoKeyValueComp.vue'
import EmptyDict from './EmptyDict.vue'
import EmptyList from './EmptyList.vue'
import ItemWrapperArray from './ItemWrapperArray.vue'
import ItemWrapperObject from './ItemWrapperObject.vue'
import { usePathRef } from './pathRef'
import { JsonContextProvider } from './JsonContext'
import MenuComp from '../../menu/MenuComp.vue'
import { handleMenuItemClick as handleMenuItemClickImpl } from './menuClick'
import { getMenuItems } from './menuItems'
import './JsonComp.css'

const props = defineProps({
  data: null,
  isEditable: { type: Boolean, default: true },
  isKeyEditable: { type: Boolean, default: false },
  isValueEditable: { type: Boolean, default: true },
  onChange: Function,
  indent: { type: Number, default: 20 },
  typeConversionBehavior: { type: String, default: 'allow' },
  isDebug: { type: Boolean, default: false },
  pathPrefix: { type: String, default: '' },
  pathPrefixRef: Object,
  depth: { type: Number, default: 0 },
  isArrayItem: { type: Boolean, default: false }
})

const conversionMenu = ref(null)
const localPathPrefixRef = usePathRef(props.pathPrefix)
const activePathPrefixRef = computed(() => props.pathPrefixRef || localPathPrefixRef)
const activePathPrefix = computed(() => activePathPrefixRef.value.value || activePathPrefixRef.value.current || '')

const isRoot = computed(() => props.depth === 0)

// Get current component instance for recursive rendering
const instance = getCurrentInstance()
const JsonCompMobx = instance?.type

// Handle conversion menu request from value components
const showConversionMenu = (request) => {
  conversionMenu.value = request
}

// Close menu
const closeMenu = () => {
  conversionMenu.value = null
}

// Handle menu item selection
const handleMenuItemClick = async (item) => {
  await handleMenuItemClickImpl({
    item,
    conversionMenu: conversionMenu.value,
    data: props.data,
    onChange: props.onChange,
    closeMenu
  })
}

// Render function for the actual content
const renderContent = () => {
  // Handle null/undefined
  if (props.data === null || props.data === undefined) {
    return () => h('span', { class: 'json-null' }, 'null')
  }

  // Handle primitive types
  if (typeof props.data !== 'object') {
    return () => h('span', { class: `json-primitive json-${typeof props.data}` }, String(props.data))
  }

  // Handle arrays
  if (Array.isArray(props.data)) {
    // Check if empty
    if (props.data.length === 0) {
      return () => h(EmptyList, { path: activePathPrefix.value || '' })
    }

    // Generate indices array
    const indices = []
    for (let i = 0; i < props.data.length; i++) {
      indices.push(i)
    }

    return () => h('div', 
      { 
        class: ['json-array', props.isArrayItem ? 'json-array-in-array' : ''],
        style: { '--depth': props.depth, '--json-indent': `${props.indent}px` }
      },
      [
        h('div', { class: 'json-bracket' }, '['),
        h('div', { class: 'json-array-items' }, 
          indices.map(index => 
            h(ItemWrapperArray, {
              key: index,
              data: props.data,
              index,
              pathPrefixRef: activePathPrefixRef.value,
              isEditable: props.isEditable,
              isKeyEditable: props.isKeyEditable,
              isValueEditable: props.isValueEditable,
              onChange: props.onChange,
              indent: props.indent,
              depth: props.depth,
              JsonCompMobx: JsonCompMobx
            })
          )
        ),
        h('div', { class: 'json-bracket' }, ']')
      ]
    )
  }

  // Handle objects
  const rawKeys = Object.keys(props.data).filter(key => key !== '__mobxVersion')
  const allKeys = getOrderedKeys(props.data, rawKeys)
  
  // Separate pseudo keys from regular keys
  const pseudoKeys = allKeys.filter(k => k.startsWith('__pseudo__'))
  const regularKeys = allKeys.filter(k => !k.startsWith('__pseudo__'))
  
  if (regularKeys.length === 0 && pseudoKeys.length === 0) {
    return () => h(EmptyDict, { path: activePathPrefix.value || '' })
  }

  // Build ordered list of items (keys + pseudo items in correct positions)
  const orderedItems = []
  
  regularKeys.forEach((key, index) => {
    // Check for pseudo items that should appear above this key
    pseudoKeys.forEach(pseudoKey => {
      const pseudoData = props.data[pseudoKey]
      if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true &&
          pseudoData.position === 'above' && pseudoData.referenceKey === key) {
        orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData })
      }
    })
    
    // Add the regular key
    orderedItems.push({ type: 'key', key, index })
    
    // Check for pseudo items that should appear below this key
    pseudoKeys.forEach(pseudoKey => {
      const pseudoData = props.data[pseudoKey]
      if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true &&
          pseudoData.position === 'below' && pseudoData.referenceKey === key) {
        orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData })
      }
    })
  })
  
  // Add any pseudo items without position (for empty dicts or at end)
  pseudoKeys.forEach(pseudoKey => {
    const pseudoData = props.data[pseudoKey]
    if (pseudoData && typeof pseudoData === 'object' && pseudoData.__pseudo__ === true &&
        !pseudoData.position && !pseudoData.referenceKey) {
      orderedItems.push({ type: 'pseudo', key: pseudoKey, pseudoData })
    }
  })

  return () => h('div',
    {
      class: ['json-object', props.isArrayItem ? 'json-object-in-array' : ''],
      style: { '--depth': props.depth, '--json-indent': `${props.indent}px` }
    },
    [
      h('div', { class: 'json-bracket' }, '{'),
      h('div', { class: 'json-object-items' },
        orderedItems.map((item, itemIndex) => {
          if (item.type === 'key') {
            const key = item.key
            const value = props.data[key]
            const isLastItem = itemIndex === orderedItems.length - 1

            const keyIdentity = getKeyIdentity(props.data, key)

            return h(ItemWrapperObject, {
              key: keyIdentity,
              data: props.data,
              itemKey: key,
              pathPrefixRef: activePathPrefixRef.value,
              isEditable: props.isEditable,
              isKeyEditable: props.isKeyEditable,
              isValueEditable: props.isValueEditable,
              onChange: props.onChange,
              indent: props.indent,
              depth: props.depth,
              isLastItem,
              JsonCompMobx: JsonCompMobx
            })
          } else {
            // Pseudo item
            const { key, pseudoData } = item
            const pseudoPath = activePathPrefix.value ? `${activePathPrefix.value}.${key}` : key
            return h('div', { key, class: 'json-object-item' },
              h(PseudoKeyValueComp, {
                path: pseudoPath,
                data: props.data,
                pseudoKey: key,
                onChange: props.onChange,
                onCancel: () => {
                  delete props.data[key]
                },
                depth: props.depth
              })
            )
          }
        })
      ),
      h('div', { class: 'json-bracket' }, '}')
    ]
  )
}
</script>
