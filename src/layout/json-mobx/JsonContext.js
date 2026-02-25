import { inject, provide } from 'vue'

const JsonContextKey = Symbol('JsonContext')

export const JsonContextProvider = {
  name: 'JsonContextProvider',
  props: {
    typeConversionBehavior: { type: String, default: 'allow' },
    showConversionMenu: Function,
    queryParentInfo: Function,
    isDebug: { type: Boolean, default: false }
  },
  setup(props, { slots }) {
    provide(JsonContextKey, {
      typeConversionBehavior: props.typeConversionBehavior,
      showConversionMenu: props.showConversionMenu,
      queryParentInfo: props.queryParentInfo,
      isDebug: props.isDebug
    })
    
    return () => slots.default?.()
  }
}

export function useJsonContext() {
  const context = inject(JsonContextKey, null)
  
  if (!context) {
    return {
      typeConversionBehavior: 'allow',
      showConversionMenu: null,
      queryParentInfo: null,
      isDebug: false
    }
  }
  
  return context
}
