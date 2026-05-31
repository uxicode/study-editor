import { ref } from 'vue'
import type { RuntimeFile, ExecutionResult } from '@/types/runtime'

/**
 * Mock 런타임 — 실제 서버를 띄우지 않고 코드 패턴을 분석하여 결과를 시뮬레이션한다.
 *
 * 지원 패턴:
 * - Prisma: schema.prisma, app.js / app.ts 의 PrismaClient 사용 패턴
 * - Fastify: server.ts / server.js 의 라우트 정의 / listen 호출
 * - MySQL DDL: *.sql 파일의 CREATE TABLE / 제약조건 / 인덱스 패턴
 */
export function useMockRuntime() {
  const isExecuting = ref(false)
  const isInitialized = ref(true)

  async function executeCode(files: RuntimeFile[]): Promise<ExecutionResult> {
    isExecuting.value = true
    const logs: string[] = []

    try {
      logs.push('🔍 코드 분석 모드 (Mock Runtime)')
      logs.push('실제 실행 대신 코드 패턴을 분석합니다.')
      logs.push('')

      logs.push('📁 파일 목록:')
      for (const file of files) {
        logs.push(`  ✓ ${file.name}`)
      }
      logs.push('')

      let output = '=== 코드 분석 완료 ===\n\n'

      const schemaFile = files.find((f) => f.name === 'schema.prisma')
      if (schemaFile) {
        logs.push('🔷 Prisma Schema 분석:')
        const modelMatches = schemaFile.content.match(/model\s+(\w+)\s*{/g)
        if (modelMatches) {
          logs.push(`  ✓ ${modelMatches.length}개의 모델 발견`)
          modelMatches.forEach((match) => {
            const modelName = match.match(/model\s+(\w+)/)?.[1]
            logs.push(`    - ${modelName}`)
          })
        }
        if (/provider\s*=\s*"mysql"/i.test(schemaFile.content)) {
          logs.push('  ✓ MySQL provider 확인됨')
        }
        const indexMatches = schemaFile.content.match(/@@index\(/g)
        if (indexMatches) {
          logs.push(`  ✓ @@index 선언 ${indexMatches.length}개`)
        }
        logs.push('')
      }

      const sqlFiles = files.filter((f) => f.name.endsWith('.sql'))
      for (const sqlFile of sqlFiles) {
        output += analyzeSqlCode(sqlFile, logs)
      }

      const appFile = files.find(
        (f) => f.name === 'app.js' || f.name === 'app.ts' || f.name === 'index.js'
      )
      if (appFile) {
        output += analyzePrismaCode(appFile, logs)
      }

      const serverFile = files.find(
        (f) => f.name === 'server.ts' || f.name === 'server.js'
      )
      if (serverFile) {
        output += analyzeFastifyCode(serverFile, logs)
      }

      if (!appFile && !serverFile && sqlFiles.length === 0) {
        output += '✓ 코드가 올바르게 작성되었습니다.\n'
      }

      logs.push('✅ 분석 완료!')

      await new Promise((resolve) => setTimeout(resolve, 600))

      return {
        success: true,
        output,
        error: undefined,
        logs
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logs.push(`  ✗ 에러: ${errorMessage}`)

      return {
        success: false,
        output: '',
        error: errorMessage,
        logs
      }
    } finally {
      isExecuting.value = false
    }
  }

  async function cleanup() {
    // Mock 이므로 정리할 것 없음
  }

  return {
    isExecuting,
    isInitialized,
    executeCode,
    cleanup
  }
}

function analyzePrismaCode(file: RuntimeFile, logs: string[]): string {
  logs.push(`📝 ${file.name} 분석 (Prisma):`)

  if (file.content.includes('@prisma/client')) {
    logs.push('  ✓ Prisma Client import 확인됨')
  }
  if (file.content.includes('new PrismaClient')) {
    logs.push('  ✓ PrismaClient 인스턴스 생성 확인됨')
  }
  if (file.content.includes('$transaction')) {
    logs.push('  ✓ $transaction 호출 발견 (트랜잭션)')
  }

  const methods = [
    'create',
    'createMany',
    'findMany',
    'findUnique',
    'findFirst',
    'update',
    'delete',
    'upsert',
    'count'
  ]
  methods.forEach((method) => {
    if (file.content.includes(`.${method}(`)) {
      logs.push(`  ✓ .${method}() 호출 발견`)
    }
  })

  logs.push('')

  if (file.content.includes('.create(')) {
    return '시뮬레이션 결과 (Prisma):\n생성된 사용자: { id: 1, email: "alice@example.com", name: "Alice" }\n'
  }
  if (file.content.includes('.findMany(')) {
    return '시뮬레이션 결과 (Prisma):\n모든 사용자: []\n'
  }
  if (file.content.includes('.findUnique(')) {
    return '시뮬레이션 결과 (Prisma):\n특정 사용자: null\n'
  }
  return '✓ Prisma Client가 정상적으로 초기화될 수 있습니다.\n'
}

function analyzeFastifyCode(file: RuntimeFile, logs: string[]): string {
  logs.push(`📝 ${file.name} 분석 (Fastify):`)

  if (file.content.includes("from 'fastify'") || file.content.includes('require("fastify")')) {
    logs.push('  ✓ fastify import 확인됨')
  }

  const routeMethods = ['get', 'post', 'put', 'delete', 'patch']
  const detectedRoutes: string[] = []
  routeMethods.forEach((method) => {
    const re = new RegExp(`\\.${method}\\(\\s*['"\`]([^'"\`]+)['"\`]`, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(file.content)) !== null) {
      detectedRoutes.push(`${method.toUpperCase()} ${m[1]}`)
    }
  })
  detectedRoutes.forEach((r) => logs.push(`  ✓ 라우트 등록: ${r}`))

  const hasListen = /\.listen\(/.test(file.content)
  if (hasListen) logs.push('  ✓ server.listen 호출 확인됨')

  if (/schema\s*:\s*\{/.test(file.content)) {
    logs.push('  ✓ 라우트 schema 검증 사용')
  }
  if (/\.register\(/.test(file.content)) {
    logs.push('  ✓ fastify.register 플러그인 등록')
  }
  if (/\.decorate\(/.test(file.content)) {
    logs.push('  ✓ fastify.decorate 사용')
  }
  if (file.content.includes('@prisma/client') || /from\s+['"][^'"]*service['"]/i.test(file.content)) {
    logs.push('  ✓ Fastify 라우트에서 데이터 레이어 사용')
  }
  logs.push('')

  let out = '시뮬레이션 결과 (Fastify):\n'
  if (detectedRoutes.length > 0) {
    out += `등록된 라우트: ${detectedRoutes.join(', ')}\n`
  }
  if (hasListen) {
    out += 'Fastify 서버가 시작될 준비가 되었습니다.\n'
  }
  return out
}

function analyzeSqlCode(file: RuntimeFile, logs: string[]): string {
  logs.push(`📝 ${file.name} 분석 (SQL):`)
  const sql = file.content

  const createTableRe = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?/gi
  const tables: string[] = []
  let m: RegExpExecArray | null
  while ((m = createTableRe.exec(sql)) !== null) {
    tables.push(m[1])
  }
  if (tables.length > 0) {
    logs.push(`  ✓ 생성 테이블 ${tables.length}개: ${tables.join(', ')}`)
  }

  const fkCount = (sql.match(/FOREIGN\s+KEY/gi) || []).length
  const pkCount = (sql.match(/PRIMARY\s+KEY/gi) || []).length
  const uniqueCount = (sql.match(/\bUNIQUE\b/gi) || []).length
  const notNullCount = (sql.match(/NOT\s+NULL/gi) || []).length
  const autoIncCount = (sql.match(/AUTO_INCREMENT/gi) || []).length
  const indexCount = (sql.match(/\bCREATE\s+(?:UNIQUE\s+)?INDEX\b/gi) || []).length
  const checkCount = (sql.match(/\bCHECK\s*\(/gi) || []).length
  const defaultCount = (sql.match(/\bDEFAULT\b/gi) || []).length
  const onDeleteCount = (sql.match(/ON\s+DELETE/gi) || []).length
  const explainCount = (sql.match(/\bEXPLAIN\b/gi) || []).length

  if (pkCount) logs.push(`  ✓ PRIMARY KEY ${pkCount}`)
  if (autoIncCount) logs.push(`  ✓ AUTO_INCREMENT ${autoIncCount}`)
  if (notNullCount) logs.push(`  ✓ NOT NULL 제약 ${notNullCount}`)
  if (uniqueCount) logs.push(`  ✓ UNIQUE 제약 ${uniqueCount}`)
  if (defaultCount) logs.push(`  ✓ DEFAULT 사용 ${defaultCount}`)
  if (checkCount) logs.push(`  ✓ CHECK 제약 ${checkCount}`)
  if (fkCount) logs.push(`  ✓ FOREIGN KEY ${fkCount}`)
  if (onDeleteCount) logs.push(`  ✓ ON DELETE 동작 ${onDeleteCount}`)
  if (indexCount) logs.push(`  ✓ CREATE INDEX ${indexCount}`)
  if (explainCount) logs.push(`  ✓ EXPLAIN 사용`)

  const dmlOps = ['INSERT', 'SELECT', 'UPDATE', 'DELETE']
  const dmlSummary = dmlOps
    .map((op) => {
      const c = (sql.match(new RegExp(`\\b${op}\\b`, 'gi')) || []).length
      return c > 0 ? `${op} ${c}` : null
    })
    .filter(Boolean) as string[]
  if (dmlSummary.length > 0) {
    logs.push(`  ✓ DML: ${dmlSummary.join(', ')}`)
  }

  logs.push('')

  let out = '시뮬레이션 결과 (SQL):\n'
  if (tables.length > 0) {
    out += `생성된 테이블: ${tables.join(', ')}\n`
  }
  const flagSummary: string[] = []
  if (pkCount) flagSummary.push(`PK ${pkCount}`)
  if (fkCount) flagSummary.push(`FK ${fkCount}`)
  if (uniqueCount) flagSummary.push(`UNIQUE ${uniqueCount}`)
  if (indexCount) flagSummary.push(`INDEX ${indexCount}`)
  if (flagSummary.length > 0) {
    out += `제약/인덱스: ${flagSummary.join(', ')}\n`
  }
  if (explainCount > 0) {
    out += `EXPLAIN 분석: ${explainCount}개\n`
  }
  return out
}
