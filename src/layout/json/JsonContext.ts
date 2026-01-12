import { provide, inject, type InjectionKey, type Ref } from 'vue'

export type TypeConversionBehavior = 'allow' | 'reject'

export interface ConversionMenuRequest {
  position: { x: number; y: number }
  currentValue: any
  currentType: string
  path: string
  menuType?: string
  value?: any
  itemKey?: string
  availableConversions?: {
    targetType: string
    canConvert: boolean
  }[]
  isSingleEntryInParent?: boolean
  isFirstInParent?: boolean
  isLastInParent?: boolean
}

export interface JsonContextValue {
  typeConversionBehavior: TypeConversionBehavior
  showConversionMenu?: (request: ConversionMenuRequest) => void
  queryParentInfo?: (path: string) => { 
    isSingleEntryInParent: boolean
    itemKey?: string
    isFirstInParent?: boolean
    isLastInParent?: boolean
  }
}

const JsonContextKey: InjectionKey<JsonContextValue> = Symbol('json-context')

export function provideJsonContext(value: JsonContextValue) {
  provide(JsonContextKey, value)
}

export function useJsonContext(): JsonContextValue {
  const context = inject(JsonContextKey)
  return context || { typeConversionBehavior: 'allow' }
}

/**
 * Create a queryParentInfo function from root data
 */
export function createQueryParentInfo(rootData: any) {
  return (path: string) => {
    try {
      // Parse path to navigate to parent
      const pathParts = path.split('.').flatMap(part => 
        part.startsWith('.') ? [part.slice(1)] : [part]
      ).filter(part => part !== '')
      
      if (pathParts.length === 0) {
        return { isSingleEntryInParent: false }
      }
      
      // Navigate to parent
      let parent = rootData
      for (let i = 0; i < pathParts.length - 1; i++) {
        parent = parent[pathParts[i]]
        if (!parent) return { isSingleEntryInParent: false }
      }
      
      const currentKey = pathParts[pathParts.length - 1]
      
      // Check if parent is dict or array and has only one entry/item
      if (Array.isArray(parent)) {
        // Get indices of real items (non-pseudo)
        const realItemIndices: number[] = []
        parent.forEach((item: any, idx: number) => {
          if (!(item && typeof item === 'object' && 'isPseudo' in item && (item as any).isPseudo)) {
            realItemIndices.push(idx)
          }
        })
        
        const currentIndex = parseInt(currentKey, 10)
        const positionInReal = realItemIndices.indexOf(currentIndex)
        const isFirst = positionInReal === 0
        const isLast = positionInReal === realItemIndices.length - 1
        
        return { 
          isSingleEntryInParent: realItemIndices.length === 1,
          isFirstInParent: isFirst,
          isLastInParent: isLast
        }
      } else if (typeof parent === 'object' && parent !== null) {
        // Filter out pseudo keys
        const realKeys = Object.keys(parent).filter(k => !k.startsWith('__pseudo__'))
        const currentIndex = realKeys.indexOf(currentKey)
        const isFirst = currentIndex === 0
        const isLast = currentIndex === realKeys.length - 1
        
        return { 
          isSingleEntryInParent: realKeys.length === 1,
          itemKey: realKeys.length === 1 ? currentKey : undefined,
          isFirstInParent: isFirst,
          isLastInParent: isLast
        }
      }
      
      return { isSingleEntryInParent: false }
    } catch (e) {
      return { isSingleEntryInParent: false }
    }
  }
}
