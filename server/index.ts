import express, { type Request, type Response } from 'express'
import cors from 'cors'
import {
  parsePrismaSchema,
  extractTableName,
  parseModelFields,
  extractModelName,
  extractTableNameFromSchema
} from './utils/prisma-schema-parser'
import {
  convertFieldToSQLColumn,
  generateCreateTableSQL
} from './utils/sql-generator'
import {
  extractObjectPatterns,
  convertJsObjectToJSON,
  extractModelFieldNames,
  filterValidFields,
  convertDateFields
} from './utils/prisma-output-parser'
import {
  generateInsertSQL,
  prepareInsertData
} from './utils/sql-data-inserter'
import { db } from './utils/in-memory-db'

const app = express()
const PORT = process.env.PORT || 3001

// CORS 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

// JSON 파싱 미들웨어
app.use(express.json({ limit: '10mb' }))

/**
 * Prisma 스키마를 SQL로 변환하는 API
 * POST /api/prisma-to-sql
 * Body: { schemaContent: string }
 */
app.post('/api/prisma-to-sql', async (req: Request, res: Response) => {
  try {
    const { schemaContent } = req.body

    if (!schemaContent || typeof schemaContent !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'schemaContent가 필요합니다.'
      })
    }

    console.log('📝 Prisma 스키마 → SQL 변환 요청 받음')

    // Prisma 스키마 파싱
    const { models, enums } = parsePrismaSchema(schemaContent)
    
    console.log(`📊 총 ${models.length}개 모델, ${enums.length}개 enum 발견`)

    if (models.length === 0) {
      return res.json({
        success: true,
        sql: '',
        tables: [],
        message: '모델이 없습니다. (설정 단계이거나 아직 모델을 정의하지 않았습니다)'
      })
    }

    const sqlStatements: string[] = []
    const tables: Array<{ name: string; sql: string }> = []

    // 각 모델을 SQL로 변환
    for (const model of models) {
      const tableName = extractTableName(model.fullMatch, model.name)
      
      // 필드 파싱
      const fields = parseModelFields(model.content)
      
      if (fields.length === 0) {
        console.warn(`⚠️ ${tableName}: 컬럼이 없어 테이블을 생성할 수 없습니다`)
        continue
      }

      // 필드를 SQL 컬럼으로 변환
      const columns = fields.map(field => convertFieldToSQLColumn(field, enums))

      // CREATE TABLE SQL 생성
      const createTableSQL = generateCreateTableSQL(tableName, columns)
      
      sqlStatements.push(createTableSQL)
      tables.push({
        name: tableName,
        sql: createTableSQL
      })
    }

    // 생성된 모든 SQL 문을 결합
    const finalSQL = sqlStatements.join(';\n\n') + (sqlStatements.length > 0 ? ';' : '')

    // SQL을 서버에서 실행
    for (const table of tables) {
      try {
        console.log(`🚀 테이블 생성 실행 시작: ${table.name}`)
        db.executeCreateTable(table.sql)
        console.log(`✅ 테이블 생성 완료: ${table.name}`)
      } catch (error) {
        console.error(`⚠️ 테이블 생성 실패 (${table.name}):`, error)
        // 에러가 발생해도 계속 진행
      }
    }

    console.log('✅ SQL 변환 및 실행 완료:', {
      tablesCount: tables.length,
      sqlLength: finalSQL.length
    })

    res.json({
      success: true,
      sql: finalSQL,
      tables,
      modelsCount: models.length,
      enumsCount: enums.length,
      executed: true
    })
  } catch (error) {
    console.error('❌ Prisma → SQL 변환 실패:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    })
  }
})

/**
 * Prisma 출력을 파싱하여 INSERT SQL로 변환하는 API
 * POST /api/prisma-output-to-sql
 * Body: { output: string, schemaContent: string }
 */
app.post('/api/prisma-output-to-sql', async (req: Request, res: Response) => {
  try {
    const { output, schemaContent } = req.body

    if (!output || typeof output !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'output가 필요합니다.'
      })
    }

    if (!schemaContent || typeof schemaContent !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'schemaContent가 필요합니다.'
      })
    }

    console.log('📝 Prisma 출력 → INSERT SQL 변환 요청 받음')

    // 모델 이름 추출
    const modelName = extractModelName(schemaContent)
    if (!modelName) {
      return res.json({
        success: true,
        insertStatements: [],
        message: '스키마에서 모델을 찾을 수 없습니다.'
      })
    }

    // 테이블 이름 추출 (모델명과 @@map 고려)
    const tableName = extractTableNameFromSchema(schemaContent, modelName)

    // 출력에서 객체 패턴 추출
    const objectPatterns = extractObjectPatterns(output)
    
    if (objectPatterns.length === 0) {
      return res.json({
        success: true,
        insertStatements: [],
        message: '출력에서 데이터 객체를 찾을 수 없습니다.'
      })
    }

    console.log(`📦 ${objectPatterns.length}개 객체 패턴 발견`)

    // 필드명 추출
    const fieldNames = extractModelFieldNames(schemaContent, modelName)

    // 각 객체를 파싱하여 INSERT SQL 생성
    const insertStatements: Array<{ sql: string; tableName: string }> = []

    for (const objStr of objectPatterns) {
      // JavaScript 객체를 JSON으로 변환
      const data = convertJsObjectToJSON(objStr)
      if (!data) {
        console.log('⚠️ 객체 파싱 실패 (무시):', objStr.substring(0, 100))
        continue
      }

      // 유효한 필드만 필터링
      const validData = filterValidFields(data, fieldNames)

      if (Object.keys(validData).length === 0) {
        console.log('⚠️ 유효한 필드가 없습니다:', Object.keys(data))
        continue
      }

      // 날짜 필드 변환
      const convertedData = convertDateFields(validData)

      // INSERT SQL 생성
      const { columns, values } = prepareInsertData(convertedData)
      const insertSQL = generateInsertSQL(tableName, columns, values)

      insertStatements.push({
        sql: insertSQL,
        tableName
      })
    }

    console.log('✅ INSERT SQL 변환 완료:', {
      statementsCount: insertStatements.length,
      tableName
    })

    // INSERT SQL을 서버에서 실행
    for (const { sql, tableName } of insertStatements) {
      try {
        console.log(`🚀 데이터 삽입 실행 시작: ${tableName}`)
        db.executeInsert(sql)
        console.log(`✅ 데이터 삽입 완료: ${tableName}`)
      } catch (error) {
        console.error(`⚠️ 데이터 삽입 실패 (${tableName}):`, error)
        // 에러가 발생해도 계속 진행
      }
    }

    res.json({
      success: true,
      insertStatements,
      objectsCount: objectPatterns.length,
      statementsCount: insertStatements.length,
      executed: true
    })
  } catch (error) {
    console.error('❌ Prisma 출력 → INSERT SQL 변환 실패:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    })
  }
})

/**
 * SQL 실행 API
 * POST /api/execute-sql
 * Body: { sql: string }
 */
app.post('/api/execute-sql', async (req: Request, res: Response) => {
  try {
    const { sql } = req.body

    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'sql이 필요합니다.'
      })
    }

    console.log('📝 SQL 실행 요청 받음:', sql.substring(0, 100))

    const sqlUpper = sql.trim().toUpperCase()

    if (sqlUpper.startsWith('CREATE TABLE')) {
      db.executeCreateTable(sql)
      return res.json({
        success: true,
        message: '테이블 생성 완료'
      })
    } else if (sqlUpper.startsWith('INSERT INTO')) {
      db.executeInsert(sql)
      return res.json({
        success: true,
        message: '데이터 삽입 완료'
      })
    } else if (sqlUpper.startsWith('SELECT')) {
      const rows = db.executeSelect(sql)
      return res.json({
        success: true,
        rows,
        rowCount: rows.length
      })
    } else if (sqlUpper.startsWith('DROP TABLE')) {
      // DROP TABLE은 현재 구현에서 무시 (리셋 시 전체 삭제)
      return res.json({
        success: true,
        message: '테이블 삭제 완료'
      })
    } else {
      return res.status(400).json({
        success: false,
        error: `지원하지 않는 SQL 구문입니다: ${sqlUpper.split(' ')[0]}`
      })
    }
  } catch (error) {
    console.error('❌ SQL 실행 실패:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    })
  }
})

/**
 * 데이터베이스 스냅샷 조회 API
 * GET /api/snapshot
 */
app.get('/api/snapshot', (req: Request, res: Response) => {
  try {
    const tables = db.getAllTables()

    const snapshot = {
      tables: tables.map(table => ({
        name: table.name,
        columns: table.columns.map(col => ({
          name: col.name,
          type: col.type,
          nullable: col.nullable,
          primaryKey: col.primaryKey
        })),
        rows: table.rows
      })),
      timestamp: Date.now()
    }

    res.json({
      success: true,
      snapshot
    })
  } catch (error) {
    console.error('❌ 스냅샷 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    })
  }
})

/**
 * 데이터베이스 리셋 API
 * POST /api/reset
 */
app.post('/api/reset', (req: Request, res: Response) => {
  try {
    db.reset()
    res.json({
      success: true,
      message: '데이터베이스 리셋 완료'
    })
  } catch (error) {
    console.error('❌ 데이터베이스 리셋 실패:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    })
  }
})

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Express 서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`📡 API 엔드포인트: http://localhost:${PORT}/api/prisma-to-sql`)
})
