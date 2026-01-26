/**
 * Prisma 출력 파싱 유틸리티
 */

export interface ParsedDataObject {
  [key: string]: unknown
}

/**
 * 출력에서 JavaScript 객체 패턴 추출
 */
export function extractObjectPatterns(output: string): string[] {
  if (!output) {
    return []
  }

  // 여러 줄에 걸친 객체도 처리
  // 예: { id: 1,\n  email: 'test@test.com',\n  name: 'Test' }
  const objectPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gs
  return output.match(objectPattern) || []
}

/**
 * JavaScript 객체 문자열을 JSON으로 변환
 */
export function convertJsObjectToJSON(objStr: string): ParsedDataObject | null {
  try {
    // JavaScript 객체를 JSON으로 변환 시도
    // 단순한 경우만 처리 (복잡한 객체는 무시)
    let cleanedStr = objStr
      .replace(/(\w+):/g, '"$1":')  // 키에 따옴표 추가
      .replace(/'/g, '"')           // 작은따옴표를 큰따옴표로

    return JSON.parse(cleanedStr)
  } catch (error) {
    // 파싱 실패 시 null 반환
    return null
  }
}

/**
 * Prisma 스키마에서 모델의 필드명 추출
 */
export function extractModelFieldNames(schemaContent: string, modelName: string): string[] {
  const modelRegex = new RegExp(`model\\s+${modelName}[^}]*\\{([^}]+)\\}`, 's')
  const schemaFields = schemaContent.match(modelRegex)?.[1]
  
  if (!schemaFields) {
    return []
  }

  // 필드명 추출: name Type @attr
  const fieldMatches = schemaFields.match(/(\w+)\s+\w+/g)
  return fieldMatches?.map(f => f.split(/\s+/)[0]) || []
}

/**
 * 데이터 객체에서 유효한 필드만 필터링
 */
export function filterValidFields(
  data: ParsedDataObject,
  validFieldNames: string[]
): Record<string, unknown> {
  return Object.keys(data)
    .filter(key => validFieldNames.includes(key))
    .reduce((acc, key) => {
      acc[key] = data[key]
      return acc
    }, {} as Record<string, unknown>)
}

/**
 * 날짜 필드 값 변환 (TIMESTAMP 형식)
 */
export function convertDateFields(
  data: Record<string, unknown>
): Record<string, unknown> {
  const converted = { ...data }
  
  for (const [key, value] of Object.entries(converted)) {
    // 필드명에 'At'이 포함되고 문자열인 경우 날짜로 변환
    if (key.includes('At') && typeof value === 'string') {
      converted[key] = new Date(value).toISOString()
    }
  }
  
  return converted
}
