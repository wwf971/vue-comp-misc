<template>
  <div class="tabs-on-top-container">
    <div class="tabs-on-top-header">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-on-top-btn', { active: activeTabKey === tab.key }]"
        @click="handleTabClick(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tabs-on-top-content">
      <div
        v-for="(panelVnode, tabKey) in panels"
        :key="tabKey"
        :class="['tab-panel', { active: tabKey === activeTabKey }]"
        v-show="tabKey === activeTabKey"
      >
        <component :is="panelVnode" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, provide, useSlots } from 'vue'

const props = defineProps({
  defaultTab: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['tabChange'])
const slots = useSlots()

// Extract tab config from slots
let tabCounter = 0
const genTabKey = () => `tab-${++tabCounter}`

const tabs = ref([])
const panels = ref({})
const tabKeyMap = ref({})
const activeTabKey = ref(null)

// Process slots to extract tabs
const processSlots = () => {
  tabCounter = 0
  const tabsList = []
  const panelsMap = {}
  const keyMap = {}

  if (slots.default) {
    const children = slots.default()
    children.forEach((child) => {
      if (child.type && child.type.__isTabOnTopSlot) {
        const tabKey = genTabKey()
        const tabLabel = child.props?.label || 'Untitled'

        tabsList.push({
          key: tabKey,
          label: tabLabel
        })

        // Store the raw child vnode - let Vue handle rendering
        panelsMap[tabKey] = child
        keyMap[tabLabel.toLowerCase()] = tabKey
      }
    })
  }

  tabs.value = tabsList
  panels.value = panelsMap
  tabKeyMap.value = keyMap
}

// Get initial tab
const getInitialTab = () => {
  if (props.defaultTab) {
    const mappedKey = tabKeyMap.value[props.defaultTab.toLowerCase()]
    if (mappedKey) return mappedKey
    if (panels.value[props.defaultTab]) return props.defaultTab
  }
  return tabs.value[0]?.key || null
}

// Process slots on mount
onMounted(() => {
  processSlots()
  activeTabKey.value = getInitialTab()
})

// Method to switch tabs
const switchToTab = (tabIdentifier) => {
  // Try case-insensitive lookup
  const lowerIdentifier = String(tabIdentifier).toLowerCase()
  const targetKey = tabKeyMap.value[tabIdentifier] || tabKeyMap.value[lowerIdentifier] || tabIdentifier
  
  if (panels.value[targetKey]) {
    activeTabKey.value = targetKey
    emit('tabChange', targetKey)
  }
}

const handleTabClick = (tabKey) => {
  switchToTab(tabKey)
}

// Expose methods
defineExpose({
  switchTab: switchToTab
})

// Provide to descendants if needed
provide('tabsOnTop', {
  activeTabKey,
  switchToTab
})
</script>

<style scoped>
.tabs-on-top-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.tabs-on-top-header {
  display: flex;
  gap: 0px;
  padding: 0px;
  border-radius: 4px 4px 0 0;
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.tab-on-top-btn {
  padding: 4px 8px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.1s;
}

.tab-on-top-btn:hover {
  background-color: #f9f9f9;
  color: #333;
}

.tab-on-top-btn.active {
  background-color: #fff;
  color: #0066cc;
  font-weight: 600;
  border-color: #0066cc;
  border-bottom: 2px solid #fff;
  margin-bottom: -2px;
  position: relative;
  z-index: 1;
}

.tabs-on-top-content {
  flex: 1;
  overflow: auto;
  background-color: #fff;
  padding: 8px;
}

.tab-panel {
  width: 100%;
  height: 100%;
}
</style>

