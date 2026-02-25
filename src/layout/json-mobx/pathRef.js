import { ref, computed } from 'vue'

export const usePathRef = (path) => {
  const pathRef = ref(path)
  return pathRef
}

export const useDerivedPathRef = (parentRef, suffix) => {
  const suffixRef = ref(suffix)
  
  return computed(() => {
    const base = parentRef ? (typeof parentRef === 'object' && 'current' in parentRef ? parentRef.current : parentRef.value) : ''
    const currentSuffix = suffixRef.value
    return base ? `${base}.${currentSuffix}` : currentSuffix
  })
}
