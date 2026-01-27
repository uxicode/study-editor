/**
 * SQL 데이터 삽입 유틸리티 (백엔드 전용)
 */

/**
 * INSERT SQL 생성
 */
export function generateInsertSQL(
  tableName: string,
  columns: string[],
  values: unknown[]
): string {
  const columnsStr = columns.map(c => `"${c}"`).join(', ')
  const valuesStr = values.map(v => {
    if (v === null || v === undefined) {
      return 'NULL'
    }
    if (typeof v === 'string') {
      return `'${v.replace(/'/g, "''")}'` // SQL 인젝션 방지: 작은따옴표 이스케이프
    }
    if (typeof v === 'number' || typeof v === 'boolean') {
      return String(v)
    }
    return `'${String(v).replace(/'/g, "''")}'`
  }).join(', ')

  return `INSERT INTO "${tableName}" (${columnsStr}) VALUES (${valuesStr})`
}

/**
 * 데이터 객체를 INSERT SQL용 컬럼과 값으로 변환
 */
export function prepareInsertData(
  data: Record<string, unknown>
): { columns: string[]; values: unknown[] } {
  const columns = Object.keys(data)
  const values = columns.map(key => data[key])
  
  return { columns, values }
}
