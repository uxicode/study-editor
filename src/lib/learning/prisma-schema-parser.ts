/**
 * Prisma 스키마 파싱 유틸리티 (학습용 시뮬레이션)
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

export function extractModels(schemaContent: string): PrismaModel[] {
  const models: PrismaModel[] = []
  let pos = 0

  while (pos < schemaContent.length) {
    const modelStart = schemaContent.indexOf('model ', pos)
    if (modelStart === -1) break

    const nameMatch = schemaContent.substring(modelStart).match(/model\s+(\w+)/)
    if (!nameMatch) {
      pos = modelStart + 6
      continue
    }

    const modelName = nameMatch[1]
    const blockStart = schemaContent.indexOf('{', modelStart)
    if (blockStart === -1) break

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

export function extractEnums(schemaContent: string): PrismaEnum[] {
  const enums: PrismaEnum[] = []
  const enumRegex = /enum\s+(\w+)\s*\{([^}]+)\}/g
  let match

  while ((match = enumRegex.exec(schemaContent)) !== null) {
    const enumName = match[1]
    const enumContent = match[2]
    const enumValues = enumContent
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('//'))
      .map((l) => l.split('//')[0].trim())
      .filter(Boolean)

    enums.push({ name: enumName, values: enumValues })
  }

  return enums
}

export function parsePrismaSchema(schemaContent: string): ParsedPrismaSchema {
  return {
    models: extractModels(schemaContent),
    enums: extractEnums(schemaContent)
  }
}

export function parseModelFields(modelContent: string): PrismaField[] {
  const lines = modelContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('@@'))

  const fields: PrismaField[] = []

  for (const line of lines) {
    const cleanLine = line.split('//')[0].trim()
    if (!cleanLine) continue

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

export function extractTableName(modelFullMatch: string, modelName: string): string {
  const mapMatch = modelFullMatch.match(/@@map\s*\(\s*["']([^"']+)["']\s*\)/)
  return mapMatch ? mapMatch[1] : modelName
}

export function extractModelName(schemaContent: string): string | null {
  const modelMatch = schemaContent.match(/model\s+(\w+)/)
  return modelMatch ? modelMatch[1] : null
}

export function extractTableNameFromSchema(schemaContent: string, modelName: string): string {
  const modelRegex = new RegExp(`model\\s+${modelName}[^}]*\\{([^}]+)\\}`, 's')
  const modelMatch = schemaContent.match(modelRegex)
  if (!modelMatch) return modelName.toLowerCase()

  const modelContent = modelMatch[0]
  const mapMatch = modelContent.match(/@@map\s*\(\s*["']([^"']+)["']\s*\)/)
  return mapMatch ? mapMatch[1] : modelName.toLowerCase()
}
