/**
 * 파일 관리 유틸리티
 */

import type { RuntimeFile } from '@/types/runtime'

/**
 * schema.sql 파일을 FileExplorer에 추가/업데이트
 */
export function updateSchemaSqlFile(
  files: RuntimeFile[],
  schemaSQL: string
): RuntimeFile[] {
  if (!schemaSQL || !schemaSQL.trim()) {
    return files
  }

  const schemaSqlFile = files.find(f => f.name === 'schema.sql')
  
  if (schemaSqlFile) {
    // 기존 파일 업데이트 - 반응성을 위해 새 배열로 생성
    return files.map(file =>
      file.name === 'schema.sql'
        ? { ...file, content: schemaSQL }
        : file
    )
  } else {
    // 새 파일 추가 - 반응성을 위해 새 배열로 생성
    return [
      ...files,
      {
        name: 'schema.sql',
        path: 'schema.sql',
        content: schemaSQL,
        readonly: true
      }
    ]
  }
}
