# Vue Component Library (@wwf971/vue-comp-misc)

A comprehensive Vue 3 component library, mirroring the functionality of the React component library `@wwf971/react-comp-misc`.

## Features

### Layout Components
- **MasterDetail** - Master-detail layout with resizable panels
- **TabsOnTop** - Tab navigation component
- **FolderView** - Folder-style layout with header and body

### JSON Editor
- **JsonComp** - Basic JSON renderer/editor
- **JsonCompMobx** - Advanced JSON editor with fine-grained reactivity, context menus, and full editing capabilities
  - Inline editing for all value types
  - Right-click context menus for type conversion, add/delete operations
  - Move entries/items up/down
  - Debug mode with render count tracking
  - Stable keys for array items

### UI Components
- **Menu** / **MenuComp** - Multi-level context menus with custom component support
- **PathBar** - Hierarchical path navigation
- **Login** - Authentication form with credential and token modes
- **BoolSlider** - Toggle switch component
- **PanelToggle** / **PanelDual** - Resizable panel components
- **HtmlRender** - HTML preview and editor
- **KeyValues** / **KeyValuesComp** - Key-value pair display

### Icons
- AddIcon, DeleteIcon, SearchIcon, EditIcon, CrossIcon, InfoIcon, PlusIcon, MinusIcon
- SpinningCircle, RefreshIcon, PdfIcon
- And more...

### Database Components
- **DatabaseSetup** - Database configuration
- **TableManage** - Table management interface

### Configuration
- **ConfigPanel** - Configuration panel with tabs and groups

## Installation

```bash
pnpm add @wwf971/vue-comp-misc
```

## Usage

### Basic Import

```vue
<script setup>
import { BoolSlider, Menu, PathBar } from '@wwf971/vue-comp-misc'
</script>
```

### JSON Editor Example

```vue
<template>
  <JsonCompMobx 
    :data="reactiveData"
    :isEditable="true"
    :isKeyEditable="true"
    :onChange="handleChange"
  />
</template>

<script setup>
import { reactive } from 'vue'
import { JsonCompMobx, createHandleChange } from '@wwf971/vue-comp-misc'

const reactiveData = reactive({
  user: {
    name: "Alice",
    age: 30,
    roles: ["admin", "editor"]
  }
})

const handleChange = createHandleChange(reactiveData)
</script>
```

### Menu Example

```vue
<template>
  <Menu 
    :items="menuItems"
    :position="{ x: 100, y: 100 }"
    @close="handleClose"
    @item-click="handleItemClick"
  />
</template>

<script setup>
import { Menu } from '@wwf971/vue-comp-misc'

const menuItems = [
  { type: 'item', name: 'Copy', data: { action: 'copy' } },
  { type: 'item', name: 'Paste', data: { action: 'paste' } },
  { 
    type: 'menu', 
    name: 'More',
    children: [
      { type: 'item', name: 'Delete', data: { action: 'delete' } }
    ]
  }
]
</script>
```

## Architecture

This library follows Vue 3 best practices:
- **Composition API** with `<script setup>`
- **Pure JavaScript** - no TypeScript, matching the React project style
- **Reactive** data using Vue's reactivity system
- **Scoped CSS** for component styling
- **Minimal dependencies** - only Vue 3 as peer dependency

## Design Philosophy

The library inherits design principles from the React version:
- Fine-grained reactivity for optimal performance
- Controlled components with callback-based updates
- Consistent API across components
- Minimal visual jitter when entering/exiting edit modes
- Specific class names instead of complex CSS selectors
- Small margins, paddings, and border radii

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build library
pnpm build
```

## Documentation

For detailed documentation on each component, see:
- `JSON_EDITOR_COMPLETE.md` - Comprehensive JSON editor documentation
- Component source files in `src/` directory

## License

MIT

## Author

@wwf971
