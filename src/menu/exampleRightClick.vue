<template>
  <div class="menu-rightclick-demo">
    <div
      class="menu-rightclick-zone"
      @contextmenu.prevent="handleContextMenu"
    >
      Right-click here. Right-click again (anywhere) to reposition. Menu content updates with each click.
    </div>
    <div v-if="clickedItem" class="menu-rightclick-feedback">
      Clicked: {{ clickedItem }}
    </div>
    <Menu
      v-if="menuPos"
      :items="menuItems"
      :position="menuPos"
      @close="menuPos = null"
      @item-click="onItemClick"
      @contextmenu="handleContextMenu"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Menu from './Menu.vue'

const menuPos = ref(null)
const clickCount = ref(0)
const clickedItem = ref('')

const menuItems = computed(() => [
  { type: 'item', name: `Click #${clickCount.value}`, data: { action: 'clickCount' } },
  {
    type: 'menu',
    name: 'Submenu',
    children: [
      { type: 'item', name: 'Sub Action A', data: { action: 'subA' } },
      { type: 'item', name: 'Sub Action B', data: { action: 'subB' } }
    ]
  },
  { type: 'item', name: 'Close Menu', data: { action: 'close' } }
])

function handleContextMenu(e) {
  clickCount.value += 1
  menuPos.value = null
  requestAnimationFrame(() => {
    menuPos.value = { x: e.clientX, y: e.clientY }
  })
}

function onItemClick(item) {
  clickedItem.value = `${item.name} (${item.data?.action})`
}
</script>

<style scoped>
.menu-rightclick-demo {
  margin-top: 8px;
}

.menu-rightclick-zone {
  border: 2px dashed #ccc;
  text-align: center;
  cursor: context-menu;
  user-select: none;
  padding: 24px;
}

.menu-rightclick-feedback {
  margin-top: 8px;
  color: #007bff;
  font-size: 13px;
}
</style>
