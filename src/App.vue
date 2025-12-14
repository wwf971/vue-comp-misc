<template>
  <MasterDetail title="Demo App" sidebarWidth="250px">
    <Tab label="Getting Started">
      <SubTab label="Introduction" isDefault>
        <Panel>
          <h1>Welcome to Vue MasterDetail</h1>
          <p>This is a reusable master-detail layout component for Vue 3.</p>
          <p>Features:</p>
          <ul>
            <li>Collapsible tabs with subtabs</li>
            <li>Lazy rendering for performance</li>
            <li>TypeScript support</li>
            <li>Customizable sidebar width</li>
          </ul>
        </Panel>
      </SubTab>
      
      <SubTab label="Installation">
        <Panel>
          <h2>Installation</h2>
          <pre><code>pnpm add @wwf971/vue-comp-misc</code></pre>
          <h3>Usage</h3>
          <pre><code>import { MasterDetail, Tab, SubTab, Panel } from '@wwf971/vue-comp-misc'</code></pre>
        </Panel>
      </SubTab>
    </Tab>

    <Tab label="Components">
      <SubTab label="MasterDetail">
        <Panel>
          <h2>MasterDetail Component</h2>
          <p>The main container component that manages the layout.</p>
          <h3>Props</h3>
          <ul>
            <li><code>title</code>: string - Header title</li>
            <li><code>sidebarWidth</code>: string - Width of sidebar (default: '200px')</li>
            <li><code>lazyRender</code>: boolean - Enable lazy rendering (default: true)</li>
          </ul>
        </Panel>
      </SubTab>
      
      <SubTab label="Tab & SubTab">
        <Panel>
          <h2>Tab & SubTab Components</h2>
          <p>Define the navigation structure.</p>
          <h3>Tab Props</h3>
          <ul>
            <li><code>label</code>: string - Tab label</li>
          </ul>
          <h3>SubTab Props</h3>
          <ul>
            <li><code>label</code>: string - SubTab label</li>
            <li><code>isDefault</code>: boolean - Set as default active (default: false)</li>
          </ul>
        </Panel>
      </SubTab>
      
      <SubTab label="Panel">
        <Panel>
          <h2>Panel Component</h2>
          <p>Wraps the content for each subtab.</p>
          <p>You can put any Vue components or HTML inside a Panel.</p>
        </Panel>
      </SubTab>
    </Tab>

    <Tab label="Examples">
      <SubTab label="Basic Example">
        <Panel>
          <h2>Basic Example</h2>
          <pre><code>&lt;MasterDetail title="My App"&gt;
  &lt;Tab label="Section 1"&gt;
    &lt;SubTab label="Page 1" isDefault&gt;
      &lt;Panel&gt;
        &lt;h1&gt;Content here&lt;/h1&gt;
      &lt;/Panel&gt;
    &lt;/SubTab&gt;
  &lt;/Tab&gt;
&lt;/MasterDetail&gt;</code></pre>
        </Panel>
      </SubTab>
      
      <SubTab label="Advanced Example">
        <Panel>
          <h2>Advanced Example</h2>
          <p>You can nest complex components inside panels:</p>
          <pre><code>&lt;SubTab label="Dashboard"&gt;
  &lt;Panel&gt;
    &lt;DashboardComponent /&gt;
    &lt;ChartComponent :data="chartData" /&gt;
  &lt;/Panel&gt;
&lt;/SubTab&gt;</code></pre>
        </Panel>
      </SubTab>
    </Tab>
  </MasterDetail>
</template>

<script setup lang="ts">
import MasterDetail, { Tab, SubTab, Panel } from './layout'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

code {
  background-color: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

pre {
  background-color: #f4f4f4;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 12px 0;
}

pre code {
  background: none;
  padding: 0;
}

h1 {
  margin-bottom: 16px;
  color: #333;
}

h2 {
  margin: 20px 0 12px 0;
  color: #444;
}

h3 {
  margin: 16px 0 8px 0;
  color: #555;
}

p {
  margin-bottom: 12px;
  line-height: 1.6;
  color: #666;
}

ul {
  margin-left: 24px;
  margin-bottom: 12px;
}

li {
  margin-bottom: 6px;
  line-height: 1.5;
}
</style>

