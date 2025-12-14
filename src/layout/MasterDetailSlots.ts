import { defineComponent, h } from 'vue'

// Tab slot component
export const Tab = defineComponent({
  name: 'Tab',
  props: {
    label: {
      type: String,
      required: true
    }
  },
  setup(props, { slots }) {
    return () => null
  }
})

// Mark as slot component
;(Tab as any).__isTabSlot = true

// SubTab slot component
export const SubTab = defineComponent({
  name: 'SubTab',
  props: {
    label: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    return () => null
  }
})

// Mark as slot component
;(SubTab as any).__isSubTabSlot = true

// Panel slot component
export const Panel = defineComponent({
  name: 'Panel',
  setup(props, { slots }) {
    return () => null
  }
})

// Mark as slot component
;(Panel as any).__isPanelSlot = true

