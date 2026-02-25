<template>
  <div class="json-object-item">
    <JsonKeyValueComp
      :data="data"
      :itemKey="itemKey"
      :path="keyPath"
      :getPath="getPath"
      :isEditable="isEditable"
      :isKeyEditable="isKeyEditable"
      :isValueEditable="isValueEditable"
      :onChange="onChange"
      :depth="depth"
    >
      <JsonCompMobx
        :data="value"
        :isEditable="isEditable"
        :isKeyEditable="isKeyEditable"
        :isValueEditable="isValueEditable"
        :onChange="onChange"
        :indent="indent"
        pathPrefix=""
        :pathPrefixRef="keyPathRef"
        :depth="depth + 1"
      />
    </JsonKeyValueComp>
    <span v-if="!isLastItem && isPrimitive" class="json-comma">,</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useDerivedPathRef } from './pathRef'
import JsonKeyValueComp from './JsonKeyValueComp.vue'

const props = defineProps({
  data: null,
  itemKey: String,
  pathPrefixRef: Object,
  isEditable: { type: Boolean, default: true },
  isKeyEditable: { type: Boolean, default: true },
  isValueEditable: { type: Boolean, default: true },
  onChange: Function,
  indent: { type: Number, default: 2 },
  depth: { type: Number, default: 0 },
  isLastItem: { type: Boolean, default: false },
  JsonCompMobx: null
})

const pathPrefixRefComputed = computed(() => props.pathPrefixRef ? ref(props.pathPrefixRef.current) : ref(''))
const keyPathRef = useDerivedPathRef(pathPrefixRefComputed.value, props.itemKey)
const keyPath = computed(() => keyPathRef.value)
const getPath = () => keyPathRef.value

const value = computed(() => props.data[props.itemKey])
const isPrimitive = computed(() => {
  const val = value.value
  return val === null || val === undefined || typeof val !== 'object'
})
</script>
