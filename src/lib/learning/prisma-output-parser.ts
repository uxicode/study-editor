/**
 * Prisma 출력 파싱 유틸리티 (학습용 시뮬레이션)
 */

export interface ParsedDataObject {
  [key: string]: unknown
}

export function extractObjectPatterns(output: string): string[] {
  if (!output) return []
  const objectPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gs
  return output.match(objectPattern) || []
}

export function convertJsObjectToJSON(objStr: string): ParsedDataObject | null {
  try {
    const cleanedStr = objStr.replace(/(\w+):/g, '"$1":').replace(/'/g, '"')
    return JSON.parse(cleanedStr)
  } catch {
    return null
  }
}

export function extractModelFieldNames(schemaContent: string, modelName: string): string[] {
  const modelRegex = new RegExp(`model\\s+${modelName}[^}]*\\{([^}]+)\\}`, 's')
  const schemaFields = schemaContent.match(modelRegex)?.[1]
  if (!schemaFields) return []

  const fieldMatches = schemaFields.match(/(\w+)\s+\w+/g)
  return fieldMatches?.map((f) => f.split(/\s+/)[0]) || []
}

export function filterValidFields(
  data: ParsedDataObject,
  validFieldNames: string[]
): Record<string, unknown> {
  return Object.keys(data)
    .filter((key) => validFieldNames.includes(key))
    .reduce(
      (acc, key) => {
        acc[key] = data[key]
        return acc
      },
      {} as Record<string, unknown>
    )
}

export function convertDateFields(data: Record<string, unknown>): Record<string, unknown> {
  const converted = { ...data }
  for (const [key, value] of Object.entries(converted)) {
    if (key.includes('At') && typeof value === 'string') {
      converted[key] = new Date(value).toISOString()
    }
  }
  return converted
}
