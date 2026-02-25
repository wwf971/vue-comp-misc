import { reactive } from 'vue'

const keyOrderMap = new WeakMap()
const keyIdMap = new WeakMap()
const keyOrderVersionMap = new WeakMap()
let keyIdCounter = 1

const normalizeKeyOrder = (keys) => {
  const unique = []
  const seen = new Set()
  keys.forEach(key => {
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(key)
    }
  })
  return unique
}

export const getOrderedKeys = (obj, keys) => {
  const normalizedKeys = normalizeKeyOrder(keys)
  let order = keyOrderMap.get(obj)

  if (!order) {
    keyOrderMap.set(obj, normalizedKeys)
    if (!keyOrderVersionMap.has(obj)) {
      keyOrderVersionMap.set(obj, reactive({ version: 0 }))
    }
    return normalizedKeys.slice()
  }

  const keySet = new Set(normalizedKeys)
  const nextOrder = order.filter(key => keySet.has(key))

  normalizedKeys.forEach(key => {
    if (!nextOrder.includes(key)) {
      nextOrder.push(key)
    }
  })

  keyOrderMap.set(obj, nextOrder)
  
  // Access version to make Vue track it
  const versionObj = keyOrderVersionMap.get(obj)
  if (versionObj) {
    const _ = versionObj.version // Access to trigger reactivity
  }
  
  return nextOrder.slice()
}

export const renameKeyInOrder = (obj, oldKey, newKey) => {
  const order = keyOrderMap.get(obj)
  if (!order) return
  const index = order.indexOf(oldKey)
  if (index === -1) return
  order[index] = newKey
  keyOrderMap.set(obj, order)
  // Trigger reactivity
  const versionObj = keyOrderVersionMap.get(obj)
  if (versionObj) versionObj.version++
}

export const addKeyInOrder = (obj, newKey, position, referenceKey) => {
  let order = keyOrderMap.get(obj)
  if (!order) {
    order = Object.keys(obj)
    keyOrderMap.set(obj, order)
  }
  
  const existingIndex = order.indexOf(newKey)
  if (existingIndex !== -1) {
    order.splice(existingIndex, 1)
  }
  
  const refIndex = referenceKey ? order.indexOf(referenceKey) : -1
  if (refIndex === -1 || !referenceKey) {
    order.push(newKey)
  } else {
    const insertIndex = position === 'above' ? refIndex : refIndex + 1
    order.splice(insertIndex, 0, newKey)
  }
  
  keyOrderMap.set(obj, order)
  // Trigger reactivity
  const versionObj = keyOrderVersionMap.get(obj)
  if (versionObj) versionObj.version++
}

export const getKeyIdentity = (obj, key) => {
  let map = keyIdMap.get(obj)
  if (!map) {
    map = new Map()
    keyIdMap.set(obj, map)
  }
  if (!map.has(key)) {
    const id = `key_${keyIdCounter++}`
    map.set(key, id)
  }
  return map.get(key)
}

export const renameKeyIdentity = (obj, oldKey, newKey) => {
  const map = keyIdMap.get(obj)
  if (!map || !map.has(oldKey)) return
  const id = map.get(oldKey)
  map.delete(oldKey)
  map.set(newKey, id)
}

export const assignKeyIdentity = (obj, key) => {
  let map = keyIdMap.get(obj)
  if (!map) {
    map = new Map()
    keyIdMap.set(obj, map)
  }
  if (!map.has(key)) {
    const id = `key_${keyIdCounter++}`
    map.set(key, id)
  }
  return map.get(key)
}

export const moveKeyInOrder = (obj, key, action) => {
  let order = keyOrderMap.get(obj)
  if (!order) {
    order = Object.keys(obj)
    keyOrderMap.set(obj, order)
  }
  
  const currentIndex = order.indexOf(key)
  if (currentIndex === -1) return
  
  const newOrder = [...order]
  newOrder.splice(currentIndex, 1)
  
  if (action === 'moveEntryUp') {
    newOrder.splice(Math.max(0, currentIndex - 1), 0, key)
  } else if (action === 'moveEntryDown') {
    newOrder.splice(Math.min(newOrder.length, currentIndex + 1), 0, key)
  } else if (action === 'moveEntryToTop') {
    newOrder.unshift(key)
  } else if (action === 'moveEntryToBottom') {
    newOrder.push(key)
  }
  
  keyOrderMap.set(obj, newOrder)
  
  const versionObj = keyOrderVersionMap.get(obj)
  if (!versionObj) {
    keyOrderVersionMap.set(obj, reactive({ version: 0 }))
  }
  versionObj.version++
}
