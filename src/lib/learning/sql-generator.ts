/**
 * Prisma → MySQL DDL 변환 유틸리티 (학습용 시뮬레이션)
 *
 * 학습 커리큘럼이 MySQL 기준이므로 식별자는 백틱(`)으로 감싸고
 * autoincrement 는 `INT AUTO_INCREMENT` 로 변환한다.
 */

import type { PrismaField, PrismaEnum } from './prisma-schema-parser'

export interface SQLColumn {
  definition: string
  isPrimaryKey: boolean
}

const PRISMA_TO_SQL_TYPE_MAP: Record<string, string> = {
  Int: 'INT',
  String: 'TEXT',
  Boolean: 'BOOLEAN',
  DateTime: 'TIMESTAMP',
  Float: 'DOUBLE'
}

export function convertPrismaTypeToSQL(prismaType: string, enums: PrismaEnum[]): string {
  const baseType = prismaType.replace('?', '').replace('[]', '')
  const enumDef = enums.find((e) => e.name === baseType)
  if (enumDef) return 'TEXT'
  return PRISMA_TO_SQL_TYPE_MAP[baseType] || 'TEXT'
}

export interface FieldAttributes {
  isPrimaryKey: boolean
  isUnique: boolean
  isUpdatedAt: boolean
  defaultValue: string
  sqlType: string
  nullable: boolean
  isAutoIncrement: boolean
  enumCheck?: string
}

export function parseFieldAttributes(field: PrismaField, enums: PrismaEnum[]): FieldAttributes {
  const baseType = field.type.replace('?', '').replace('[]', '')
  const isEnum = enums.some((e) => e.name === baseType)
  const enumDef = enums.find((e) => e.name === baseType)

  let sqlType = convertPrismaTypeToSQL(field.type, enums)
  let nullable = field.isOptional
  let defaultValue = ''
  let isAutoIncrement = false

  const defaultMatch = field.attrs.match(/@default\(([^)]+)\)/)
  if (defaultMatch) {
    const defaultVal = defaultMatch[1]
    if (defaultVal === 'autoincrement()') {
      sqlType = 'INT'
      isAutoIncrement = true
      nullable = false
    } else if (defaultVal === 'now()') {
      defaultValue = 'DEFAULT CURRENT_TIMESTAMP'
    } else if (defaultVal.startsWith('"') || defaultVal.startsWith("'")) {
      defaultValue = `DEFAULT ${defaultVal}`
    }
  }

  const isUpdatedAt = field.attrs.includes('@updatedAt')
  if (isUpdatedAt) {
    defaultValue = 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
  }

  let enumCheck: string | undefined
  if (isEnum && enumDef && enumDef.values.length > 0) {
    const enumValues = enumDef.values.map((v) => `'${v}'`).join(', ')
    enumCheck = `CHECK (\`${field.name}\` IN (${enumValues}))`
  }

  return {
    isPrimaryKey: field.attrs.includes('@id'),
    isUnique: field.attrs.includes('@unique'),
    isUpdatedAt,
    defaultValue,
    sqlType,
    nullable,
    isAutoIncrement,
    enumCheck
  }
}

export function convertFieldToSQLColumn(field: PrismaField, enums: PrismaEnum[]): SQLColumn {
  const attrs = parseFieldAttributes(field, enums)

  let columnDef = `\`${field.name}\` ${attrs.sqlType}`

  if (!attrs.nullable) columnDef += ' NOT NULL'
  if (attrs.isAutoIncrement) columnDef += ' AUTO_INCREMENT'
  if (attrs.defaultValue) columnDef += ' ' + attrs.defaultValue
  if (attrs.isUnique) columnDef += ' UNIQUE'
  if (attrs.enumCheck) columnDef += ' ' + attrs.enumCheck

  return {
    definition: columnDef,
    isPrimaryKey: attrs.isPrimaryKey
  }
}

export function generateCreateTableSQL(tableName: string, columns: SQLColumn[]): string {
  const columnDefs: string[] = []
  let primaryKey: string | null = null

  for (const col of columns) {
    columnDefs.push(col.definition)
    if (col.isPrimaryKey) {
      const match = col.definition.match(/`([^`]+)`/)
      if (match) primaryKey = match[1]
    }
  }

  if (primaryKey) {
    columnDefs.push(`PRIMARY KEY (\`${primaryKey}\`)`)
  }

  if (columnDefs.length === 0) {
    throw new Error(`테이블 ${tableName}에 컬럼이 없습니다`)
  }

  return `CREATE TABLE \`${tableName}\` (\n  ${columnDefs.join(',\n  ')}\n)`
}
