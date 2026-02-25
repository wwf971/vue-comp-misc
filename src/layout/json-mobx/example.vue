<template>
  <div style="max-width: 900px">
    <h3 style="margin-top: 0; margin-bottom: 8px">1. Simple Nested Object (Read-Only)</h3>
    <div style="background: #f9f9f9; padding: 12px; border-radius: 3px; margin-bottom: 20px">
      <JsonCompMobx 
        :data="simpleData" 
        :isEditable="false"
      />
    </div>

    <h3 style="margin-bottom: 8px">2. Editable Values (Keys Read-Only)</h3>
    <p style="font-size: 13px; color: #666; margin-top: 0; margin-bottom: 8px">
      Click on values to edit. Boolean values toggle on click. Press Enter or blur to submit. Right-click for context menu.
    </p>
    <div style="background: #f9f9f9; padding: 12px; border-radius: 3px; margin-bottom: 20px">
      <JsonCompMobx 
        :data="valueOnlyEditableData" 
        :isEditable="true"
        :isKeyEditable="false"
        :isValueEditable="true"
        :onChange="handleValueOnlyEditableChangeWrapped"
      />
    </div>

    <h3 style="margin-bottom: 8px">3. Complex Nested Structure with Arrays</h3>
    <p style="font-size: 13px; color: #666; margin-top: 0; margin-bottom: 8px">
      Supports deeply nested objects and arrays. Keys and values are editable. Right-click for add/delete/convert options.
    </p>
    <div style="background: #f9f9f9; padding: 12px; border-radius: 3px; margin-bottom: 20px">
      <JsonCompMobx 
        :data="fullyEditableData" 
        :isEditable="true"
        :isKeyEditable="true"
        :isValueEditable="true"
        :onChange="handleFullyEditableChangeWrapped"
      />
    </div>

    <h3 style="margin-bottom: 8px">4. Array with Mixed Types</h3>
    <p style="font-size: 13px; color: #666; margin-top: 0; margin-bottom: 8px">
      Root level array with various data types including nested structures.
    </p>
    <div style="background: #f9f9f9; padding: 12px; border-radius: 3px; margin-bottom: 20px">
      <JsonCompMobx 
        :data="arrayData" 
        :isEditable="true"
        :onChange="handleArrayChangeWrapped"
      />
    </div>

    <h3 style="margin-bottom: 8px">5. MongoDB Document Editor</h3>
    <p style="font-size: 13px; color: #666; margin-top: 0; margin-bottom: 8px">
      Simulates editing a MongoDB document. Try editing comments, metadata, or user information.
    </p>
    <div style="background: #f9f9f9; padding: 12px; border-radius: 3px; margin-bottom: 20px">
      <JsonCompMobx 
        :data="mongoDoc" 
        :isEditable="true"
        :isKeyEditable="false"
        :isValueEditable="true"
        :onChange="handleMongoChangeWrapped"
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

    <div style="margin-top: 16px; padding: 10px 12px; background: #fff3e0; border: 1px solid #ff9800; border-radius: 2px; font-size: 12px">
      <strong>Features (Vue Reactive Version):</strong>
      <ul style="margin: 4px 0; padding-left: 18px">
        <li><strong>Fine-grained reactivity:</strong> Vue's reactivity system provides MobX-like granular updates</li>
        <li><strong>Click to edit:</strong> Text/number values inline edit, booleans toggle, keys are editable</li>
        <li><strong>Right-click menu:</strong> Type conversion, add/delete entries/items, move up/down, and more</li>
        <li><strong>Interactive creation:</strong> Right-click empty objects/arrays or existing entries to add new items</li>
        <li><strong>Stable keys:</strong> Array items maintain identity across re-renders for efficient updates</li>
        <li><strong>Key ordering:</strong> Object key order is preserved and can be manually reordered</li>
        <li><strong>Path notation:</strong> <code>user.name</code>, <code>tags..0</code>, <code>items..1.name</code> (.. for array indices)</li>
        <li><strong>Structured change data:</strong> <code>{{ '{ old: { type, value }, new: { type, value } }' }}</code></li>
        <li><strong>No quote marks:</strong> Clean sans-serif display with reduced indentation</li>
        <li><strong>Debug mode:</strong> Toggle to see render counts (only changed items re-render!)</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import JsonCompMobx from './JsonCompMobx.vue'
import { createHandleChange } from './exampleHandleChange'

// Example 1: Simple nested object (read-only)
const simpleData = reactive({
  name: "John Doe",
  age: 30,
  active: true,
  score: null
})

// Example 2: Value-only editable (keys read-only)
const valueOnlyEditableData = reactive({
  username: "alice",
  email: "alice@example.com",
  verified: true,
  loginCount: 42
})

// Example 3: Fully editable complex structure
const fullyEditableData = reactive({
  user: {
    id: 123,
    name: "Alice Smith",
    email: "alice@example.com",
    roles: ["admin", "editor"],
    settings: {
      theme: "dark",
      notifications: {
        email: true,
        push: false
      }
    }
  },
  tags: ["important", "verified"],
  metadata: {
    views: 1234,
    published: true
  }
})

// Example 4: Array with mixed types
const arrayData = reactive([
  "string value",
  42,
  true,
  null,
  { nested: "object" },
  ["nested", "array"]
])

// Example 5: MongoDB-like document
const mongoDoc = reactive({
  _id: "507f1f77bcf86cd799439011",
  title: "Getting Started with Vue",
  author: {
    name: "Jane Developer",
    email: "jane@example.com"
  },
  content: "This is a sample blog post...",
  tags: ["vue", "javascript", "tutorial"],
  published: true,
  views: 1250,
  comments: [
    {
      user: "Bob",
      text: "Great article!",
      likes: 5
    },
    {
      user: "Charlie",
      text: "Very helpful",
      likes: 3
    }
  ],
  metadata: {
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    version: 2
  }
})

const message = ref('')

// Create onChange handlers for each example
const handleValueOnlyEditableChange = createHandleChange(valueOnlyEditableData)
const handleFullyEditableChange = createHandleChange(fullyEditableData)
const handleArrayChange = createHandleChange(arrayData)
const handleMongoChange = createHandleChange(mongoDoc)

// Wrap handlers to show success message
const wrapHandler = (handler) => {
  return async (path, changeData) => {
    message.value = `Updating ${path}...`
    try {
      const result = await handler(path, changeData)
      if (result.code === 0) {
        message.value = `✓ Successfully updated ${path}`
      } else {
        message.value = `✗ Failed to update ${path}: ${result.message}`
      }
    } catch (error) {
      message.value = `✗ Error: ${error.message}`
    }
    setTimeout(() => {
      message.value = ''
    }, 3000)
  }
}

// Apply wrapper
const handleValueOnlyEditableChangeWrapped = wrapHandler(handleValueOnlyEditableChange)
const handleFullyEditableChangeWrapped = wrapHandler(handleFullyEditableChange)
const handleArrayChangeWrapped = wrapHandler(handleArrayChange)
const handleMongoChangeWrapped = wrapHandler(handleMongoChange)
</script>
