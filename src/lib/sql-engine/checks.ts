/**
 * 선언형 SqlCheck 평가.
 * 구조 검사는 SQLite 의 PRAGMA 로, 행동 검사는 SAVEPOINT 안에서 실제 SQL 을 실행해 판단한다.
 */

import type {
  SqlCheck,
  SqlColumnCheck,
  SqlForeignKeyCheck,
  SqlIndexCheck,
  SqlLearnerSelectCheck,
  SqlQueryCheck,
  SqlValue
} from '@/types/sql-check'
import type { SqlSession, StatementResult } from './engine'

const sameName = (a: unknown, b: unknown): boolean => String(a).toLowerCase() === String(b).toLowerCase()

function normalizeType(type: unknown): string {
  const compact = String(type ?? '').replace(/\s+/g, '').toUpperCase()
  return compact === 'INTEGER' ? 'INT' : compact
}

function unquote(value: unknown): string {
  return String(value ?? '').replace(/^\((.*)\)$/, '$1').replace(/^['"`](.*)['"`]$/, '$1').trim()
}

function pragmaRows(session: SqlSession, pragma: string, table: string): Record<string, SqlValue>[] {
  const { columns, rows } = session.execute(`PRAGMA ${pragma}("${table.replace(/"/g, '')}")`)
  return rows.map((row) => Object.fromEntries(columns.map((name, i) => [name, row[i]])))
}

function rowsEqual(actual: SqlValue[][], expected: SqlValue[][]): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

/**
 * 기대 행마다 그 값들을 모두 포함하는 결과 행이 하나씩 대응되어야 한다 (행 개수 동일, 컬럼 순서·추가 컬럼 무시).
 */
function rowsCovered(actual: SqlValue[][], expected: SqlValue[][]): boolean {
  if (actual.length !== expected.length) return false

  const remaining = [...actual]
  return expected.every((expectedRow) => {
    const matchIndex = remaining.findIndex((row) => {
      const cells = [...row]
      return expectedRow.every((value) => {
        const at = cells.findIndex((cell) => cell === value)
        if (at === -1) return false
        cells.splice(at, 1)
        return true
      })
    })
    if (matchIndex === -1) return false
    remaining.splice(matchIndex, 1)
    return true
  })
}

function containsText(rows: SqlValue[][], text: string): boolean {
  const needle = text.toLowerCase()
  return rows.some((row) => row.some((cell) => String(cell ?? '').toLowerCase().includes(needle)))
}

function checkColumn(session: SqlSession, check: SqlColumnCheck): boolean {
  const column = pragmaRows(session, 'table_info', check.table).find((c) => sameName(c.name, check.column))
  if (!column) return false

  if (check.sqlType !== undefined && normalizeType(column.type) !== normalizeType(check.sqlType)) return false

  if (check.notNull !== undefined) {
    const isNotNull = column.notnull === 1 || Number(column.pk) > 0
    if (isNotNull !== check.notNull) return false
  }
  if (check.defaultValue !== undefined) {
    if (column.dflt_value === null || !sameName(unquote(column.dflt_value), check.defaultValue)) return false
  }
  return true
}

function checkForeignKey(session: SqlSession, check: SqlForeignKeyCheck): boolean {
  return pragmaRows(session, 'foreign_key_list', check.table).some(
    (fk) =>
      sameName(fk.from, check.column) &&
      sameName(fk.table, check.refTable) &&
      sameName(fk.to ?? 'id', check.refColumn) &&
      (check.onDelete === undefined || sameName(fk.on_delete, check.onDelete))
  )
}

function checkIndex(session: SqlSession, check: SqlIndexCheck): boolean {
  return pragmaRows(session, 'index_list', check.table).some((index) => {
    if (check.unique !== undefined && (index.unique === 1) !== check.unique) return false
    const columns = pragmaRows(session, 'index_info', String(index.name))
      .sort((a, b) => Number(a.seqno) - Number(b.seqno))
      .map((c) => String(c.name))
    return columns.length === check.columns.length && columns.every((name, i) => sameName(name, check.columns[i]))
  })
}

function checkQuery(session: SqlSession, check: SqlQueryCheck): boolean {
  return session.isolated(() => {
    try {
      if (check.setup) session.executeScript(check.setup)
      const { rows } = session.executeScript(check.sql)
      if (check.expect !== undefined && !rowsEqual(rows, check.expect)) return false
      if (check.contains !== undefined && !containsText(rows, check.contains)) return false
      return true
    } catch {
      return false
    }
  })
}

function matchesLearnerSelect(result: StatementResult, expect: SqlLearnerSelectCheck['expect']): boolean {
  if (expect.rowCount !== undefined && result.rows.length !== expect.rowCount) return false

  if (expect.column) {
    const index = result.columns.findIndex((name) => sameName(name, expect.column?.name))
    if (index === -1) return false
    const values = result.rows.map((row) => row[index])
    const expected = expect.column.values
    const equal = expect.column.ordered
      ? JSON.stringify(values) === JSON.stringify(expected)
      : JSON.stringify([...values].sort()) === JSON.stringify([...expected].sort())
    if (!equal) return false
  }
  if (expect.rows && !rowsCovered(result.rows, expect.rows)) return false
  if (expect.contains !== undefined && !containsText(result.rows, expect.contains)) return false
  return true
}

/** 검사 하나를 평가한다. 통과하면 true. */
export function evaluateSqlCheck(
  session: SqlSession,
  check: Exclude<SqlCheck, SqlLearnerSelectCheck>
): boolean {
  switch (check.type) {
    case 'table':
      return pragmaRows(session, 'table_info', check.table).length > 0
    case 'column':
      return checkColumn(session, check)
    case 'primaryKey': {
      const keys = pragmaRows(session, 'table_info', check.table)
        .filter((c) => Number(c.pk) > 0)
        .sort((a, b) => Number(a.pk) - Number(b.pk))
        .map((c) => String(c.name))
      return keys.length === check.columns.length && keys.every((name, i) => sameName(name, check.columns[i]))
    }
    case 'foreignKey':
      return checkForeignKey(session, check)
    case 'index':
      return checkIndex(session, check)
    case 'accepts':
      return session.isolated(() => {
        try {
          if (check.setup) session.executeScript(check.setup)
          session.executeScript(check.sql)
          return true
        } catch {
          return false
        }
      }, { foreignKeys: check.foreignKeys })
    case 'rejects':
      return session.isolated(() => {
        try {
          if (check.setup) session.executeScript(check.setup)
        } catch {
          return false
        }
        try {
          session.executeScript(check.sql)
          return false
        } catch (error) {
          // 테이블이 없는 등의 다른 오류를 '거부됨'으로 오인하지 않도록 지정한 제약 위반만 인정한다
          return error instanceof Error && error.message.toUpperCase().includes(`${check.constraint} CONSTRAINT FAILED`)
        }
      }, { foreignKeys: check.foreignKeys })
    case 'query':
      return checkQuery(session, check)
  }
}

/**
 * `learnerSelect` 검사: 학습자의 SELECT/EXPLAIN 문 중 하나라도 조건을 만족하면 통과.
 * `freshSession` 은 학습자 DDL 이 적용되고 fixture 가 채워진 깨끗한 세션이어야 한다.
 */
export function evaluateLearnerSelect(
  freshSession: SqlSession,
  learnerStatements: StatementResult[],
  check: SqlLearnerSelectCheck
): boolean {
  return learnerStatements.some((statement) => {
    if (statement.columns.length === 0) return false
    return freshSession.isolated(() => {
      try {
        const result = freshSession.executeScript(statement.sql)
        return matchesLearnerSelect({ ...statement, columns: result.columns, rows: result.rows }, check.expect)
      } catch {
        return false
      }
    })
  })
}
