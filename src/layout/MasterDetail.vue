<template>
  <div class="master-detail-container">
    <!-- Tabs Sidebar -->
    <div class="tabs-sidebar" :style="{ width: isCollapsed ? '40px' : sidebarWidth }">
      <!-- Header -->
      <div class="tabs-header">
        <h3 v-show="!isCollapsed">{{ title }}</h3>
        <button @click="toggleCollapse" class="collapse-btn" :title="isCollapsed ? 'Expand' : 'Collapse'">
          <span :class="['collapse-icon', { collapsed: isCollapsed }]">◀</span>
        </button>
      </div>

      <!-- Tab List -->
      <div class="tabs-list" v-show="!isCollapsed">
        <div v-for="tab in tabs" :key="tab.key">
          <!-- Tab -->
          <div class="tab-container">
            <!-- Triangle icon for expand/collapse -->
            <button
              @click.stop="onToggleExpand(tab.key)"
              class="tab-expand-btn"
            >
              <span :class="['tab-expand-icon', { expanded: tab.isExpanded }]">
                ▶
              </span>
            </button>

            <!-- Tab label -->
            <button
              @click="onTabClicked(tab.key)"
              :class="['tab-label-btn', { active: activeTabKey === tab.key }]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Subtabs (shown when expanded) -->
          <template v-if="tab.isExpanded">
            <button
              v-for="subtabKey in tab.subtabKeys"
              :key="subtabKey"
              @click="onSubtabClicked(subtabKey)"
              :class="['subtab-btn', { active: activeSubtabKey === subtabKey }]"
            >
              {{ subtabs[subtabKey]?.label }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Panels Container -->
    <div class="panels-container">
      <div
        v-for="(_, subtabKey) in panels"
        :key="subtabKey"
        v-show="subtabKey === activeSubtabKey"
      >
        <div v-if="!lazyRender || displayedPanels.has(subtabKey)">
          <component :is="getPanelComponent(subtabKey)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

// Type definitions
interface Tab {
  key: string
  label: string
  subtabKeys: string[]
  isExpanded?: boolean
}

interface Subtab {
  label: string
  isDefault?: boolean
}

interface TabStructure {
  tabs: Tab[]
  subtabs: Record<string, Subtab>
  panels: Record<string, () => any>
}

// Props
interface Props {
  title: string
  sidebarWidth?: string
  lazyRender?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sidebarWidth: '200px',
  lazyRender: true
})

// Slots
const slots = defineSlots<{
  default: any
}>()

// Generate unique keys
let tabCounter = 0
let subTabCounter = 0
const genTabKey = () => `tab-${++tabCounter}`
const genSubTabKey = () => `subtab-${++subTabCounter}`

// Extract tab structure from slots
const extractTabStructure = (): TabStructure => {
  tabCounter = 0
  subTabCounter = 0
  
  const tabs: Tab[] = []
  const subtabs: Record<string, Subtab> = {}
  const panels: Record<string, () => any> = {}

  const children = slots.default?.() || []
  
  children.forEach((tabChild: any) => {
    if (tabChild.type?.__isTabSlot) {
      const tabKey = genTabKey()
      const tabLabel = tabChild.props?.label || ''
      const subtabKeys: string[] = []

      const tabChildren = tabChild.children?.default?.() || []
      
      tabChildren.forEach((subtabChild: any) => {
        if (subtabChild.type?.__isSubTabSlot) {
          const subtabKey = genSubTabKey()
          const subtabLabel = subtabChild.props?.label || ''
          const isDefault = subtabChild.props?.isDefault || false

          subtabKeys.push(subtabKey)
          subtabs[subtabKey] = { label: subtabLabel, isDefault }

          // Extract panel content - store as a render function
          const subtabChildren = subtabChild.children?.default || (() => [])
          let foundPanel = false
          
          // Look for Panel wrapper
          const children = subtabChildren()
          children.forEach((panelChild: any) => {
            if (panelChild.type?.__isPanelSlot) {
              // Store the panel's render function
              panels[subtabKey] = panelChild.children?.default || (() => null)
              foundPanel = true
            }
          })
          
          // If no <Panel> component found, use all children as panel content
          if (!foundPanel) {
            panels[subtabKey] = subtabChildren
          }
        }
      })

      tabs.push({
        key: tabKey,
        label: tabLabel,
        subtabKeys: subtabKeys
      })
    }
  })

  return { tabs, subtabs, panels }
}

// Extract configuration on mount
const config = ref<TabStructure>({ tabs: [], subtabs: {}, panels: {} })

onMounted(() => {
  config.value = extractTabStructure()
  
  // Find default subtab
  const defaultSubtabKey = Object.entries(config.value.subtabs).find(
    ([_, subtab]) => subtab.isDefault
  )?.[0] || config.value.tabs[0]?.subtabKeys[0] || null
  
  activeSubtabKey.value = defaultSubtabKey
  
  // Find which tab contains the default subtab
  const parentTab = config.value.tabs.find(tab =>
    tab.subtabKeys.includes(defaultSubtabKey || '')
  )
  
  if (parentTab) {
    activeTabKey.value = parentTab.key
    // Expand the tab containing the default subtab
    tabs.value = config.value.tabs.map(tab => ({
      ...tab,
      isExpanded: tab.key === parentTab.key
    }))
  } else {
    tabs.value = config.value.tabs.map((tab, index) => ({
      ...tab,
      isExpanded: index === 0
    }))
  }
  
  // Initialize displayed panels
  if (props.lazyRender && defaultSubtabKey) {
    displayedPanels.value.add(defaultSubtabKey)
  } else if (!props.lazyRender) {
    Object.keys(config.value.panels).forEach(key => {
      displayedPanels.value.add(key)
    })
  }
})

// State
const tabs = ref<Tab[]>([])
const activeTabKey = ref<string>('')
const activeSubtabKey = ref<string | null>(null)
const displayedPanels = ref<Set<string>>(new Set())
const isCollapsed = ref(false)

// Computed
const subtabs = computed(() => config.value.subtabs)
const panels = computed(() => config.value.panels)

// Cache for panel components to prevent recreation
const panelComponentCache = new Map()

// Get or create panel component
const getPanelComponent = (subtabKey: string) => {
  if (!panelComponentCache.has(subtabKey)) {
    const panelFn = config.value.panels[subtabKey]
    if (panelFn) {
      // Create a component wrapper that calls the render function
      const component = {
        name: `Panel_${subtabKey}`,
        render: panelFn
      }
      panelComponentCache.set(subtabKey, component)
    }
  }
  return panelComponentCache.get(subtabKey)
}

// Watch activeSubtabKey to add to displayed panels
watch(activeSubtabKey, (newKey) => {
  if (newKey && props.lazyRender) {
    displayedPanels.value.add(newKey)
  }
})

// Methods
const onTabClicked = (tabKey: string) => {
  activeTabKey.value = tabKey

  // Toggle expand state
  const targetTab = tabs.value.find(tab => tab.key === tabKey)
  if (targetTab) {
    tabs.value = tabs.value.map(tab =>
      tab.key === tabKey
        ? { ...tab, isExpanded: !tab.isExpanded }
        : tab
    )

    // Set first subtab as active if tab has subtabs
    if (targetTab.subtabKeys.length > 0) {
      activeSubtabKey.value = targetTab.subtabKeys[0]
    } else {
      activeSubtabKey.value = null
    }
  }
}

const onSubtabClicked = (subtabKey: string | null) => {
  if (!subtabKey) return

  // Find the parent tab that contains this subtab
  const parentTab = tabs.value.find(tab => tab.subtabKeys.includes(subtabKey))

  // Set the parent tab as active if found and not already active
  if (parentTab && parentTab.key !== activeTabKey.value) {
    activeTabKey.value = parentTab.key
  }

  activeSubtabKey.value = subtabKey
}

const onToggleExpand = (tabKey: string) => {
  tabs.value = tabs.value.map(tab =>
    tab.key === tabKey
      ? { ...tab, isExpanded: !tab.isExpanded }
      : tab
  )

  // Handle subtab state when toggling
  const currentTab = tabs.value.find(tab => tab.key === tabKey)
  if (!currentTab?.isExpanded) {
    // If expanding and this is the active tab, set first subtab as active
    if (activeTabKey.value === tabKey && currentTab && currentTab.subtabKeys.length > 0) {
      activeSubtabKey.value = currentTab.subtabKeys[0]
    }
  }
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.master-detail-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.tabs-sidebar {
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tabs-header {
  padding: 8px;
  border-bottom: 1px solid #ddd;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.collapse-btn:hover {
  background-color: #e8e8e8;
}

.collapse-icon {
  display: inline-block;
  transition: transform 0.2s;
  font-size: 12px;
  color: #666;
}

.collapse-icon.collapsed {
  transform: rotate(180deg);
}

.tabs-list {
  flex: 1;
  padding: 0px 4px;
}

.tab-container {
  display: flex;
  align-items: center;
  padding: 0px;
}

.tab-expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 24px;
}

.tab-expand-icon {
  display: inline-block;
  transition: transform 0.2s;
  font-size: 10px;
  color: #666;
}

.tab-expand-icon.expanded {
  transform: rotate(90deg);
}

.tab-label-btn {
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  padding-left: 4px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.tab-label-btn:hover {
  background-color: #e8e8e8;
}

.tab-label-btn.active {
  background-color: #d0d0d0;
  font-weight: 600;
}

.subtab-btn {
  width: calc(100% - 32px);
  margin-left: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  text-align: left;
  font-size: 13px;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: block;
}

.subtab-btn:hover {
  background-color: #e8e8e8;
}

.subtab-btn.active {
  background-color: #c0c0c0;
  font-weight: 600;
}

.panels-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #fff;
}
</style>

