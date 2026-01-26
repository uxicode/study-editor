/**
 * SQL 생성 유틸리티 (백엔드 전용)
 */

import type { PrismaField, PrismaEnum } from './prisma-schema-parser'

export interface SQLColumn {
  definition: string
  isPrimaryKey: boolean
}

/**
 * Prisma 타입을 SQL 타입으로 변환
 */
const PRISMA_TO_SQL_TYPE_MAP: Record<string, string> = {
  Int: 'INTEGER',
  String: 'TEXT',
  Boolean: 'BOOLEAN',
  DateTime: 'TIMESTAMP',
  Float: 'REAL'
}

/**
 * 필드 타입을 SQL 타입으로 변환
 */
export function convertPrismaTypeToSQL(
  prismaType: string,
  enums: PrismaEnum[]
): string {
  const baseType = prismaType.replace('?', '').replace('[]', '')
  
  // enum 타입 확인
  const enumDef = enums.find(e => e.name === baseType)
  if (enumDef) {
    return 'TEXT'
  }
  
  return PRISMA_TO_SQL_TYPE_MAP[baseType] || 'TEXT'
}

/**
 * 필드 속성 파싱
 */
export interface FieldAttributes {
  isPrimaryKey: boolean
  isUnique: boolean
  isUpdatedAt: boolean
  defaultValue: string
  sqlType: string
  nullable: boolean
  enumCheck?: string
}

/**
 * 필드 속성 파싱
 */
export function parseFieldAttributes(
  field: PrismaField,
  enums: PrismaEnum[]
): FieldAttributes {
  const baseType = field.type.replace('?', '').replace('[]', '')
  const isEnum = enums.some(e => e.name === baseType)
  const enumDef = enums.find(e => e.name === baseType)
  
  let sqlType = convertPrismaTypeToSQL(field.type, enums)
  let nullable = field.isOptional
  let defaultValue = ''
  
  // @default 처리
  const defaultMatch = field.attrs.match(/@default\(([^)]+)\)/)
  if (defaultMatch) {
    const defaultVal = defaultMatch[1]
    if (defaultVal === 'autoincrement()') {
      sqlType = 'SERIAL'
      nullable = false
    } else if (defaultVal === 'now()') {
      defaultValue = 'DEFAULT CURRENT_TIMESTAMP'
    } else if (defaultVal.startsWith('"') || defaultVal.startsWith("'")) {
      defaultValue = `DEFAULT ${defaultVal}`
    }
  }
  
  // @updatedAt 처리
  const isUpdatedAt = field.attrs.includes('@updatedAt')
  if (isUpdatedAt) {
    defaultValue = 'DEFAULT CURRENT_TIMESTAMP'
  }
  
  // enum CHECK 제약 조건 생성
  let enumCheck: string | undefined
  if (isEnum && enumDef && enumDef.values.length > 0) {
    const enumValues = enumDef.values.map(v => `'${v}'`).join(', ')
    enumCheck = `CHECK ("${field.name}" IN (${enumValues}))`
  }
  
  return {
    isPrimaryKey: field.attrs.includes('@id'),
    isUnique: field.attrs.includes('@unique'),
    isUpdatedAt,
    defaultValue,
    sqlType,
    nullable,
    enumCheck
  }
}

/**
 * 필드를 SQL 컬럼 정의로 변환
 */
export function convertFieldToSQLColumn(
  field: PrismaField,
  enums: PrismaEnum[]
): SQLColumn {
  const attrs = parseFieldAttributes(field, enums)
  
  let columnDef = `"${field.name}" ${attrs.sqlType}`
  
  if (!attrs.nullable && !attrs.sqlType.includes('SERIAL')) {
    columnDef += ' NOT NULL'
  }
  
  if (attrs.defaultValue) {
    columnDef += ' ' + attrs.defaultValue
  }
  
  if (attrs.isUnique) {
    columnDef += ' UNIQUE'
  }
  
  if (attrs.enumCheck) {
    columnDef += ' ' + attrs.enumCheck
  }
  
  return {
    definition: columnDef,
    isPrimaryKey: attrs.isPrimaryKey
  }
}

/**
 * CREATE TABLE SQL 생성
 */
export function generateCreateTableSQL(
  tableName: string,
  columns: SQLColumn[]
): string {
  const columnDefs: string[] = []
  let primaryKey: string | null = null
  
  for (const col of columns) {
    columnDefs.push(col.definition)
    if (col.isPrimaryKey) {
      primaryKey = col.definition.split('"')[1] // 컬럼명 추출
    }
  }
  
  // PRIMARY KEY 추가
  if (primaryKey) {
    columnDefs.push(`PRIMARY KEY ("${primaryKey}")`)
  }
  
  if (columnDefs.length === 0) {
    throw new Error(`테이블 ${tableName}에 컬럼이 없습니다`)
  }
  
  return `
    CREATE TABLE "${tableName}" (
      ${columnDefs.join(',\n      ')}
    )
  `.trim()
}
