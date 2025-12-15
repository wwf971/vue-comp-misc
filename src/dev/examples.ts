// Import examples from component folders
import MasterDetail from '../layout/MasterDetail.vue'
import MasterDetailExample from '../layout/example.vue'
import TabsOnTop from '../layout/tabs/TabsOnTop.vue'
import TabsOnTopExample from '../layout/tabs/exampleTabsOnTop.vue'

// Define example components structure
export interface ComponentExample {
  component: any
  description: string
  example: any
}

// Combine all examples into a single object
export const components: Record<string, ComponentExample> = {
  'MasterDetail': {
    component: MasterDetail,
    description: 'Master-detail layout with tabs and panels',
    example: MasterDetailExample
  },
  'TabsOnTop': {
    component: TabsOnTop,
    description: 'Horizontal tabs layout with state preservation',
    example: TabsOnTopExample
  }
}

