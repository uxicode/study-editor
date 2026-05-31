import { ref } from 'vue'
import { resetDatabase, snapshotTables } from '@/lib/learning'
import type { DBSnapshot, DBTable } from '@/types/runtime'

/**
 * 학습용 인메모리 DB 컴포저블
 *
 * 모든 SQL/Prisma 시뮬은 프론트엔드의 `src/lib/learning` 안에서 처리되며
 * 외부 서버를 호출하지 않는다.
 */
export function useDatabase() {
  const isInitialized = ref(false)
  const isLoading = ref(false)

  async function initializeDatabase(): Promise<void> {
    if (isInitialized.value) return
    isLoading.value = true
    try {
      resetDatabase()
      isInitialized.value = true
    } finally {
      isLoading.value = false
    }
  }

  async function getSnapshot(): Promise<DBSnapshot> {
    const tables: DBTable[] = snapshotTables().map((table) => ({
      name: table.name,
      columns: table.columns.map((col) => ({
        name: col.name,
        type: col.type,
        nullable: col.nullable,
        primaryKey: col.primaryKey
      })),
      rows: table.rows ?? []
    }))

    return {
      tables,
      timestamp: Date.now()
    }
  }

  async function reset(): Promise<void> {
    resetDatabase()
    isInitialized.value = false
  }

  async function close(): Promise<void> {
    isInitialized.value = false
  }

  return {
    isInitialized,
    isLoading,
    initializeDatabase,
    getSnapshot,
    reset,
    close
  }
}
