// Try to import js-yaml, but make it optional
let yaml: any = null
let yamlLoadError: string | null = null

try {
  // @ts-ignore - optional import
  yaml = require('js-yaml')
} catch (e) {
  yamlLoadError = 'js-yaml package not installed'
  console.warn('js-yaml not installed, YAML parsing will be disabled')
}

/**
 * Parse YAML or JSON string to JavaScript object
 * Note: js-yaml can parse both YAML and JSON
 * 
 * @param yamlString - YAML or JSON string
 * @returns code: 0 (success), 1 (invalid input), 2 (parse error)
 */
export function parseYamlToJson(yamlString: string): { code: number; message: string; data: any } {
  if (!yamlString || typeof yamlString !== 'string') {
    return {
      code: 1,
      message: 'Invalid input: string is required',
      data: null
    }
  }

  if (!yaml) {
    return {
      code: 2,
      message: 'YAML parser not available. Please install js-yaml package: npm install js-yaml',
      data: null
    }
  }

  try {
    const result = yaml.load(yamlString)
    return {
      code: 0,
      message: 'Success',
      data: result
    }
  } catch (error: any) {
    return {
      code: 2,
      message: `Parsing error: ${error.message}`,
      data: null
    }
  }
}

/**
 * Parse JSON string to JavaScript object (strict JSON only)
 * 
 * @param jsonString - JSON string
 * @returns code: 0 (success), 1 (invalid input), 2 (parse error)
 */
export function parseJsonString(jsonString: string): { code: number; message: string; data: any } {
  if (!jsonString || typeof jsonString !== 'string') {
    return {
      code: 1,
      message: 'Invalid input: string is required',
      data: null
    }
  }

  try {
    const result = JSON.parse(jsonString)
    return {
      code: 0,
      message: 'Success',
      data: result
    }
  } catch (error: any) {
    return {
      code: 2,
      message: `JSON parsing error: ${error.message}`,
      data: null
    }
  }
}

/**
 * Smart parser - tries JSON first, then YAML
 * 
 * @param str - Input string
 * @returns code: 0 (success), 1 (invalid input), 2 (parse error)
 */
export function parseStringToJson(str: string): { code: number; message: string; data: any } {
  // Try JSON first (faster and more common)
  const jsonResult = parseJsonString(str)
  if (jsonResult.code === 0) {
    return jsonResult
  }

  // Fall back to YAML parser (which also handles JSON)
  return parseYamlToJson(str)
}

/**
 * Format JavaScript object as pretty JSON string
 * 
 * @param obj - Object to format
 * @param indent - Number of spaces for indentation (default: 2)
 * @returns Formatted JSON string or error message
 */
export function formatJson(obj: any, indent: number = 2): string {
  try {
    return JSON.stringify(obj, null, indent)
  } catch (error: any) {
    return `Error formatting JSON: ${error.message}`
  }
}
