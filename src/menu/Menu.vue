<template>
  <div>
    <div 
      class="menu-backdrop" 
      @click="emit('close')"
      @contextmenu="handleBackdropContextMenu"
    />
    
    <div 
      class="context-menu" 
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      @mouseleave="handleMenuMouseLeave"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="`context-menu-item ${item.type === 'menu' ? 'has-submenu' : ''}`"
        @click="(e) => handleItemClick(item, e)"
        @mouseenter="(e) => handleItemMouseEnter(item, index, e)"
        @contextmenu="handleItemContextMenu"
      >
        <span>{{ item.name }}</span>
        <span v-if="item.type === 'menu'" class="submenu-arrow">▶</span>
      </div>
    </div>

    <Menu
      v-if="hoveredSubmenu !== null && submenuPosition && items[hoveredSubmenu].type === 'menu'"
      :items="(items[hoveredSubmenu] as MenuItemSubmenu).children"
      :position="submenuPosition"
      @close="emit('close')"
      @item-click="emit('item-click', $event)"
      @contextmenu="emit('contextmenu', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import './Menu.css'

export interface MenuItemBase {
  name: string
  data?: any
}

export interface MenuItemSingle extends MenuItemBase {
  type: 'item'
}

export interface MenuItemSubmenu extends MenuItemBase {
  type: 'menu'
  children: MenuItem[]
}

export type MenuItem = MenuItemSingle | MenuItemSubmenu

interface Props {
  items: MenuItem[]
  position: { x: number; y: number }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'item-click': [item: MenuItemSingle]
  contextmenu: [e: MouseEvent]
}>()

const hoveredSubmenu = ref<number | null>(null)
const submenuPosition = ref<{ x: number; y: number } | null>(null)

watch(() => [props.position.x, props.position.y], () => {
  hoveredSubmenu.value = null
  submenuPosition.value = null
})

const handleItemClick = (item: MenuItem, e: MouseEvent) => {
  if ((e as any).button !== 0) return
  
  if (item.type === 'item') {
    emit('item-click', item)
    emit('close')
  }
}

const handleItemContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleItemMouseEnter = (item: MenuItem, index: number, event: MouseEvent) => {
  if (item.type === 'menu') {
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

const handleMenuMouseLeave = () => {
  // Don't immediately close submenu
}

const handleBackdropContextMenu = (e: MouseEvent) => {
  emit('contextmenu', e)
  e.preventDefault()
}
</script>
