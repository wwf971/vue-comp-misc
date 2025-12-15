import TabsOnTop from './TabsOnTop.vue'
import { TabOnTop } from './TabsOnTopSlots'

// Export with slots attached
export { TabsOnTop, TabOnTop }

// Export examples
export { default as exampleTabsOnTop } from './exampleTabsOnTop.vue'

// Default export with slots as properties
export default Object.assign(TabsOnTop, {
  TabOnTop
})

