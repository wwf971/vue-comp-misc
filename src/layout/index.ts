import MasterDetail from './MasterDetail.vue'
import { Tab, SubTab, Panel } from './MasterDetailSlots'

// Export with slots attached
export { MasterDetail, Tab, SubTab, Panel }

// Export examples
export { default as exampleMasterDetail } from './example.vue'
export { default as exampleCounterTest } from './exampleCounterTest.vue'

// Default export with slots as properties
export default Object.assign(MasterDetail, {
  Tab,
  SubTab,
  Panel
})

