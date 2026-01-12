<template>
  <div style="padding: 20px; max-width: 900px">
    <h3 style="margin-top: 0; margin-bottom: 8px">1. Simple Nested Object (Read-Only)</h3>
    <div style="background: #f9f9f9; padding: 12px; border-radius: 3px; margin-bottom: 20px">
      <JsonComp 
        :data="simpleData" 
        :isEditable="false"
      />
    </div>

    <h3 style="margin-bottom: 8px">2. Editable Values (Keys Read-Only)</h3>
    <p style="font-size: 13px; color: #666; margin-top: 0; margin-bottom: 8px">
      Click on values to edit. Boolean values toggle on click. Press Enter or blur to submit. 20% simulated failure rate.
    </p>
    <div style="background: #f9f9f9; padding: 12px; border-radius: 3px; margin-bottom: 20px">
      <JsonComp 
        :data="editableData" 
        :isEditable="true"
        :isKeyEditable="false"
        :isValueEditable="true"
        :onChange="handleEditableChange"
      />
    </div>

    <h3 style="margin-bottom: 8px">3. Complex Nested Structure with Arrays</h3>
    <p style="font-size: 13px; color: #666; margin-top: 0; margin-bottom: 8px">
      Supports deeply nested objects and arrays. Keys and values are editable.
    </p>
    <div style="background: #f9f9f9; padding: 12px; border-radius: 3px; margin-bottom: 20px">
      <JsonComp 
        :data="complexData" 
        :isEditable="true"
        :isKeyEditable="true"
        :isValueEditable="true"
        :onChange="handleComplexChange"
      />
    </div>

    <h3 style="margin-bottom: 8px">4. Array with Mixed Types</h3>
    <p style="font-size: 13px; color: #666; margin-top: 0; margin-bottom: 8px">
      Root level array with various data types including nested structures.
    </p>
    <div style="background: #f9f9f9; padding: 12px; border-radius: 3px; margin-bottom: 20px">
      <JsonComp 
        :data="arrayData" 
        :isEditable="true"
        :onChange="handleArrayChange"
      />
    </div>

    <h3 style="margin-bottom: 8px">5. MongoDB Document Editor</h3>
    <p style="font-size: 13px; color: #666; margin-top: 0; margin-bottom: 8px">
      Simulates editing a MongoDB document. Try editing comments, metadata, or user information.
    </p>
    <div style="background: #f9f9f9; padding: 12px; border-radius: 3px; margin-bottom: 20px">
      <JsonComp 
        :data="mongoDoc" 
        :isEditable="true"
        :isKeyEditable="false"
        :isValueEditable="true"
        :onChange="handleMongoChange"
      />
    </div>

    <div v-if="message" :style="{ 
      marginTop: '16px', 
      padding: '8px 12px', 
      background: message.startsWith('✓') ? '#e8f5e9' : message.startsWith('✗') ? '#ffebee' : '#f5f5f5',
      border: `1px solid ${message.startsWith('✓') ? '#4caf50' : message.startsWith('✗') ? '#f44336' : '#ddd'}`,
      borderRadius: '2px', 
      fontSize: '13px' 
    }">
      {{ message }}
    </div>

    <div style="margin-top: 16px; padding: 10px 12px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 2px; font-size: 12px">
      <strong>Features:</strong>
      <ul style="margin: 4px 0; padding-left: 18px">
        <li>Recursively renders deeply nested JSON objects and arrays</li>
        <li>Click on text/number values to edit, booleans toggle on click (distinct monospace font)</li>
        <li>Right-click values to convert types (string ↔ number ↔ boolean ↔ null)</li>
        <li>Spinning circle shows next to value during async update</li>
        <li>Component locks during submission, doesn't update value until parent updates data</li>
        <li>No request sent if value hasn't changed</li>
        <li>Path notation: <code>user.name</code>, <code>tags..0</code>, <code>items..1.name</code> (.. for array indices)</li>
        <li>Structured change data: <code>{{ '{ old: { type, value }, new: { type, value } }' }}</code></li>
        <li>Sans-serif font, reduced indentation (12px), no quote marks</li>
        <li>Configurable editability for keys and values separately</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import JsonComp from './JsonComp.vue'

// Example 1: Simple nested object (read-only)
const simpleData = {
  name: "John Doe",
  age: 30,
  email: "john@example.com",
  address: {
    street: "123 Main St",
    city: "New York",
    zip: "10001"
  }
}

// Example 2: Editable values
const editableData = ref({
  username: "johndoe",
  email: "john@example.com",
  age: 30,
  active: true,
  verified: false
})

// Example 3: Complex nested structure
const complexData = ref({
  user: {
    id: 123,
    name: "Alice Smith",
    roles: ["admin", "editor", "viewer"],
    settings: {
      theme: "dark",
      notifications: {
        email: true,
        push: false
      }
    }
  },
  tags: ["important", "verified"]
})

// Example 4: Array with mixed types
const arrayData = ref([
  "Simple string",
  42,
  true,
  null,
  { nested: "object" },
  ["nested", "array"]
])

// Example 5: MongoDB document
const mongoDoc = ref({
  _id: "507f1f77bcf86cd799439011",
  title: "Sample Blog Post",
  author: {
    name: "Jane Developer",
    email: "jane@dev.com",
    verified: true
  },
  content: "This is a sample blog post content...",
  tags: ["javascript", "react", "mongodb"],
  comments: [
    { user: "user1", text: "Great post!", likes: 5 },
    { user: "user2", text: "Very helpful", likes: 3 }
  ],
  metadata: {
    views: 1234,
    published: true,
    created_at: "2024-01-15T10:30:00Z"
  }
})

const message = ref('')

// Handler for editable data
const handleEditableChange = async (path: string, changeData: any) => {
  const { old, new: newData, _action, _parentPath, _key } = changeData
  console.log(`Change:`, { path, _action, _parentPath, changeData })
  
  // For pseudo-related actions, execute immediately without delay/errors (just UI state)
  switch (_action) {
    case 'addEntry':
    case 'addEntryAbove':
    case 'addEntryBelow':
    case 'cancelCreate':
      const keys = path.split('.')
      
      switch (_action) {
        case 'addEntry': {
          // Add pseudo entry to empty dict - direct mutation
          const targetObj = keys.length === 0 || keys[0] === '' ? editableData.value : keys.reduce((obj: any, key) => obj[key], editableData.value)
          const pseudoKey = `__pseudo__${Date.now()}`
          targetObj[pseudoKey] = { __pseudo__: true }
          return { code: 0, message: 'Success' }
        }
        case 'addEntryAbove':
        case 'addEntryBelow': {
          // Add pseudo entry above/below current entry - direct mutation
          const pseudoKey = `__pseudo__${Date.now()}`
          ;(editableData.value as any)[pseudoKey] = { 
            __pseudo__: true,
            position: _action === 'addEntryAbove' ? 'above' : 'below', 
            referenceKey: keys[0]
          }
          return { code: 0, message: 'Success' }
        }
        case 'cancelCreate': {
          // Remove pseudo entry - direct mutation
          const parentObj = keys.length === 0 || keys[0] === '' ? editableData.value : keys.slice(0, -1).reduce((obj: any, key) => obj[key], editableData.value)
          const pseudoKey = keys[keys.length - 1]
          delete parentObj[pseudoKey]
          return { code: 0, message: 'Success' }
        }
      }
  }
  
  // For actual data operations, apply delay and error simulation
  message.value = `Updating ${path}...`
  
  // Simulate network delay (optional - comment out for instant updates)
  await new Promise(resolve => setTimeout(resolve, 300))

  // Random success/failure (80% success rate)
  const success = Math.random() > 0.2

  if (success) {
    const keys = path.split('.')
    
    switch (_action) {
      case 'createEntry': {
        // Convert pseudo to real entry: delete the pseudo key, add real key - direct mutation
        const parentObj = keys.length === 0 || keys[0] === '' ? editableData.value : keys.slice(0, -1).reduce((obj: any, key) => obj[key], editableData.value)
        const pseudoKey = keys[keys.length - 1]
        const pseudoData = parentObj[pseudoKey]
        
        // Check if pseudo has position info
        if (pseudoData && pseudoData.position && pseudoData.referenceKey) {
          // Reconstruct parent object with correct order
          const newParentObj: any = {}
          for (const key of Object.keys(parentObj)) {
            if (key === pseudoKey) continue // Skip the pseudo key
            
            // Insert new key at the right position
            if (key === pseudoData.referenceKey) {
              if (pseudoData.position === 'above') {
                newParentObj[_key] = newData.value
                newParentObj[key] = parentObj[key]
              } else {
                newParentObj[key] = parentObj[key]
                newParentObj[_key] = newData.value
              }
            } else {
              newParentObj[key] = parentObj[key]
            }
          }
          // Replace parent object keys
          Object.keys(parentObj).forEach(k => delete parentObj[k])
          Object.assign(parentObj, newParentObj)
        } else {
          // No position info - just delete pseudo and add at end
          delete parentObj[pseudoKey]
          parentObj[_key] = newData.value
        }
        // Trigger reactivity for nested property changes
        triggerRef(editableData)
        break
      }
      case 'deleteEntry': {
        // Delete this entry - direct mutation
        let current: any = editableData.value
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]]
        }
        delete current[keys[keys.length - 1]]
        // Trigger reactivity for nested property changes
        triggerRef(editableData)
        break
      }
      case 'deleteParentDict': {
        // Delete the parent dict - direct mutation
        if (_parentPath === '') {
          editableData.value = {} as any  // Parent is root - must replace
        } else {
          const parentParts = _parentPath.split('.').filter((p: string) => p !== '')
          let current: any = editableData.value
          for (let i = 0; i < parentParts.length - 1; i++) {
            current = current[parentParts[i]]
          }
          const lastKey = parentParts[parentParts.length - 1]
          current[lastKey] = null
          // Trigger reactivity for nested property changes
          triggerRef(editableData)
        }
        break
      }
      case 'clearParentDict': {
        // Clear all entries in parent dict - direct mutation
        if (_parentPath === '') {
          editableData.value = {} as any  // Parent is root - must replace
        } else {
          const parentParts = _parentPath.split('.').filter((p: string) => p !== '')
          let current: any = editableData.value
          for (let i = 0; i < parentParts.length - 1; i++) {
            current = current[parentParts[i]]
          }
          current[parentParts[parentParts.length - 1]] = {}
          // Trigger reactivity for nested property changes
          triggerRef(editableData)
        }
        break
      }
      default: {
        // Normal value change - direct mutation
        let current: any = editableData.value
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]]
        }
        
        // Determine final value based on whether types match
        let finalValue = newData.value
        if (old.type === newData.type && newData.type === 'number' && typeof newData.value === 'string') {
          // User edited a number field - parse string input to number
          finalValue = !isNaN(newData.value) ? Number(newData.value) : old.value
        } else if (old.type !== newData.type) {
          // Type conversion - use the converted value directly (already correct type)
          finalValue = newData.value
        } else {
          // Same type - use new value as is
          finalValue = newData.value
        }
        
        current[keys[keys.length - 1]] = finalValue
        // Trigger reactivity for nested property changes
        triggerRef(editableData)
      }
    }

    message.value = `✓ Updated ${path} successfully`
    setTimeout(() => { message.value = '' }, 3000)
    return { code: 0, message: 'Success' }
  } else {
    message.value = `✗ Failed to update ${path} (simulated error)`
    setTimeout(() => { message.value = '' }, 3000)
    return { code: -1, message: 'Failed to update (simulated error)' }
  }
}

// Handler for complex nested data
const handleComplexChange = async (path: string, changeData: any) => {
  const { old, new: newData, _action, _key, _parentPath } = changeData
  console.log('Complex change:', { path, _action, changeData })
  
  // For pseudo-related actions, execute immediately without delay (just UI state)
  switch (_action) {
    case 'addEntry':
    case 'addEntryAbove':
    case 'addEntryBelow':
    case 'cancelCreate':
      const keys = path.split('.')
      
      switch (_action) {
        case 'addEntry': {
          const targetObj = keys.length === 0 || keys[0] === '' ? complexData.value : keys.reduce((obj: any, key) => obj[key], complexData.value)
          const pseudoKey = `__pseudo__${Date.now()}`
          targetObj[pseudoKey] = { __pseudo__: true }
          return { code: 0, message: 'Success' }
        }
        case 'addEntryAbove':
        case 'addEntryBelow': {
          const pseudoKey = `__pseudo__${Date.now()}`
          ;(complexData.value as any)[pseudoKey] = { 
            __pseudo__: true,
            position: _action === 'addEntryAbove' ? 'above' : 'below', 
            referenceKey: keys[0]
          }
          return { code: 0, message: 'Success' }
        }
        case 'cancelCreate': {
          const parentObj = keys.length === 0 || keys[0] === '' ? complexData.value : keys.slice(0, -1).reduce((obj: any, key) => obj[key], complexData.value)
          const pseudoKey = keys[keys.length - 1]
          delete parentObj[pseudoKey]
          return { code: 0, message: 'Success' }
        }
      }
  }
  
  // For actual data operations, apply delay
  await new Promise(resolve => setTimeout(resolve, 200))

  const keys = path.split('.')
  
  switch (_action) {
    case 'createEntry': {
      const parentObj = keys.length === 0 || keys[0] === '' ? complexData.value : keys.slice(0, -1).reduce((obj: any, key) => obj[key], complexData.value)
      const pseudoKey = keys[keys.length - 1]
      const pseudoData = parentObj[pseudoKey]
      
      if (pseudoData && pseudoData.position && pseudoData.referenceKey) {
        const newParentObj: any = {}
        for (const key of Object.keys(parentObj)) {
          if (key === pseudoKey) continue
          if (key === pseudoData.referenceKey) {
            if (pseudoData.position === 'above') {
              newParentObj[_key] = newData.value
              newParentObj[key] = parentObj[key]
            } else {
              newParentObj[key] = parentObj[key]
              newParentObj[_key] = newData.value
            }
          } else {
            newParentObj[key] = parentObj[key]
          }
        }
        Object.keys(parentObj).forEach(k => delete parentObj[k])
        Object.assign(parentObj, newParentObj)
      } else {
        delete parentObj[pseudoKey]
        parentObj[_key] = newData.value
      }
      break
    }
    case 'deleteEntry': {
      let current: any = complexData.value
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      delete current[keys[keys.length - 1]]
      break
    }
    case 'deleteParentDict': {
      if (_parentPath === '') {
        complexData.value = {} as any
      } else {
        const parentParts = _parentPath.split('.').filter((p: string) => p !== '')
        let current: any = complexData.value
        for (let i = 0; i < parentParts.length - 1; i++) {
          current = current[parentParts[i]]
        }
        const lastKey = parentParts[parentParts.length - 1]
        current[lastKey] = null
      }
      break
    }
    case 'clearParentDict': {
      if (_parentPath === '') {
        complexData.value = {} as any
      } else {
        const parentParts = _parentPath.split('.').filter((p: string) => p !== '')
        let current: any = complexData.value
        for (let i = 0; i < parentParts.length - 1; i++) {
          current = current[parentParts[i]]
        }
        current[parentParts[parentParts.length - 1]] = {}
      }
      break
    }
    default: {
      // Normal value change - direct mutation
      let current: any = complexData.value
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      let finalValue = newData.value
      if (old.type === newData.type && newData.type === 'number' && typeof newData.value === 'string') {
        finalValue = !isNaN(newData.value) ? Number(newData.value) : old.value
      } else if (old.type !== newData.type) {
        finalValue = newData.value
      } else {
        finalValue = newData.value
      }
      
      current[keys[keys.length - 1]] = finalValue
    }
  }

  return { code: 0 }
}

// Handler for array data
const handleArrayChange = async (path: string, changeData: any) => {
  const { old, new: newData, _action, _parentPath, _itemPath } = changeData
  console.log('Array change:', { path, _action, _parentPath, _itemPath, changeData })
  
  // For pseudo-related actions, execute immediately without delay (just UI state)
  switch (_action) {
    case 'addItem':
    case 'addItemAbove':
    case 'addItemBelow':
    case 'cancelCreate':
      switch (_action) {
        case 'addItem':
        case 'addItemAbove':
        case 'addItemBelow': {
          // Add pseudo item to array - direct mutation
          const pathIsArray = path.includes('..')
          if (pathIsArray) {
            // Parse path like "..0" or "..1"
            const parts = path.split('..')
            let current: any = arrayData.value
            
            // Navigate through array indices (except last)
            for (let i = 1; i < parts.length - 1; i++) {
              const index = parseInt(parts[i])
              current = current[index]
            }
            
            const targetIndex = parseInt(parts[parts.length - 1])
            if (_action === 'addItemAbove') {
              current.splice(targetIndex, 0, { isPseudo: true } as any)
            } else if (_action === 'addItemBelow') {
              current.splice(targetIndex + 1, 0, { isPseudo: true } as any)
            }
          } else {
            // Empty array - add to it
            if (Array.isArray(arrayData.value)) {
              arrayData.value.push({ isPseudo: true } as any)
            }
          }
          return { code: 0 }
        }
        case 'cancelCreate': {
          // Remove pseudo item - direct mutation
          const parts = path.split('..')
          let current: any = arrayData.value
          
          // Navigate through array indices (except last)
          for (let i = 1; i < parts.length - 1; i++) {
            const index = parseInt(parts[i])
            current = current[index]
          }
          
          const targetIndex = parseInt(parts[parts.length - 1])
          current.splice(targetIndex, 1)
          return { code: 0 }
        }
      }
  }
  
  // For actual data operations, apply delay
  await new Promise(resolve => setTimeout(resolve, 200))

  // Parse path: ..5..0 -> [5, 0]
  const pathParts = path.split('..').filter((p: string) => p !== '').map((p: string) => parseInt(p))
  
  if (_action === 'createItem') {
    // Convert pseudo array item to real item - direct mutation
    let current: any = arrayData.value
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
    }
    const targetIndex = pathParts[pathParts.length - 1]
    current[targetIndex] = newData.value
    // Remove isPseudo flag if the value is an object
    if (typeof current[targetIndex] === 'object' && current[targetIndex] !== null) {
      delete current[targetIndex].isPseudo
    }
    return { code: 0 }
  } else if (_action === 'deleteArrayItem') {
    // Delete the item from array - direct mutation
    let current: any = arrayData.value
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
    }
    current.splice(pathParts[pathParts.length - 1], 1)
  } else if (_action === 'deleteParentArray') {
    // Delete the parent array - direct mutation
    if (_parentPath === '') {
      arrayData.value = []  // Parent is root - must replace
    } else {
      const parentParts = _parentPath.split('..').filter((p: string) => p !== '').map((p: string) => parseInt(p))
      let current: any = arrayData.value
      for (let i = 0; i < parentParts.length - 1; i++) {
        current = current[parentParts[i]]
      }
      current.splice(parentParts[parentParts.length - 1], 1)
    }
  } else if (_action === 'clearParentArray') {
    // Clear all items in parent array - direct mutation
    if (_parentPath === '') {
      arrayData.value = []  // Parent is root - must replace
    } else {
      const parentParts = _parentPath.split('..').filter((p: string) => p !== '').map((p: string) => parseInt(p))
      let current: any = arrayData.value
      for (let i = 0; i < parentParts.length - 1; i++) {
        current = current[parentParts[i]]
      }
      current[parentParts[parentParts.length - 1]] = []
      // Trigger reactivity for nested array changes
      triggerRef(arrayData)
    }
  } else {
    // Normal value change - direct mutation
    let finalValue = newData.value
    if (old.type === newData.type && newData.type === 'number' && typeof newData.value === 'string') {
      finalValue = !isNaN(newData.value) ? Number(newData.value) : old.value
    } else if (old.type !== newData.type) {
      finalValue = newData.value
    } else {
      finalValue = newData.value
    }
    
    // Navigate to item and set value - direct mutation
    let current: any = arrayData.value
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
    }
    current[pathParts[pathParts.length - 1]] = finalValue
    // Trigger reactivity for nested array changes
    triggerRef(arrayData)
  }

  return { code: 0 }
}

// Handler for MongoDB document
const handleMongoChange = async (path: string, changeData: any) => {
  const { new: newData, _action, _key } = changeData
  console.log('MongoDB change:', { path, _action, changeData })
  
  // For pseudo-related actions, execute immediately without delay (just UI state)
  switch (_action) {
    case 'addEntry':
    case 'addEntryAbove':
    case 'addEntryBelow':
    case 'cancelCreate':
    case 'addItem':
    case 'addItemAbove':
    case 'addItemBelow': {
      // Handle pseudo items similar to handleEditableChange
      const keys = path.split(/\.(?!\.)/).map(k => k.replace(/^\.\./, ''))
      const isArray = path.includes('..')
      
      if (isArray) {
        // Array operations
        const parts = path.split('..')
        let current: any = mongoDoc.value
        
        // Navigate to the array
        if (parts[0]) {
          const objKeys = parts[0].split('.')
          for (const key of objKeys) {
            current = current[key]
          }
        }
        
        // Navigate through nested arrays (except last)
        for (let i = 1; i < parts.length - 1; i++) {
          const index = parseInt(parts[i])
          current = current[index]
        }
        
        if (_action === 'cancelCreate') {
          const targetIndex = parseInt(parts[parts.length - 1])
          current.splice(targetIndex, 1)
        } else if (_action === 'addItem') {
          current.push({ isPseudo: true } as any)
        } else {
          const targetIndex = parseInt(parts[parts.length - 1])
          if (_action === 'addItemAbove') {
            current.splice(targetIndex, 0, { isPseudo: true } as any)
          } else if (_action === 'addItemBelow') {
            current.splice(targetIndex + 1, 0, { isPseudo: true } as any)
          }
        }
      } else {
        // Object operations
        if (_action === 'cancelCreate') {
          const parentObj = keys.length === 0 || keys[0] === '' ? mongoDoc.value : keys.slice(0, -1).reduce((obj: any, key) => obj[key], mongoDoc.value)
          const pseudoKey = keys[keys.length - 1]
          delete parentObj[pseudoKey]
        } else if (_action === 'addEntry') {
          const targetObj = keys.length === 0 || keys[0] === '' ? mongoDoc.value : keys.reduce((obj: any, key) => obj[key], mongoDoc.value)
          const pseudoKey = `__pseudo__${Date.now()}`
          targetObj[pseudoKey] = { __pseudo__: true }
        } else {
          const pseudoKey = `__pseudo__${Date.now()}`
          ;(mongoDoc.value as any)[pseudoKey] = { 
            __pseudo__: true,
            position: _action === 'addEntryAbove' ? 'above' : 'below', 
            referenceKey: keys[0]
          }
        }
      }
      return { code: 0, message: 'Success' }
    }
  }
  
  // For actual data operations, apply delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const isArray = path.includes('..')
  
  if (isArray) {
    // Array path handling
    const pathParts = path.split('..').filter((p: string) => p !== '')
    
    if (_action === 'createItem') {
      // Navigate to array item
      let current: any = mongoDoc.value
      if (pathParts[0]) {
        const objKeys = pathParts[0].split('.')
        for (const key of objKeys) {
          current = current[key]
        }
      }
      for (let i = 1; i < pathParts.length - 1; i++) {
        current = current[parseInt(pathParts[i])]
      }
      const targetIndex = parseInt(pathParts[pathParts.length - 1])
      current[targetIndex] = newData.value
      if (typeof current[targetIndex] === 'object' && current[targetIndex] !== null) {
        delete current[targetIndex].isPseudo
      }
    } else if (_action === 'deleteArrayItem') {
      let current: any = mongoDoc.value
      if (pathParts[0]) {
        const objKeys = pathParts[0].split('.')
        for (const key of objKeys) {
          current = current[key]
        }
      }
      for (let i = 1; i < pathParts.length - 1; i++) {
        current = current[parseInt(pathParts[i])]
      }
      current.splice(parseInt(pathParts[pathParts.length - 1]), 1)
    } else {
      // Value change in array
      let current: any = mongoDoc.value
      if (pathParts[0]) {
        const objKeys = pathParts[0].split('.')
        for (const key of objKeys) {
          current = current[key]
        }
      }
      for (let i = 1; i < pathParts.length - 1; i++) {
        current = current[parseInt(pathParts[i])]
      }
      current[parseInt(pathParts[pathParts.length - 1])] = newData.value
    }
  } else {
    // Object path handling
    const keys = path.split('.')
    
    if (_action === 'createEntry') {
      const parentObj = keys.length === 0 || keys[0] === '' ? mongoDoc.value : keys.slice(0, -1).reduce((obj: any, key) => obj[key], mongoDoc.value)
      const pseudoKey = keys[keys.length - 1]
      const pseudoData = parentObj[pseudoKey]
      
      if (pseudoData && pseudoData.position && pseudoData.referenceKey) {
        const newParentObj: any = {}
        for (const key of Object.keys(parentObj)) {
          if (key === pseudoKey) continue
          if (key === pseudoData.referenceKey) {
            if (pseudoData.position === 'above') {
              newParentObj[_key] = newData.value
              newParentObj[key] = parentObj[key]
            } else {
              newParentObj[key] = parentObj[key]
              newParentObj[_key] = newData.value
            }
          } else {
            newParentObj[key] = parentObj[key]
          }
        }
        Object.keys(parentObj).forEach(k => delete parentObj[k])
        Object.assign(parentObj, newParentObj)
      } else {
        delete parentObj[pseudoKey]
        parentObj[_key] = newData.value
      }
    } else if (_action === 'deleteEntry') {
      let current: any = mongoDoc.value
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      delete current[keys[keys.length - 1]]
    } else {
      // Normal value change
      let current: any = mongoDoc.value
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = newData.value
    }
  }
  
  return { code: 0, message: 'MongoDB document updated' }
}
</script>
