/**
 * Prisma 스키마 파싱 유틸리티 (백엔드 전용)
 */

export interface PrismaModel {
  name: string
  content: string
  fullMatch: string
}

export interface PrismaEnum {
  name: string
  values: string[]
}

export interface PrismaField {
  name: string
  type: string
  attrs: string
  isOptional: boolean
  isArray: boolean
}

export interface ParsedPrismaSchema {
  models: PrismaModel[]
  enums: PrismaEnum[]
}

/**
 * Prisma 스키마에서 model 블록 추출
 */
export function extractModels(schemaContent: string): PrismaModel[] {
  const models: PrismaModel[] = []
  let pos = 0

  while (pos < schemaContent.length) {
    const modelStart = schemaContent.indexOf('model ', pos)
    if (modelStart === -1) break

    // model 이름 추출
    const nameMatch = schemaContent.substring(modelStart).match(/model\s+(\w+)/)
    if (!nameMatch) {
      pos = modelStart + 6
      continue
    }

    const modelName = nameMatch[1]
    const blockStart = schemaContent.indexOf('{', modelStart)
    if (blockStart === -1) break

    // 중괄호 매칭하여 블록 끝 찾기
    let depth = 1
    let blockEnd = blockStart + 1
    while (depth > 0 && blockEnd < schemaContent.length) {
      if (schemaContent[blockEnd] === '{') depth++
      if (schemaContent[blockEnd] === '}') depth--
      if (depth > 0) blockEnd++
    }

    if (depth === 0) {
      const modelContent = schemaContent.substring(blockStart + 1, blockEnd)
      const fullMatch = schemaContent.substring(modelStart, blockEnd + 1)
      models.push({
        name: modelName,
        content: modelContent,
        fullMatch
      })
    }

    pos = blockEnd + 1
  }

  return models
}

/**
 * Prisma 스키마에서 enum 블록 추출
 */
export function extractEnums(schemaContent: string): PrismaEnum[] {
  const enums: PrismaEnum[] = []
  const enumRegex = /enum\s+(\w+)\s*\{([^}]+)\}/g
  let match

  while ((match = enumRegex.exec(schemaContent)) !== null) {
    const enumName = match[1]
    const enumContent = match[2]
    const enumValues = enumContent
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//'))
      .map(l => l.split('//')[0].trim())
      .filter(Boolean)

    enums.push({
      name: enumName,
      values: enumValues
    })
  }

  return enums
}

/**
 * Prisma 스키마 전체 파싱
 */
export function parsePrismaSchema(schemaContent: string): ParsedPrismaSchema {
  return {
    models: extractModels(schemaContent),
    enums: extractEnums(schemaContent)
  }
}

/**
 * 모델 필드 파싱
 */
export function parseModelFields(modelContent: string): PrismaField[] {
  const lines = modelContent
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('//') && !l.startsWith('@@'))

  const fields: PrismaField[] = []

  for (const line of lines) {
    // 주석 제거
    const cleanLine = line.split('//')[0].trim()
    if (!cleanLine) continue

    // 필드 파싱: name Type @attr1 @attr2
    const fieldMatch = cleanLine.match(/^(\w+)\s+(\w+(?:\?|\[\])?)\s*(.*)$/)
    if (fieldMatch) {
      const type = fieldMatch[2]
      fields.push({
        name: fieldMatch[1],
        type,
        attrs: fieldMatch[3].trim(),
        isOptional: type.endsWith('?'),
        isArray: type.endsWith('[]')
      })
    }
  }

  return fields
}

/**
 * @@map 어노테이션에서 테이블 이름 추출
 * @@map이 없으면 원래 모델 이름을 그대로 사용 (대소문자 유지)
 */
export function extractTableName(modelFullMatch: string, modelName: string): string {
  const mapMatch = modelFullMatch.match(/@@map\s*\(\s*["']([^"']+)["']\s*\)/)
  // @@map이 있으면 지정된 이름 사용, 없으면 원래 모델 이름 그대로 사용
  return mapMatch ? mapMatch[1] : modelName
}

/**
 * 스키마에서 모델 이름 추출
 */
export function extractModelName(schemaContent: string): string | null {
  const modelMatch = schemaContent.match(/model\s+(\w+)/)
  return modelMatch ? modelMatch[1] : null
}

/**
 * 스키마에서 모델의 테이블 이름 추출 (모델명과 @@map 고려)
 */
export function extractTableNameFromSchema(schemaContent: string, modelName: string): string {
  const modelRegex = new RegExp(`model\\s+${modelName}[^}]*\\{([^}]+)\\}`, 's')
  const modelMatch = schemaContent.match(modelRegex)
  
  if (!modelMatch) {
    return modelName.toLowerCase()
  }
  
  const modelContent = modelMatch[0]
  const mapMatch = modelContent.match(/@@map\s*\(\s*["']([^"']+)["']\s*\)/)
  
  // @@map이 있으면 지정된 이름 사용, 없으면 모델 이름을 소문자로 변환
  return mapMatch ? mapMatch[1] : modelName.toLowerCase()
}
