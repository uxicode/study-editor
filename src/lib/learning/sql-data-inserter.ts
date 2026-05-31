/**
 * MySQL INSERT SQL 생성 유틸리티 (학습용 시뮬레이션)
 */

export function generateInsertSQL(
  tableName: string,
  columns: string[],
  values: unknown[]
): string {
  const columnsStr = columns.map((c) => `\`${c}\``).join(', ')
  const valuesStr = values
    .map((v) => {
      if (v === null || v === undefined) return 'NULL'
      if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`
      if (typeof v === 'number' || typeof v === 'boolean') return String(v)
      return `'${String(v).replace(/'/g, "''")}'`
    })
    .join(', ')

  return `INSERT INTO \`${tableName}\` (${columnsStr}) VALUES (${valuesStr})`
}

export function prepareInsertData(
  data: Record<string, unknown>
): { columns: string[]; values: unknown[] } {
  const columns = Object.keys(data)
  const values = columns.map((key) => data[key])
  return { columns, values }
}
