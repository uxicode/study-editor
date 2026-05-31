/**
 * 학습용 시뮬레이션 진입점
 *
 * Prisma 스키마를 MySQL DDL로 변환해 인메모리 DB에 적용하고,
 * Prisma 실행 출력을 파싱하여 INSERT SQL로 실행한다.
 */

import { db, type InMemoryTable } from './in-memory-db'
import {
  extractModelName,
  extractTableName,
  extractTableNameFromSchema,
  parseModelFields,
  parsePrismaSchema
} from './prisma-schema-parser'
import {
  convertDateFields,
  convertJsObjectToJSON,
  extractModelFieldNames,
  extractObjectPatterns,
  filterValidFields
} from './prisma-output-parser'
import { convertFieldToSQLColumn, generateCreateTableSQL } from './sql-generator'
import { generateInsertSQL, prepareInsertData } from './sql-data-inserter'

export interface PrismaToSqlResult {
  sql: string
  tables: Array<{ name: string; sql: string }>
  modelsCount: number
  enumsCount: number
}

export interface PrismaOutputToSqlResult {
  insertStatements: Array<{ sql: string; tableName: string }>
  objectsCount: number
}

/** Prisma schema 내용을 MySQL DDL로 변환하고 인메모리 DB에 반영 */
export function prismaSchemaToSql(schemaContent: string): PrismaToSqlResult {
  const { models, enums } = parsePrismaSchema(schemaContent)

  if (models.length === 0) {
    return { sql: '', tables: [], modelsCount: 0, enumsCount: enums.length }
  }

  const sqlStatements: string[] = []
  const tables: Array<{ name: string; sql: string }> = []

  for (const model of models) {
    const tableName = extractTableName(model.fullMatch, model.name)
    const fields = parseModelFields(model.content)
    if (fields.length === 0) continue

    const columns = fields.map((field) => convertFieldToSQLColumn(field, enums))
    const createTableSQL = generateCreateTableSQL(tableName, columns)
    sqlStatements.push(createTableSQL)
    tables.push({ name: tableName, sql: createTableSQL })

    try {
      db.executeCreateTable(createTableSQL)
    } catch (error) {
      console.error(`테이블 생성 실패 (${tableName})`, error)
    }
  }

  const finalSQL = sqlStatements.join(';\n\n') + (sqlStatements.length > 0 ? ';' : '')

  return {
    sql: finalSQL,
    tables,
    modelsCount: models.length,
    enumsCount: enums.length
  }
}

/** Prisma 실행 출력을 파싱해 INSERT SQL로 변환하고 인메모리 DB에 반영 */
export function prismaOutputToSql(
  output: string,
  schemaContent: string
): PrismaOutputToSqlResult {
  const modelName = extractModelName(schemaContent)
  if (!modelName) {
    return { insertStatements: [], objectsCount: 0 }
  }

  const tableName = extractTableNameFromSchema(schemaContent, modelName)
  const objectPatterns = extractObjectPatterns(output)
  if (objectPatterns.length === 0) {
    return { insertStatements: [], objectsCount: 0 }
  }

  const fieldNames = extractModelFieldNames(schemaContent, modelName)
  const insertStatements: Array<{ sql: string; tableName: string }> = []

  for (const objStr of objectPatterns) {
    const data = convertJsObjectToJSON(objStr)
    if (!data) continue

    const validData = filterValidFields(data, fieldNames)
    if (Object.keys(validData).length === 0) continue

    const converted = convertDateFields(validData)
    const { columns, values } = prepareInsertData(converted)
    const insertSQL = generateInsertSQL(tableName, columns, values)

    insertStatements.push({ sql: insertSQL, tableName })

    try {
      db.executeInsert(insertSQL)
    } catch (error) {
      console.error(`데이터 삽입 실패 (${tableName})`, error)
    }
  }

  return {
    insertStatements,
    objectsCount: objectPatterns.length
  }
}

export function snapshotTables(): InMemoryTable[] {
  return db.getAllTables()
}

export function resetDatabase(): void {
  db.reset()
}

/**
 * 학습자가 직접 작성한 `schema.sql` 내용을 인메모리 DB 에 반영한다.
 *
 * - `--` / `/* ... *\/` 주석을 제거하고 세미콜론으로 분할
 * - `CREATE TABLE` 문만 처리 (다른 문은 무시)
 * - 한 문이라도 파싱에 실패하면 해당 문만 건너뛰고 계속 진행
 *
 * 반환값은 실제로 등록된 테이블 수 + 원본 SQL 의 정리된 형태이다.
 */
export interface RawSqlLoadResult {
  tablesCreated: number
  normalizedSql: string
}

export function loadRawSqlSchema(content: string): RawSqlLoadResult {
  if (!content || !content.trim()) {
    return { tablesCreated: 0, normalizedSql: '' }
  }

  const withoutBlockComments = content.replace(/\/\*[\s\S]*?\*\//g, '')
  const cleaned = withoutBlockComments
    .split('\n')
    .map((line) => line.replace(/--.*$/, ''))
    .join('\n')

  const statements = cleaned
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  let tablesCreated = 0
  for (const stmt of statements) {
    if (!/^CREATE\s+TABLE/i.test(stmt)) continue
    try {
      db.executeCreateTable(stmt + ';')
      tablesCreated++
    } catch {
      // 학습 중에는 일부 구문이 미완성일 수 있으므로 조용히 건너뛴다
    }
  }

  const normalizedSql = statements
    .filter((s) => /^CREATE\s+TABLE/i.test(s))
    .map((s) => s + ';')
    .join('\n\n')

  return { tablesCreated, normalizedSql }
}
