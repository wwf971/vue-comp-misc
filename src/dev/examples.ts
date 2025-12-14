// Import examples from component folders
import MasterDetail from '../layout/MasterDetail.vue'
import MasterDetailExample from '../layout/example.vue'

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
  }
}

