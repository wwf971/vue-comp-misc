<template>
  <!-- Backdrop to close menu when clicking outside -->
  <div 
    ref="backdropRef"
    class="menu-backdrop" 
    @click="onClose"
    @contextmenu="handleBackdropContextMenu"
  />
  
  <!-- Menu -->
  <div 
    ref="menuRef"
    class="context-menu" 
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
  >
    <div
      v-for="(item, index) in items"
      :key="index"
      :class="[
        'context-menu-item',
        { 'has-submenu': item.type === 'menu', 'disabled': item.disabled }
      ]"
      @click="(e) => handleItemClick(item, e)"
      @mouseenter="(e) => handleItemMouseEnter(item, index, e)"
    >
      <component 
        v-if="item.component" 
        :is="item.component" 
        v-bind="item.componentProps || {}"
        :style="getComponentStyle(item)"
      />
      <span v-else>{{ item.name }}</span>
      <span v-if="item.type === 'menu'" class="submenu-arrow">▶</span>
    </div>
  </div>

  <!-- Submenu -->
  <MenuComp
    v-if="hoveredSubmenu !== null && submenuPosition && items[hoveredSubmenu]?.type === 'menu'"
    :items="(items[hoveredSubmenu] as MenuCompItemSubmenu).children"
    :position="submenuPosition"
    :onClose="onClose"
    :onItemClick="onItemClick"
    :onContextMenu="onContextMenu"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, type Component, type CSSProperties } from 'vue'

/**
 * Menu item that renders a custom component
 */
export interface MenuCompItemBase {
  name: string
  component?: Component
  componentProps?: any
  preferredWidth?: number  // in pixels
  preferredHeight?: number // in pixels
  data?: any
  disabled?: boolean
}

export interface MenuCompItemSingle extends MenuCompItemBase {
  type: 'item'
}

export interface MenuCompItemSubmenu extends MenuCompItemBase {
  type: 'menu'
  children: MenuCompItem[]
}

export type MenuCompItem = MenuCompItemSingle | MenuCompItemSubmenu

interface Props {
  items: MenuCompItem[]
  position: { x: number; y: number }
  onClose: () => void
  onItemClick: (item: MenuCompItemSingle) => void
  onContextMenu?: (e: MouseEvent) => void
}

const props = defineProps<Props>()

const hoveredSubmenu = ref<number | null>(null)
const submenuPosition = ref<{ x: number; y: number } | null>(null)
const menuRef = ref<HTMLDivElement>()
const backdropRef = ref<HTMLDivElement>()

// Reset submenu state when menu position changes (right-click reposition)
watch(() => [props.position.x, props.position.y], () => {
  hoveredSubmenu.value = null
  submenuPosition.value = null
})

// Adjust menu position if it goes off-screen
watch(() => props.position, async () => {
  await nextTick()
  if (menuRef.value) {
    const rect = menuRef.value.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = props.position.x
    let adjustedY = props.position.y

    // Adjust horizontal position
    if (rect.right > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 5
    }

    // Adjust vertical position
    if (rect.bottom > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 5
    }

    if (adjustedX !== props.position.x || adjustedY !== props.position.y) {
      menuRef.value.style.left = `${adjustedX}px`
      menuRef.value.style.top = `${adjustedY}px`
    }
  }
}, { immediate: true, deep: true })

const handleItemClick = (item: MenuCompItem, e: MouseEvent) => {
  if (item.disabled) {
    e.stopPropagation()
    return
  }

  if (item.type === 'item') {
    props.onItemClick(item)
    props.onClose()
  }
}

const handleItemMouseEnter = (item: MenuCompItem, index: number, event: MouseEvent) => {
  if (item.type === 'menu' && !item.disabled) {
    const target = event.currentTarget as HTMLDivElement
    const rect = target.getBoundingClientRect()
    hoveredSubmenu.value = index
    submenuPosition.value = {
      x: rect.right,
      y: rect.top
    }
  } else {
    hoveredSubmenu.value = null
    submenuPosition.value = null
  }
}

const handleBackdropContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  
  // Temporarily hide ALL menus and backdrops to find element underneath
  const allMenus = document.querySelectorAll('.context-menu')
  const allBackdrops = document.querySelectorAll('.menu-backdrop')
  
  // Store original styles
  const originalStyles: Array<{ element: HTMLElement, display: string }> = []
  const originalBackdropStyles: Array<{ element: HTMLElement, pointerEvents: string }> = []
  
  // Hide all menus
  allMenus.forEach(menu => {
    const htmlMenu = menu as HTMLElement
    originalStyles.push({ element: htmlMenu, display: htmlMenu.style.display })
    htmlMenu.style.display = 'none'
  })
  
  // Disable pointer events on all backdrops
  allBackdrops.forEach(backdrop => {
    const htmlBackdrop = backdrop as HTMLElement
    originalBackdropStyles.push({ element: htmlBackdrop, pointerEvents: htmlBackdrop.style.pointerEvents })
    htmlBackdrop.style.pointerEvents = 'none'
  })
  
  // Get the element underneath
  const elementUnder = document.elementFromPoint(e.clientX, e.clientY)
  
  // Restore all menus
  originalStyles.forEach(({ element, display }) => {
    element.style.display = display
  })
  
  // Restore all backdrops
  originalBackdropStyles.forEach(({ element, pointerEvents }) => {
    element.style.pointerEvents = pointerEvents
  })
  
  if (elementUnder) {
    // Close the menu first, then dispatch event
    props.onClose()
    
    // Use setTimeout to ensure menu is fully closed before dispatching
    setTimeout(() => {
      const contextMenuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: e.clientX,
        clientY: e.clientY,
        button: 2
      })
      elementUnder.dispatchEvent(contextMenuEvent)
    }, 10)
  } else {
    // If no element found, close the menu
    props.onClose()
  }
}

const getComponentStyle = (item: MenuCompItem): CSSProperties => {
  const style: CSSProperties = {}

  // Apply width constraint (overflow hidden if exceeded)
  if (item.preferredWidth) {
    style.width = `${item.preferredWidth}px`
    style.maxWidth = `${item.preferredWidth}px`
    style.overflow = 'hidden'
    style.textOverflow = 'ellipsis'
    style.whiteSpace = 'nowrap'
  }

  // Apply height constraint (but allow overflow to increase item height)
  if (item.preferredHeight) {
    style.minHeight = `${item.preferredHeight}px`
    // Don't set maxHeight - let content expand the item
  }

  return style
}
</script>

<style scoped>
.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 100px;
  z-index: 999;
  padding: 4px 0;
}

.context-menu-item {
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.15s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.context-menu-item:hover:not(.disabled) {
  background-color: #e3f2fd;
}

.context-menu-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.context-menu-item.has-submenu {
  padding-right: 8px;
}

.submenu-arrow {
  font-size: 10px;
  color: #666;
}
</style>
