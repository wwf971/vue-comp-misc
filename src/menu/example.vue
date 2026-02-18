<template>
  <div class="menu-examples-all">
    <div class="menu-examples-head">Single-Level Menu</div>
    <div class="menu-examples-block">
      <div
        class="menu-examples-zone"
        @contextmenu.prevent="singlePos = { x: $event.clientX, y: $event.clientY }"
      >
        Right-click here to open menu. Right-click again (anywhere) to reposition.
      </div>
      <div v-if="singleClicked" class="menu-examples-feedback">
        Clicked: {{ singleClicked }}
      </div>
      <Menu
        v-if="singlePos"
        :items="singleItems"
        :position="singlePos"
        @close="singlePos = null"
        @item-click="onSingleClick"
        @contextmenu="singlePos = { x: $event.clientX, y: $event.clientY }"
      />
    </div>

    <div class="menu-examples-head menu-examples-head-spaced">
      Multi-Level Menu
      <span class="menu-examples-hint">Hover over items to see submenus</span>
    </div>
    <div class="menu-examples-block">
      <div
        class="menu-examples-zone"
        @contextmenu.prevent="multiPos = { x: $event.clientX, y: $event.clientY }"
      >
        Right-click here for multi-level menu.
      </div>
      <div v-if="multiClicked" class="menu-examples-feedback">
        Clicked: {{ multiClicked }}
      </div>
      <Menu
        v-if="multiPos"
        :items="multiItems"
        :position="multiPos"
        @close="multiPos = null"
        @item-click="onMultiClick"
        @contextmenu="multiPos = { x: $event.clientX, y: $event.clientY }"
      />
    </div>

    <div class="menu-examples-head menu-examples-head-spaced">
      Right-Click Repositioning Pattern
      <span class="menu-examples-hint">Demonstrates correct implementation</span>
    </div>
    <MenuRightClickExample />

    <div class="menu-examples-features">
      <span class="menu-examples-features-title">Features:</span>
      <ul class="menu-examples-features-list">
        <li>Right-click to open context menu</li>
        <li>Right-click again (anywhere) to reposition menu</li>
        <li>Left-click outside or on items to close</li>
        <li>Supports single-level and multi-level (nested) menus</li>
        <li>Hover over submenu items to reveal nested options</li>
        <li>Pass contextmenu to Menu for repositioning support</li>
        <li>Use requestAnimationFrame for clean state updates</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Menu from './Menu.vue'
import MenuRightClickExample from './exampleRightClick.vue'

const singlePos = ref(null)
const singleClicked = ref('')
const singleItems = [
  { type: 'item', name: 'Open', data: { action: 'open' } },
  { type: 'item', name: 'Edit', data: { action: 'edit' } },
  { type: 'item', name: 'Delete', data: { action: 'delete' } }
]

const multiPos = ref(null)
const multiClicked = ref('')
const multiItems = [
  { type: 'item', name: 'New File', data: { action: 'newFile' } },
  {
    type: 'menu',
    name: 'Export',
    children: [
      { type: 'item', name: 'Export as PDF', data: { action: 'exportPDF' } },
      { type: 'item', name: 'Export as PNG', data: { action: 'exportPNG' } },
      {
        type: 'menu',
        name: 'More Formats',
        children: [
          { type: 'item', name: 'Export as SVG', data: { action: 'exportSVG' } },
          { type: 'item', name: 'Export as JPEG', data: { action: 'exportJPEG' } }
        ]
      }
    ]
  },
  {
    type: 'menu',
    name: 'Settings',
    children: [
      { type: 'item', name: 'Preferences', data: { action: 'preferences' } },
      { type: 'item', name: 'Shortcuts', data: { action: 'shortcuts' } }
    ]
  },
  { type: 'item', name: 'About', data: { action: 'about' } }
]

function onSingleClick(item) {
  singleClicked.value = `${item.name} (${item.data?.action})`
}

function onMultiClick(item) {
  multiClicked.value = `${item.name} (${item.data?.action})`
}
</script>

<style scoped>
.menu-examples-all {
  max-width: 800px;
}

.menu-examples-head {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}

.menu-examples-head-spaced {
  margin-top: 20px;
}

.menu-examples-hint {
  font-size: 11px;
  font-weight: normal;
  color: #666;
  margin-left: 6px;
}

.menu-examples-zone {
  border: 2px dashed #ccc;
  text-align: center;
  cursor: context-menu;
  user-select: none;
  padding: 16px;
}

.menu-examples-feedback {
  margin-top: 8px;
  color: #007bff;
  font-size: 13px;
}

.menu-examples-features {
  margin-top: 12px;
  padding: 8px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 2px;
  font-size: 12px;
}

.menu-examples-features-title {
  font-weight: 600;
}

.menu-examples-features-list {
  margin: 4px 0;
  padding-left: 18px;
}
</style>
