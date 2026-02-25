<template>
  <div :key="stableKey" class="json-array-item">
    <PseudoListItem
      v-if="isPseudo"
      :getPath="getItemPath"
      :parentData="data"
      :index="index"
      :onChange="onChange"
      :onCancel="handleCancel"
      :depth="depth"
    />
    <template v-else>
      <JsonListItemComp
        :parentData="data"
        :index="index"
        :itemData="item"
        :getPath="getItemPath"
        :isEditable="isEditable && isValueEditable"
        :onChange="onChange"
        :depth="depth"
      >
        <JsonCompMobx
          :data="item"
          :isEditable="isEditable"
          :isKeyEditable="isKeyEditable"
          :isValueEditable="isValueEditable"
          :onChange="onChange"
          :indent="indent"
          :pathPrefix="getItemPath()"
          :depth="depth + 1"
          :isArrayItem="true"
        />
      </JsonListItemComp>
      <span v-if="!isLastItem && isPrimitive" class="json-comma">,</span>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import JsonListItemComp from './JsonListItemComp.vue'
import PseudoListItem from './PseudoListItem.vue'
import { getStableKey } from './keysManage'

const props = defineProps({
  data: Array,
  index: Number,
  itemData: null,
  pathPrefixRef: Object,
  isEditable: { type: Boolean, default: true },
  isKeyEditable: { type: Boolean, default: true },
  isValueEditable: { type: Boolean, default: true },
  onChange: Function,
  indent: { type: Number, default: 2 },
  depth: { type: Number, default: 0 },
  JsonCompMobx: null
})

// Use itemData directly instead of data[index] to avoid reactivity tracking issues
const item = computed(() => props.itemData !== undefined ? props.itemData : props.data[props.index])

const getItemPath = () => {
  const prefix = props.pathPrefixRef?.current || ''
  return prefix ? `${prefix}..${props.index}` : `..${props.index}`
}

const isLastItem = computed(() => props.index === props.data.length - 1)
const isPrimitive = computed(() => {
  const val = item.value
  return val === null || val === undefined || typeof val !== 'object'
})
const isPseudo = computed(() => {
  const val = item.value
  return val && typeof val === 'object' && val.isPseudo
})

// Use stable key - for objects use WeakMap, for primitives use value+index
const stableKey = computed(() => getStableKey(item.value, props.index))

const handleCancel = () => {
  props.data.splice(props.index, 1)
}
</script>
