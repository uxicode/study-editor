/**
 * SQL 실행 엔진 (sql.js = SQLite WASM).
 *
 * 학습자의 MySQL 스타일 SQL 을 SQLite 로 변환해 실제로 실행한다.
 * 변환 규칙은 `translate.ts` 를 참고한다.
 */

import type { Database, SqlJsStatic } from 'sql.js'
import type { SqlValue } from '@/types/sql-check'
import { splitSqlStatements, translateStatement } from './translate'

export interface SqlScriptFile {
  name: string
  content: string
}

export interface StatementResult {
  file: string
  /** 파일 안에서의 구문 번호 (1부터) */
  index: number
  /** 변환 전 원문 */
  sql: string
  isDdl: boolean
  /** SELECT/EXPLAIN 처럼 결과 집합이 있는 구문이면 컬럼 목록 */
  columns: string[]
  rows: SqlValue[][]
}

export interface SqlExecutionError {
  file: string
  index: number
  sql: string
  message: string
}

export interface RunOptions {
  /** CREATE/ALTER/DROP 만 실행한다 (학습자가 넣은 데이터 없이 스키마만 만들 때) */
  onlyDdl?: boolean
}

export interface ScriptRunResult {
  statements: StatementResult[]
  error?: SqlExecutionError
}

type WasmLocator = (fileName: string) => string

let wasmLocator: WasmLocator | null = null
let sqlJsPromise: Promise<SqlJsStatic> | null = null

/** wasm 파일 위치를 바꾼다 (Node 테스트 환경 등). 최초 로드 전에 호출해야 한다. */
export function configureSqlWasm(locator: WasmLocator): void {
  wasmLocator = locator
  sqlJsPromise = null
}

function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = (async () => {
      const [{ default: initSqlJs }, { default: browserWasmUrl }] = await Promise.all([
        import('sql.js'),
        import('sql.js/dist/sql-wasm-browser.wasm?url')
      ])
      return initSqlJs({ locateFile: (fileName) => (wasmLocator ? wasmLocator(fileName) : browserWasmUrl) })
    })().catch((error: unknown) => {
      sqlJsPromise = null
      throw error
    })
  }
  return sqlJsPromise
}

/** 엔진을 불러올 수 있는지 확인한다 (오프라인 등으로 실패하면 null) */
export async function createSqlSession(): Promise<SqlSession | null> {
  try {
    const SQL = await loadSqlJs()
    return new SqlSession(new SQL.Database())
  } catch {
    return null
  }
}

function isDdlStatement(sql: string): boolean {
  return /^(CREATE|ALTER|DROP)\b/i.test(sql.trim())
}

function toSqlValue(value: unknown): SqlValue {
  if (value === null || typeof value === 'number' || typeof value === 'string') return value
  return String(value)
}

export class SqlSession {
  private readonly db: Database

  constructor(db: Database) {
    this.db = db
    this.db.run('PRAGMA foreign_keys = ON')
  }

  /** 파일들을 순서대로 실행한다. 첫 오류에서 멈추고 오류 위치를 돌려준다. */
  runFiles(files: SqlScriptFile[], options: RunOptions = {}): ScriptRunResult {
    const statements: StatementResult[] = []

    for (const file of files) {
      const originals = splitSqlStatements(file.content)

      for (let i = 0; i < originals.length; i++) {
        const original = originals[i]
        const ddl = isDdlStatement(original)
        const translated = translateStatement(original)

        if (options.onlyDdl && !ddl) continue

        for (const sql of translated) {
          try {
            const result = this.execute(sql)
            statements.push({ file: file.name, index: i + 1, sql: original, isDdl: ddl, ...result })
          } catch (error) {
            return {
              statements,
              error: {
                file: file.name,
                index: i + 1,
                sql: original,
                message: error instanceof Error ? error.message : String(error)
              }
            }
          }
        }
      }
    }

    return { statements }
  }

  /** 구문 하나를 실행하고 결과 집합을 돌려준다 */
  execute(sql: string): { columns: string[]; rows: SqlValue[][] } {
    const statement = this.db.prepare(sql)
    try {
      const columns = statement.getColumnNames()
      const rows: SqlValue[][] = []
      while (statement.step()) {
        rows.push(statement.get().map(toSqlValue))
      }
      return { columns, rows }
    } finally {
      statement.free()
    }
  }

  /** 여러 구문을 실행하고 마지막 결과를 돌려준다. 실패하면 예외를 던진다. */
  executeScript(script: string): { columns: string[]; rows: SqlValue[][] } {
    let last: { columns: string[]; rows: SqlValue[][] } = { columns: [], rows: [] }
    for (const original of splitSqlStatements(script)) {
      for (const sql of translateStatement(original)) {
        last = this.execute(sql)
      }
    }
    return last
  }

  /** `action` 의 변경사항을 남기지 않고 실행한다 */
  isolated<T>(action: () => T, options: { foreignKeys?: boolean } = {}): T {
    // PRAGMA foreign_keys 는 트랜잭션 밖에서만 바뀐다
    const foreignKeys = options.foreignKeys !== false
    if (!foreignKeys) this.db.run('PRAGMA foreign_keys = OFF')

    this.db.run('SAVEPOINT sql_check')
    try {
      return action()
    } finally {
      this.db.run('ROLLBACK TO sql_check')
      this.db.run('RELEASE sql_check')
      if (!foreignKeys) this.db.run('PRAGMA foreign_keys = ON')
    }
  }

  close(): void {
    this.db.close()
  }
}
