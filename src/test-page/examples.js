// Import examples from component folders
import MasterDetail from '../layout/MasterDetail.vue'
import MasterDetailExample from '../layout/example.vue'
import TabsOnTop from '../layout/tabs/TabsOnTop.vue'
import TabsOnTopExample from '../layout/tabs/exampleTabsOnTop.vue'
import JsonComp from '../layout/json/JsonComp.vue'
import JsonCompExample from '../layout/json/example.vue'
import JsonCompMobx from '../layout/json-mobx/JsonCompMobx.vue'
import JsonCompMobxExample from '../layout/json-mobx/example.vue'
import { iconExamples } from '../icon/example'
import { menuExamples } from '../menu/example'
import { panelExamples } from '../panel/example'

// Combine all examples into a single object
export const components = {
  'MasterDetail': {
    component: MasterDetail,
    description: 'Master-detail layout with tabs and panels',
    example: MasterDetailExample
  },
  'TabsOnTop': {
    component: TabsOnTop,
    description: 'Horizontal tabs layout with state preservation',
    example: TabsOnTopExample
  },
  'JsonComp': {
    component: JsonComp,
    description: 'Display and edit deeply nested JSON-like objects with async updates',
    example: JsonCompExample
  },
  'JsonCompMobx': {
    component: JsonCompMobx,
    description: 'JSON editor with Vue reactivity (similar to MobX), fine-grained updates',
    example: JsonCompMobxExample
  },
  ...iconExamples,
  ...menuExamples,
  ...panelExamples
}

