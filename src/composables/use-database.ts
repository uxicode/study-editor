import { ref } from 'vue'
import { PGlite } from '@electric-sql/pglite'
import type { DBSnapshot, DBTable, DBColumn } from '@/types/runtime'

let pgliteInstance: PGlite | null = null

export function useDatabase() {
  const isInitialized = ref(false)
  const isLoading = ref(false)

  async function initializeDatabase(): Promise<PGlite> {
    if (pgliteInstance) return pgliteInstance

    try {
      console.log('Initializing PGlite...')
      isLoading.value = true

      // 메모리 내 PostgreSQL 인스턴스 생성
      pgliteInstance = new PGlite()
      
      isInitialized.value = true
      console.log('PGlite initialized successfully')
      
      return pgliteInstance
    } catch (error) {
      console.error('Failed to initialize PGlite:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function executeQuery(sql: string, params: unknown[] = []): Promise<unknown> {
    if (!pgliteInstance) {
      await initializeDatabase()
    }

    try {
      const result = await pgliteInstance!.query(sql, params)
      return result
    } catch (error) {
      console.error('Query execution failed:', error)
      throw error
    }
  }

  async function getSnapshot(): Promise<DBSnapshot> {
    if (!pgliteInstance) {
      return {
        tables: [],
        timestamp: Date.now()
      }
    }

    try {
      // 모든 테이블 목록 조회
      const tablesResult = await pgliteInstance.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `)

      const tables: DBTable[] = []

      for (const row of tablesResult.rows) {
        const tableName = (row as { tablename: string }).tablename

        // 테이블 컬럼 정보 조회
        const columnsResult = await pgliteInstance.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' 
            AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName])

        const columns: DBColumn[] = columnsResult.rows.map((col: any) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          primaryKey: col.column_default?.includes('nextval') || false
        }))

        // 테이블 데이터 조회
        const dataResult = await pgliteInstance.query(`SELECT * FROM "${tableName}"`)
        const rows = dataResult.rows as Record<string, unknown>[]

        tables.push({
          name: tableName,
          columns,
          rows
        })
      }

      return {
        tables,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Failed to get database snapshot:', error)
      return {
        tables: [],
        timestamp: Date.now()
      }
    }
  }

  async function reset() {
    if (!pgliteInstance) {
      console.log('⚠️ PGlite 인스턴스가 없습니다. 초기화를 건너뜁니다.')
      return
    }

    try {
      console.log('🔍 기존 테이블 조회 중...')
      // 모든 테이블 삭제
      const tablesResult = await pgliteInstance.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `)
      console.log('📋 테이블 조회 결과:', tablesResult)

      if (tablesResult && tablesResult.rows && tablesResult.rows.length > 0) {
        console.log(`🗑️ ${tablesResult.rows.length}개 테이블 삭제 중...`)
        for (const row of tablesResult.rows) {
          const tableName = (row as { tablename: string }).tablename
          console.log(`  🗑️ ${tableName} 삭제 중...`)
          await pgliteInstance.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`)
          console.log(`  ✓ ${tableName} 삭제 완료`)
        }
        console.log('✅ 데이터베이스 리셋 완료')
      } else {
        console.log('ℹ️ 삭제할 테이블이 없습니다. (정상)')
      }
    } catch (error) {
      console.error('❌ 데이터베이스 리셋 실패:', error)
      // 에러를 throw하지 않고 조용히 처리
      // 테이블이 없거나 스키마가 없을 때는 정상적인 상황일 수 있음
      console.log('⚠️ 에러를 무시하고 계속 진행합니다.')
    }
  }

  async function close() {
    if (pgliteInstance) {
      await pgliteInstance.close()
      pgliteInstance = null
      isInitialized.value = false
    }
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
