import { ref } from 'vue'
import type { DBSnapshot, DBTable, DBColumn } from '@/types/runtime'

export function useDatabase() {
  const isInitialized = ref(false)
  const isLoading = ref(false)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  async function initializeDatabase(): Promise<void> {
    if (isInitialized.value) {
      return
    }

    try {
      console.log('🔄 데이터베이스 초기화 중...')
      isLoading.value = true

      // 서버 API를 통해 데이터베이스 리셋
      const response = await fetch(`${apiUrl}/api/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API 요청 실패: ${response.status}`)
      }

      isInitialized.value = true
      console.log('✅ 데이터베이스 초기화 완료')
    } catch (error) {
      console.error('❌ 데이터베이스 초기화 실패:', error)
      isInitialized.value = false
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function executeQuery(sql: string, params: unknown[] = []): Promise<unknown> {
    console.log('🔍 executeQuery 호출됨:', {
      sql: sql.substring(0, 100),
      paramsLength: params.length
    })

    try {
      const response = await fetch(`${apiUrl}/api/execute-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API 요청 실패: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'SQL 실행 실패')
      }

      console.log('✅ 쿼리 실행 완료:', {
        rowCount: result.rows?.length || 0,
        hasRows: !!result.rows
      })

      // SELECT 쿼리의 경우 rows 반환, 그 외는 빈 결과 반환
      return {
        rows: result.rows || [],
        rowCount: result.rowCount || 0
      }
    } catch (error) {
      console.error('❌ Query execution failed:', error)
      console.error('❌ SQL:', sql)
      console.error('❌ Params:', params)
      throw error
    }
  }

  async function getSnapshot(): Promise<DBSnapshot> {
    try {
      const response = await fetch(`${apiUrl}/api/snapshot`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API 요청 실패: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '스냅샷 조회 실패')
      }

      const snapshot = result.snapshot

      // 타입 변환
      const tables: DBTable[] = snapshot.tables.map((table: any) => ({
        name: table.name,
        columns: table.columns.map((col: any): DBColumn => ({
          name: col.name,
          type: col.type,
          nullable: col.nullable,
          primaryKey: col.primaryKey
        })),
        rows: table.rows || []
      }))

      return {
        tables,
        timestamp: snapshot.timestamp || Date.now()
      }
    } catch (error) {
      console.error('Failed to get database snapshot:', error)
      return {
        tables: [],
        timestamp: Date.now()
      }
    }
  }

  async function reset(): Promise<void> {
    try {
      console.log('🔄 데이터베이스 리셋 중...')
      const response = await fetch(`${apiUrl}/api/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API 요청 실패: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '데이터베이스 리셋 실패')
      }

      isInitialized.value = false
      console.log('✅ 데이터베이스 리셋 완료')
    } catch (error) {
      console.error('❌ 데이터베이스 리셋 실패:', error)
      throw error
    }
  }

  async function close(): Promise<void> {
    // 서버 기반이므로 close 작업 없음
    isInitialized.value = false
  }

  return {
    isInitialized,
    isLoading,
    initializeDatabase,
    executeQuery,
    getSnapshot,
    reset,
    close
  }
}
