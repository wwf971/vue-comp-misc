<template>
  <div class="panel-examples">
    <div class="panel-section">
      <div class="panel-section-title">PanelToggle</div>
      <PanelToggle title="PanelToggle" :default-expanded="true">
        <div class="panel-toggle-content">
          <div class="panel-toggle-item">Option 1: Enabled</div>
          <div class="panel-toggle-item">Option 2: Disabled</div>
          <div class="panel-toggle-item">Option 3: Auto</div>
        </div>
      </PanelToggle>
    </div>

    <div class="panel-section">
      <div class="panel-dual-examples">
        <div class="panel-dual-examples-title">PanelDual</div>
        <div class="panel-dual-examples-desc">
          Drag the split line to adjust the panel ratio.
        </div>

        <div class="panel-dual-example-section">
          <div class="panel-dual-example-label">Vertical split</div>
          <div class="panel-dual-example-frame">
            <PanelDual orientation="vertical" :initial-ratio="0.35">
              <template #first>
                <div class="panel-dual-example-pane panel-dual-example-pane-a">
                  Left panel
                </div>
              </template>
              <template #second>
                <div class="panel-dual-example-pane panel-dual-example-pane-b">
                  Right panel
                </div>
              </template>
            </PanelDual>
          </div>
        </div>

        <div class="panel-dual-example-section">
          <div class="panel-dual-example-label">Horizontal split</div>
          <div class="panel-dual-example-frame panel-dual-example-frame-tall">
            <PanelDual orientation="horizontal" :initial-ratio="0.6">
              <template #first>
                <div class="panel-dual-example-pane panel-dual-example-pane-c">
                  Top panel
                </div>
              </template>
              <template #second>
                <div class="panel-dual-example-pane panel-dual-example-pane-d">
                  Bottom panel
                </div>
              </template>
            </PanelDual>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PanelToggle from './PanelToggle.vue'
import PanelDual from './PanelDual.vue'
import './panel.css'
import './PanelDual.css'
</script>
