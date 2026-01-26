import { ref } from 'vue'
import type { DBSnapshot, DBTable, DBColumn } from '@/types/runtime'

// PGlite를 동적으로 import하여 브라우저 환경에서 Node.js 모듈 참조 문제 방지
let PGlite: any = null
let pgliteInstance: any = null

export function useDatabase() {
  const isInitialized = ref(false)
  const isLoading = ref(false)

  async function initializeDatabase(): Promise<any> {
    if (pgliteInstance) {
      // 이미 초기화된 인스턴스가 있으면 waitReady 확인
      if (pgliteInstance.waitReady) {
        await pgliteInstance.waitReady
      }
      return pgliteInstance
    }

    try {
      console.log('Initializing PGlite...')
      isLoading.value = true

      // PGlite를 동적으로 import (브라우저 환경에서 Node.js 모듈 참조 문제 방지)
      if (!PGlite) {
        console.log('📦 PGlite 모듈 동적 로딩 중...')
        try {
          const pgliteModule = await import('@electric-sql/pglite')
          PGlite = pgliteModule.PGlite
          console.log('✅ PGlite 모듈 로드 완료:', {
            hasPGlite: !!PGlite,
            isFunction: typeof PGlite === 'function'
          })
        } catch (importError) {
          console.error('❌ PGlite 모듈 로드 실패:', importError)
          throw new Error(`PGlite 모듈을 로드할 수 없습니다: ${importError instanceof Error ? importError.message : String(importError)}`)
        }
      }

      // 메모리 내 PostgreSQL 인스턴스 생성
      // 브라우저 환경에서는 인자 없이 호출하면 자동으로 메모리 모드 사용
      console.log('🔍 브라우저 환경에서 PGlite 생성 (메모리 모드)')
      try {
        pgliteInstance = new PGlite()
        console.log('✅ PGlite 인스턴스 생성 성공')
      } catch (createError) {
        console.error('❌ PGlite 인스턴스 생성 실패:', createError)
        throw new Error(`PGlite 인스턴스를 생성할 수 없습니다: ${createError instanceof Error ? createError.message : String(createError)}`)
      }
      
      console.log('✅ PGlite 인스턴스 생성 완료:', {
        hasInstance: !!pgliteInstance,
        hasWaitReady: !!pgliteInstance.waitReady,
        instanceType: typeof pgliteInstance,
        instanceConstructor: pgliteInstance.constructor.name
      })
      
      // waitReady 대기 (초기화 완료까지)
      if (pgliteInstance.waitReady) {
        console.log('⏳ PGlite waitReady 대기 중...')
        try {
          await pgliteInstance.waitReady
          console.log('✅ PGlite waitReady 완료')
        } catch (waitError) {
          console.error('❌ waitReady 실패:', waitError)
          throw new Error(`PGlite 초기화 실패: ${waitError instanceof Error ? waitError.message : String(waitError)}`)
        }
      } else {
        console.warn('⚠️ waitReady가 없습니다. 바로 진행합니다.')
      }
      
      isInitialized.value = true
      console.log('✅ PGlite initialized successfully')
      
      return pgliteInstance
    } catch (error) {
      console.error('❌ Failed to initialize PGlite:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
      pgliteInstance = null
      isInitialized.value = false
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function executeQuery(sql: string, params: unknown[] = []): Promise<unknown> {
    console.log('🔍 executeQuery 호출됨:', {
      sql: sql.substring(0, 100),
      paramsLength: params.length,
      pgliteInstanceExists: !!pgliteInstance,
      pgliteInstanceType: pgliteInstance ? typeof pgliteInstance : 'null'
    })

    if (!pgliteInstance) {
      console.log('⚠️ pgliteInstance가 없습니다. 초기화 중...')
      await initializeDatabase()
      console.log('✅ 초기화 완료, pgliteInstance:', !!pgliteInstance)
    }

    if (!pgliteInstance) {
      throw new Error('PGlite 인스턴스를 초기화할 수 없습니다')
    }

    // waitReady 확인 (이미 initializeDatabase에서 대기했지만 안전을 위해)
    if (pgliteInstance.waitReady) {
      console.log('⏳ PGlite waitReady 대기 중...')
      await pgliteInstance.waitReady
      console.log('✅ PGlite waitReady 완료')
    }

    try {
      console.log('🚀 쿼리 실행 시작:', sql.substring(0, 200))
      console.log('🔍 pgliteInstance 상태:', {
        hasInstance: !!pgliteInstance,
        hasQuery: typeof pgliteInstance.query === 'function',
        instanceKeys: Object.keys(pgliteInstance).slice(0, 10)
      })
      
      const result = await pgliteInstance.query(sql, params)
      console.log('✅ 쿼리 실행 완료:', {
        rowCount: result.rows?.length || 0,
        hasRows: !!result.rows,
        resultType: typeof result
      })
      console.log('🔍 executeQuery result.rows:', result.rows)
      return result
    } catch (error) {
      console.error('❌ Query execution failed:', error)
      console.error('❌ SQL:', sql)
      console.error('❌ Params:', params)
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

        // console.log('🔍 tableName:', tableName)

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
