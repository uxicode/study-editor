/**
 * 인메모리 데이터베이스 구현
 * 간단한 SQL 실행 및 데이터 저장을 위한 메모리 기반 데이터베이스
 */

interface Table {
  name: string
  columns: Array<{ name: string; type: string; nullable: boolean; primaryKey: boolean }>
  rows: Array<Record<string, unknown>>
}

class InMemoryDatabase {
  private tables: Map<string, Table> = new Map()

  /**
   * CREATE TABLE 실행
   */
  executeCreateTable(sql: string): void {
    // CREATE TABLE "TableName" ( ... ) 형식 파싱
    const createMatch = sql.match(/CREATE\s+TABLE\s+"?(\w+)"?\s*\(([^)]+)\)/is)
    if (!createMatch) {
      throw new Error(`CREATE TABLE 구문을 파싱할 수 없습니다: ${sql.substring(0, 100)}`)
    }

    const tableName = createMatch[1]
    const columnsDef = createMatch[2]

    // 컬럼 정의 파싱
    const columns = this.parseColumns(columnsDef)

    // 테이블 생성 (이미 있으면 덮어쓰기)
    this.tables.set(tableName, {
      name: tableName,
      columns,
      rows: []
    })

    console.log(`✅ 테이블 생성 완료: ${tableName} (${columns.length}개 컬럼)`)
  }

  /**
   * INSERT 실행
   */
  executeInsert(sql: string): void {
    // INSERT INTO "TableName" (col1, col2) VALUES (val1, val2) 형식 파싱
    const insertMatch = sql.match(/INSERT\s+INTO\s+"?(\w+)"?\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/is)
    if (!insertMatch) {
      throw new Error(`INSERT 구문을 파싱할 수 없습니다: ${sql.substring(0, 100)}`)
    }

    const tableName = insertMatch[1]
    const columnsStr = insertMatch[2]
    const valuesStr = insertMatch[3]

    const table = this.tables.get(tableName)
    if (!table) {
      throw new Error(`테이블을 찾을 수 없습니다: ${tableName}`)
    }

    // 컬럼명 파싱
    const columns = columnsStr.split(',').map(c => c.trim().replace(/"/g, ''))

    // 값 파싱
    const values = this.parseValues(valuesStr)

    if (columns.length !== values.length) {
      throw new Error(`컬럼 수(${columns.length})와 값 수(${values.length})가 일치하지 않습니다`)
    }

    // 행 생성
    const row: Record<string, unknown> = {}
    columns.forEach((col, index) => {
      row[col] = values[index]
    })

    // 데이터 삽입
    table.rows.push(row)
    console.log(`✅ 데이터 삽입 완료: ${tableName}`, row)
  }

  /**
   * SELECT 실행
   */
  executeSelect(sql: string): Array<Record<string, unknown>> {
    // SELECT * FROM "TableName" 형식 파싱
    const selectMatch = sql.match(/SELECT\s+\*\s+FROM\s+"?(\w+)"?/i)
    if (!selectMatch) {
      throw new Error(`SELECT 구문을 파싱할 수 없습니다: ${sql.substring(0, 100)}`)
    }

    const tableName = selectMatch[1]
    const table = this.tables.get(tableName)

    if (!table) {
      return []
    }

    return [...table.rows]
  }

  /**
   * 모든 테이블 목록 조회
   */
  getAllTables(): Table[] {
    return Array.from(this.tables.values())
  }

  /**
   * 테이블 정보 조회
   */
  getTable(tableName: string): Table | undefined {
    return this.tables.get(tableName)
  }

  /**
   * 모든 테이블 삭제
   */
  reset(): void {
    this.tables.clear()
    console.log('✅ 데이터베이스 리셋 완료')
  }

  /**
   * 컬럼 정의 파싱
   */
  private parseColumns(columnsDef: string): Array<{ name: string; type: string; nullable: boolean; primaryKey: boolean }> {
    const columns: Array<{ name: string; type: string; nullable: boolean; primaryKey: boolean }> = []
    const lines = columnsDef.split(',').map(l => l.trim())

    for (const line of lines) {
      if (!line) continue

      const parts = line.trim().split(/\s+/)
      if (parts.length < 2) continue

      const name = parts[0].replace(/"/g, '')
      const type = parts[1].toUpperCase()
      const nullable = !line.includes('NOT NULL')
      const primaryKey = line.includes('PRIMARY KEY') || line.includes('@id')

      columns.push({ name, type, nullable, primaryKey })
    }

    return columns
  }

  /**
   * VALUES 절 파싱
   */
  private parseValues(valuesStr: string): unknown[] {
    const values: unknown[] = []
    const parts = valuesStr.split(',').map(p => p.trim())

    for (const part of parts) {
      if (part === 'NULL') {
        values.push(null)
      } else if (part.startsWith("'") && part.endsWith("'")) {
        // 문자열 값
        values.push(part.slice(1, -1).replace(/''/g, "'"))
      } else if (/^\d+$/.test(part)) {
        // 정수
        values.push(parseInt(part, 10))
      } else if (/^\d+\.\d+$/.test(part)) {
        // 실수
        values.push(parseFloat(part))
      } else if (part === 'true' || part === 'false') {
        // 불린
        values.push(part === 'true')
      } else {
        // 기본값: 문자열로 처리
        values.push(part)
      }
    }

    return values
  }
}

// 싱글톤 인스턴스
export const db = new InMemoryDatabase()
