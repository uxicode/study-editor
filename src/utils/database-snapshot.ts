/**
 * 데이터베이스 스냅샷 유틸리티
 */

import type { DBSnapshot } from '@/types/runtime'

/**
 * 스냅샷 객체 생성
 */
export function createSnapshot(
  tables: DBSnapshot['tables'],
  schemaSQL: string
): DBSnapshot {
  return {
    tables: tables || [],
    timestamp: Date.now(),
    schemaSQL: schemaSQL || ''
  }
}

/**
 * 스냅샷 로깅
 */
export function logSnapshotInfo(snapshot: DBSnapshot): void {
  console.log('✅ 데이터베이스 스냅샷 업데이트 완료:', snapshot.tables.length, '개 테이블')
  console.log('✅ UI 업데이트 완료 - 데이터베이스 탭에서 확인하세요!')
  
  if (snapshot.tables.length > 0) {
    snapshot.tables.forEach(table => {
      console.log(`  - ${table.name}: ${table.rows.length} rows, ${table.columns.length} columns`)
    })
  } else if (snapshot.schemaSQL) {
    console.log('ℹ️ 테이블은 없지만 SQL 스키마가 생성되었습니다. 데이터베이스 탭에서 확인하세요!')
  } else {
    console.log('ℹ️ 테이블이 없습니다. (모델이 정의되지 않았거나 설정 단계입니다)')
  }
}
