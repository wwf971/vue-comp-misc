<template>
  <div>
    <div 
      ref="backdropRef"
      class="menu-backdrop" 
      @click="emit('close')"
      @contextmenu="handleBackdropContextMenu"
    />
    
    <div 
      ref="menuRef"
      class="context-menu" 
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="`context-menu-item ${item.type === 'menu' ? 'has-submenu' : ''} ${item.disabled ? 'disabled' : ''}`"
        @click="(e) => handleItemClick(item, e)"
        @mouseenter="(e) => handleItemMouseEnter(item, index, e)"
      >
        <div v-if="item.component" :style="getItemStyle(item)">
          <component :is="item.component" v-bind="item.componentProps || {}" />
        </div>
        <span v-else>{{ item.name }}</span>
        <span v-if="item.type === 'menu'" class="submenu-arrow">▶</span>
      </div>
    </div>

    <MenuComp
      v-if="hoveredSubmenu !== null && submenuPosition && items[hoveredSubmenu].type === 'menu'"
      :items="(items[hoveredSubmenu] as MenuCompItemSubmenu).children"
      :position="submenuPosition"
      @close="emit('close')"
      @item-click="emit('item-click', $event)"
      @contextmenu="emit('contextmenu', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, type Component } from 'vue'
import './Menu.css'

export interface MenuCompItemBase {
  name: string
  component?: Component
  componentProps?: any
  preferredWidth?: number
  preferredHeight?: number
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
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'item-click': [item: MenuCompItemSingle]
  contextmenu: [e: MouseEvent]
}>()

const hoveredSubmenu = ref<number | null>(null)
const submenuPosition = ref<{ x: number; y: number } | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const backdropRef = ref<HTMLElement | null>(null)

watch(() => [props.position.x, props.position.y], () => {
  hoveredSubmenu.value = null
  submenuPosition.value = null
})

onMounted(async () => {
  await nextTick()
  adjustMenuPosition()
})

watch(() => props.position, async () => {
  await nextTick()
  adjustMenuPosition()
}, { deep: true })

const adjustMenuPosition = () => {
  if (menuRef.value) {
    const rect = menuRef.value.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = props.position.x
    let adjustedY = props.position.y

    if (rect.right > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 5
    }

    if (rect.bottom > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 5
    }

    if (adjustedX !== props.position.x || adjustedY !== props.position.y) {
      menuRef.value.style.left = `${adjustedX}px`
      menuRef.value.style.top = `${adjustedY}px`
    }
  }
}

const handleItemClick = (item: MenuCompItem, e: MouseEvent) => {
  if (item.disabled) {
    e.stopPropagation()
    return
  }

  if (item.type === 'item') {
    emit('item-click', item)
    emit('close')
  }
}

const handleItemMouseEnter = (item: MenuCompItem, index: number, event: MouseEvent) => {
  if (item.type === 'menu' && !item.disabled) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
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
  
  const allMenus = document.querySelectorAll('.context-menu')
  const allBackdrops = document.querySelectorAll('.menu-backdrop')
  
  const originalStyles: Array<{ element: HTMLElement, display: string }> = []
  const originalBackdropStyles: Array<{ element: HTMLElement, pointerEvents: string }> = []
  
  allMenus.forEach(menu => {
    const htmlMenu = menu as HTMLElement
    originalStyles.push({ element: htmlMenu, display: htmlMenu.style.display })
    htmlMenu.style.display = 'none'
  })
  
  allBackdrops.forEach(backdrop => {
    const htmlBackdrop = backdrop as HTMLElement
    originalBackdropStyles.push({ element: htmlBackdrop, pointerEvents: htmlBackdrop.style.pointerEvents })
    htmlBackdrop.style.pointerEvents = 'none'
  })
  
  const elementUnder = document.elementFromPoint(e.clientX, e.clientY)
  
  originalStyles.forEach(({ element, display }) => {
    element.style.display = display
  })
  
  originalBackdropStyles.forEach(({ element, pointerEvents }) => {
    element.style.pointerEvents = pointerEvents
  })
  
  if (elementUnder) {
    emit('close')
    
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
    emit('close')
  }
}

const getItemStyle = (item: MenuCompItem) => {
  const style: any = {}

  if (item.preferredWidth) {
    style.width = `${item.preferredWidth}px`
    style.maxWidth = `${item.preferredWidth}px`
    style.overflow = 'hidden'
    style.textOverflow = 'ellipsis'
    style.whiteSpace = 'nowrap'
  }

  if (item.preferredHeight) {
    style.minHeight = `${item.preferredHeight}px`
  }

  return style
}
</script>
