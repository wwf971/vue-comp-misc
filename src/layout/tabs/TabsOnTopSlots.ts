// Slot components for TabsOnTop layout

export const TabOnTop = {
  name: 'TabOnTop',
  __isTabOnTopSlot: true,
  props: {
    label: {
      type: String,
      required: true
    }
  },
  setup(props: any, { slots }: any) {
    return () => slots.default?.()
  }
}

