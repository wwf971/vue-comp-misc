<template>
  <div class="icon-gallery">
    <div class="icon-gallery-head">
      <span class="icon-gallery-title">Icon Gallery ({{ filteredIcons.length }} icons)</span>
    </div>
    <div class="icon-gallery-search-wrap">
      <input
        type="text"
        class="icon-gallery-search"
        placeholder="Search icons..."
        v-model="searchTerm"
      />
      <button
        v-if="searchTerm"
        class="icon-gallery-clear"
        @click="searchTerm = ''"
      >
        clear
      </button>
    </div>
    <div class="icon-gallery-grid">
      <div
        v-for="item in filteredIcons"
        :key="item.name"
        class="icon-gallery-card"
      >
        <div class="icon-gallery-preview">
          <component :is="item.component" :size="24" :width="24" :height="24" v-bind="item.extraProps || {}" />
          <component :is="item.component" :size="32" :width="32" :height="32" v-bind="item.extraProps || {}" />
        </div>
        <div class="icon-gallery-name">{{ item.name }}</div>
        <div class="icon-gallery-desc">{{ item.description }}</div>
      </div>
    </div>
    <div v-if="filteredIcons.length === 0" class="icon-gallery-empty">
      No icons found matching "{{ searchTerm }}"
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  FileIconDefault,
  AddIcon,
  DeleteIcon,
  DragIcon,
  SearchIcon,
  ClearIcon,
  EditIcon,
  EditIconNotepad,
  EditIconPen,
  CrossIcon,
  InfoIcon,
  InfoIconWithTooltip,
  SuccessIcon,
  ErrorIcon,
  UploadIcon,
  BackIcon,
  ForwardIcon,
  UpIcon,
  DownIcon,
  EyeIcon,
  EyeOffIcon,
  FolderIcon,
  PlusIcon,
  MinusIcon,
  SpinningCircle,
  RefreshIcon
} from './Icon.js'

const searchTerm = ref('')

const icons = [
  { name: 'FileIconDefault', component: FileIconDefault, description: 'Default file icon' },
  { name: 'AddIcon', component: AddIcon, description: 'Add/plus' },
  { name: 'DeleteIcon', component: DeleteIcon, description: 'Delete/trash' },
  { name: 'DragIcon', component: DragIcon, description: 'Drag/grip lines' },
  { name: 'SearchIcon', component: SearchIcon, description: 'Search' },
  { name: 'ClearIcon', component: ClearIcon, description: 'Clear/reset' },
  { name: 'EditIcon', component: EditIcon, description: 'Edit' },
  { name: 'EditIconNotepad', component: EditIconNotepad, description: 'Edit notepad' },
  { name: 'EditIconPen', component: EditIconPen, description: 'Edit/pencil only' },
  { name: 'CrossIcon', component: CrossIcon, description: 'Close/dismiss' },
  { name: 'InfoIcon', component: InfoIcon, description: 'Information' },
  { name: 'InfoIconWithTooltip', component: InfoIconWithTooltip, description: 'Info with tooltip', extraProps: { tooltipText: 'Example tooltip text' } },
  { name: 'SuccessIcon', component: SuccessIcon, description: 'Success/checkmark' },
  { name: 'ErrorIcon', component: ErrorIcon, description: 'Error/X' },
  { name: 'UploadIcon', component: UploadIcon, description: 'Upload/cloud' },
  { name: 'BackIcon', component: BackIcon, description: 'Back/previous' },
  { name: 'ForwardIcon', component: ForwardIcon, description: 'Forward/next' },
  { name: 'UpIcon', component: UpIcon, description: 'Up/collapse' },
  { name: 'DownIcon', component: DownIcon, description: 'Down/expand' },
  { name: 'EyeIcon', component: EyeIcon, description: 'Show password' },
  { name: 'EyeOffIcon', component: EyeOffIcon, description: 'Hide password' },
  { name: 'FolderIcon', component: FolderIcon, description: 'Folder' },
  { name: 'PlusIcon', component: PlusIcon, description: 'Plus' },
  { name: 'MinusIcon', component: MinusIcon, description: 'Minus' },
  { name: 'SpinningCircle', component: SpinningCircle, description: 'Loading spinner' },
  { name: 'RefreshIcon', component: RefreshIcon, description: 'Refresh' }
]

const filteredIcons = computed(() => {
  if (!searchTerm.value) return icons
  const term = searchTerm.value.toLowerCase()
  return icons.filter(
    (icon) =>
      icon.name.toLowerCase().includes(term) ||
      icon.description.toLowerCase().includes(term)
  )
})
</script>

<style scoped>
.icon-gallery {
  padding: 8px;
}

.icon-gallery-head {
  margin-bottom: 8px;
}

.icon-gallery-title {
  font-size: 14px;
  font-weight: 600;
}

.icon-gallery-search-wrap {
  position: relative;
  width: 300px;
  margin-bottom: 12px;
}

.icon-gallery-search {
  width: 100%;
  padding: 6px 70px 6px 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  outline: none;
}

.icon-gallery-clear {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  font-size: 12px;
  cursor: pointer;
  color: #666;
  padding: 2px 4px;
}

.icon-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}

.icon-gallery-card {
  border: 1px solid #e0e0e0;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background-color: #fafafa;
}

.icon-gallery-preview {
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon-gallery-name {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.icon-gallery-desc {
  font-size: 11px;
  color: #666;
  text-align: center;
}

.icon-gallery-empty {
  text-align: center;
  padding: 24px;
  color: #999;
  font-size: 13px;
}
</style>
