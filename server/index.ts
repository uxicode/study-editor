import express, { type Request, type Response } from 'express'
import cors from 'cors'
import {
  parsePrismaSchema,
  extractTableName,
  parseModelFields
} from './utils/prisma-schema-parser'
import {
  convertFieldToSQLColumn,
  generateCreateTableSQL
} from './utils/sql-generator'

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

    console.log('✅ SQL 변환 완료:', {
      tablesCount: tables.length,
      sqlLength: finalSQL.length
    })

    res.json({
      success: true,
      sql: finalSQL,
      tables,
      modelsCount: models.length,
      enumsCount: enums.length
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

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Express 서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`📡 API 엔드포인트: http://localhost:${PORT}/api/prisma-to-sql`)
})
