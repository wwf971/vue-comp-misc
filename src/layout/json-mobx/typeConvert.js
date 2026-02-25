/**
 * Get available type conversions for a value
 * @param {*} value - The value to convert
 * @returns {Array} Array of conversion objects with targetType, canConvert, convertedValue, reason
 */
export function getAvailableConversions(value) {
  const conversions = []
  const currentType = value === null || value === undefined ? 'null' : typeof value

  if (currentType === 'string') {
    conversions.push({
      targetType: 'number',
      canConvert: !isNaN(Number(value)) && value.trim() !== '',
      convertedValue: Number(value),
      reason: isNaN(Number(value)) || value.trim() === '' ? 'Not a valid number' : undefined
    })
    
    conversions.push({
      targetType: 'boolean',
      canConvert: value === 'true' || value === 'false',
      convertedValue: value === 'true',
      reason: value !== 'true' && value !== 'false' ? 'Must be "true" or "false"' : undefined
    })
    
    conversions.push({
      targetType: 'null',
      canConvert: true,
      convertedValue: null
    })
    
    conversions.push({
      targetType: 'object',
      canConvert: true,
      convertedValue: {}
    })
    
    conversions.push({
      targetType: 'array',
      canConvert: true,
      convertedValue: []
    })
    
    // Try to parse as JSON
    let jsonParseable = false
    let jsonValue = null
    try {
      jsonValue = JSON.parse(value)
      jsonParseable = true
    } catch (e) {
      // Not valid JSON
    }
    
    if (jsonParseable) {
      conversions.push({
        targetType: 'json',
        canConvert: true,
        convertedValue: jsonValue
      })
    }
  } else if (currentType === 'number') {
    conversions.push({
      targetType: 'string',
      canConvert: true,
      convertedValue: String(value)
    })
    
    conversions.push({
      targetType: 'boolean',
      canConvert: true,
      convertedValue: value !== 0
    })
    
    conversions.push({
      targetType: 'null',
      canConvert: true,
      convertedValue: null
    })
    
    conversions.push({
      targetType: 'object',
      canConvert: true,
      convertedValue: {}
    })
    
    conversions.push({
      targetType: 'array',
      canConvert: true,
      convertedValue: []
    })
  } else if (currentType === 'boolean') {
    conversions.push({
      targetType: 'string',
      canConvert: true,
      convertedValue: String(value)
    })
    
    conversions.push({
      targetType: 'number',
      canConvert: true,
      convertedValue: value ? 1 : 0
    })
    
    conversions.push({
      targetType: 'null',
      canConvert: true,
      convertedValue: null
    })
    
    conversions.push({
      targetType: 'object',
      canConvert: true,
      convertedValue: {}
    })
    
    conversions.push({
      targetType: 'array',
      canConvert: true,
      convertedValue: []
    })
  } else if (currentType === 'null') {
    conversions.push({
      targetType: 'string',
      canConvert: true,
      convertedValue: ''
    })
    
    conversions.push({
      targetType: 'number',
      canConvert: true,
      convertedValue: 0
    })
    
    conversions.push({
      targetType: 'boolean',
      canConvert: true,
      convertedValue: false
    })
    
    conversions.push({
      targetType: 'object',
      canConvert: true,
      convertedValue: {}
    })
    
    conversions.push({
      targetType: 'array',
      canConvert: true,
      convertedValue: []
    })
  } else if (currentType === 'object') {
    if (Array.isArray(value)) {
      conversions.push({
        targetType: 'object',
        canConvert: true,
        convertedValue: {}
      })
    } else {
      conversions.push({
        targetType: 'array',
        canConvert: true,
        convertedValue: []
      })
    }
    
    conversions.push({
      targetType: 'string',
      canConvert: true,
      convertedValue: JSON.stringify(value)
    })
    
    conversions.push({
      targetType: 'null',
      canConvert: true,
      convertedValue: null
    })
  }

  return conversions
}

/**
 * Convert a value to a target type
 * @param {*} value - The value to convert
 * @param {string} targetType - The target type
 * @returns {*} The converted value
 */
export function convertValue(value, targetType) {
  if (targetType === 'string') return String(value)
  if (targetType === 'number') return Number(value)
  if (targetType === 'boolean') return value === 'true' || value === true
  if (targetType === 'null') return null
  if (targetType === 'object') return {}
  if (targetType === 'array') return []
  if (targetType === 'json') {
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }
  return value
}
