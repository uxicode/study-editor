/**
 * 학습용 인메모리 데이터베이스 (MySQL dialect 시뮬레이션)
 *
 * 실제 데이터베이스가 아닌, Prisma 스키마와 출력으로부터 생성된 SQL을 받아
 * 테이블/행을 메모리에 저장하여 "DB 탭" 표시용으로 사용한다.
 */

export interface InMemoryColumn {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
}

export interface InMemoryTable {
  name: string
  columns: InMemoryColumn[]
  rows: Array<Record<string, unknown>>
}

const IDENT = /[`"]?(\w+)[`"]?/

class InMemoryDatabase {
  private tables = new Map<string, InMemoryTable>()

  executeCreateTable(sql: string): void {
    const createMatch = sql.match(/CREATE\s+TABLE\s+[`"]?(\w+)[`"]?\s*\(([\s\S]+)\)\s*;?\s*$/i)
    if (!createMatch) {
      throw new Error(`CREATE TABLE 구문을 파싱할 수 없습니다: ${sql.substring(0, 100)}`)
    }

    const tableName = createMatch[1]
    const columns = this.parseColumns(createMatch[2])

    this.tables.set(tableName, { name: tableName, columns, rows: [] })
  }

  executeInsert(sql: string): void {
    const insertMatch = sql.match(
      /INSERT\s+INTO\s+[`"]?(\w+)[`"]?\s*\(([^)]+)\)\s*VALUES\s*\(([\s\S]+)\)\s*;?\s*$/i
    )
    if (!insertMatch) {
      throw new Error(`INSERT 구문을 파싱할 수 없습니다: ${sql.substring(0, 100)}`)
    }

    const tableName = insertMatch[1]
    const columns = insertMatch[2]
      .split(',')
      .map((c) => c.trim().replace(/[`"]/g, ''))
    const values = this.parseValues(insertMatch[3])

    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`테이블을 찾을 수 없습니다: ${tableName}`)
    }
    if (columns.length !== values.length) {
      throw new Error(
        `컬럼 수(${columns.length})와 값 수(${values.length})가 일치하지 않습니다`
      )
    }

    const row: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      row[col] = values[i]
    })
    table.rows.push(row)
  }

  executeSelect(sql: string): Array<Record<string, unknown>> {
    const selectMatch = sql.match(/SELECT\s+\*\s+FROM\s+[`"]?(\w+)[`"]?/i)
    if (!selectMatch) {
      throw new Error(`SELECT 구문을 파싱할 수 없습니다: ${sql.substring(0, 100)}`)
    }
    const tableName = selectMatch[1]
    return [...(this.tables.get(tableName)?.rows ?? [])]
  }

  getAllTables(): InMemoryTable[] {
    return Array.from(this.tables.values())
  }

  reset(): void {
    this.tables.clear()
  }

  private parseColumns(columnsDef: string): InMemoryColumn[] {
    const columns: InMemoryColumn[] = []
    const lines = this.splitTopLevel(columnsDef).map((l) => l.trim())

    for (const line of lines) {
      if (!line) continue
      if (/^PRIMARY\s+KEY/i.test(line)) {
        const pkMatch = line.match(/PRIMARY\s+KEY\s*\(\s*[`"]?(\w+)[`"]?/i)
        if (pkMatch) {
          const col = columns.find((c) => c.name === pkMatch[1])
          if (col) col.primaryKey = true
        }
        continue
      }

      const parts = line.split(/\s+/)
      if (parts.length < 2) continue
      const nameMatch = parts[0].match(IDENT)
      if (!nameMatch) continue

      const name = nameMatch[1]
      const type = parts[1].toUpperCase()
      const upper = line.toUpperCase()
      const nullable = !upper.includes('NOT NULL')
      const primaryKey = upper.includes('PRIMARY KEY')

      columns.push({ name, type, nullable, primaryKey })
    }

    return columns
  }

  /** 괄호 안 콤마는 무시하고 최상위 콤마로만 split */
  private splitTopLevel(text: string): string[] {
    const out: string[] = []
    let depth = 0
    let cur = ''
    for (const ch of text) {
      if (ch === '(') depth++
      else if (ch === ')') depth--
      if (ch === ',' && depth === 0) {
        out.push(cur)
        cur = ''
        continue
      }
      cur += ch
    }
    if (cur.trim()) out.push(cur)
    return out
  }

  private parseValues(valuesStr: string): unknown[] {
    const values: unknown[] = []
    const parts = this.splitTopLevel(valuesStr).map((p) => p.trim())

    for (const part of parts) {
      if (part === 'NULL') values.push(null)
      else if (part.startsWith("'") && part.endsWith("'"))
        values.push(part.slice(1, -1).replace(/''/g, "'"))
      else if (/^-?\d+$/.test(part)) values.push(parseInt(part, 10))
      else if (/^-?\d+\.\d+$/.test(part)) values.push(parseFloat(part))
      else if (part === 'true' || part === 'false') values.push(part === 'true')
      else values.push(part)
    }
    return values
  }
}

export const db = new InMemoryDatabase()
