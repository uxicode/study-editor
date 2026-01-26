/**
 * SQL 데이터 삽입 유틸리티
 */

/**
 * INSERT SQL 생성
 */
export function generateInsertSQL(
  tableName: string,
  columns: string[],
  values: unknown[]
): string {
  const columnList = columns.map(c => `"${c}"`).join(', ')
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')

  return `
    INSERT INTO "${tableName}" (${columnList})
    VALUES (${placeholders})
    ON CONFLICT DO NOTHING
  `.trim()
}

/**
 * 데이터를 INSERT SQL로 변환
 */
export function prepareInsertData(
  data: Record<string, unknown>
): { columns: string[]; values: unknown[] } {
  const columns = Object.keys(data)
  const values = columns.map(col => data[col])
  
  return { columns, values }
}
