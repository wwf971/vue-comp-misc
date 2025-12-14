<template>
  <div class="dev-page">
    <div class="dev-header">
      <div class="dev-header-flex">
        <h1>Vue Components Assortment</h1>
        <a 
          href="https://github.com/wwf971/vue-comp-misc" 
          target="_blank" 
          rel="noopener noreferrer"
          class="github-link"
        >
          view source code
        </a>
      </div>
      <div class="search-container">
        <input
          type="text"
          class="search-input"
          placeholder="Search components..."
          v-model="searchTerm"
        />
        <button 
          v-if="searchTerm"
          class="clear-button"
          @click="searchTerm = ''"
        >
          ×
        </button>
      </div>
      <div class="component-list">
        <button
          v-for="name in filteredComponents"
          :key="name"
          :class="['component-item', { selected: compSelectedStr === name }]"
          @click="compSelectedStr = name"
        >
          <div class="component-name">{{ name }}</div>
          <div class="component-description">{{ components[name].description }}</div>
        </button>
      </div>
    </div>
    
    <div class="dev-content">
      <div class="content-header">
        <h2>{{ compSelectedStr }}</h2>
        <p>{{ components[compSelectedStr]?.description }}</p>
      </div>
      <div class="component-demo">
        <component 
          v-if="components[compSelectedStr]?.example" 
          :is="components[compSelectedStr].example" 
        />
        <div v-else>No example available</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { components } from './examples'

const searchTerm = ref('')
const compSelectedStr = ref('MasterDetail')

const filteredComponents = computed(() => {
  if (!searchTerm.value) return Object.keys(components)
  
  const term = searchTerm.value.toLowerCase()
  return Object.keys(components).filter(name => 
    name.toLowerCase().includes(term) ||
    components[name].description.toLowerCase().includes(term)
  )
})
</script>

<style scoped src="./DevPage.css"></style>

