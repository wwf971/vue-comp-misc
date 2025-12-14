<template>
  <MasterDetail title="Example" sidebarWidth="250px">
    <Tab label="Getting Started">
      <SubTab label="Introduction" :isDefault="true">
        <Panel>
          <div style="padding: 20px">
            <h3>Welcome to MasterDetail</h3>
            <p>This is a master-detail layout component for Vue 3.</p>
            <ul>
              <li>Collapsible tabs with subtabs</li>
              <li>Lazy rendering for performance</li>
              <li>TypeScript support</li>
              <li>Customizable sidebar width</li>
            </ul>
          </div>
        </Panel>
      </SubTab>
      
      <SubTab label="Features">
        <Panel>
          <div style="padding: 20px">
            <h3>Key Features</h3>
            <ul>
              <li>Expandable/collapsible tabs</li>
              <li>Default subtab support</li>
              <li>Smooth transitions</li>
              <li>Flexible content panels</li>
            </ul>
          </div>
        </Panel>
      </SubTab>
    </Tab>

    <Tab label="Testing">
      <SubTab label="Counter Test">
        <Panel>
          <CounterTest />
        </Panel>
      </SubTab>
    </Tab>

    <Tab label="Documentation">
      <SubTab label="Props">
        <Panel>
          <div style="padding: 20px">
            <h3>Component Props</h3>
            <ul>
              <li><code>title</code>: string - Header title</li>
              <li><code>sidebarWidth</code>: string - Width of sidebar (default: "200px")</li>
              <li><code>lazyRender</code>: boolean - Enable lazy rendering (default: true)</li>
            </ul>
          </div>
        </Panel>
      </SubTab>
      
      <SubTab label="Usage">
        <Panel>
          <div style="padding: 20px">
            <h3>Basic Usage</h3>
            <pre style="background: #f4f4f4; padding: 12px; border-radius: 4px"><code>&lt;MasterDetail title="My App"&gt;
  &lt;Tab label="Section 1"&gt;
    &lt;SubTab label="Page 1" :isDefault="true"&gt;
      &lt;Panel&gt;
        &lt;h1&gt;Content&lt;/h1&gt;
      &lt;/Panel&gt;
    &lt;/SubTab&gt;
  &lt;/Tab&gt;
&lt;/MasterDetail&gt;</code></pre>
          </div>
        </Panel>
      </SubTab>
    </Tab>
  </MasterDetail>
</template>

<script setup lang="ts">
import MasterDetail from './MasterDetail.vue'
import { Tab, SubTab, Panel } from './MasterDetailSlots'
import CounterTest from './exampleCounterTest.vue'
</script>

<style>
code {
  background-color: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}
</style>

