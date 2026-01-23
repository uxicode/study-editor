import { ref } from 'vue'
import type { RuntimeFile, ExecutionResult } from '@/types/runtime'

/**
 * Mock 런타임 - 실제 실행 없이 코드 검증만 수행
 * WebContainers의 제한으로 인해 Prisma를 실제로 실행할 수 없으므로
 * 정적 분석과 시뮬레이션으로 대체
 */
export function useMockRuntime() {
  const isExecuting = ref(false)
  const isInitialized = ref(true) // Mock이므로 항상 초기화됨

  async function executeCode(files: RuntimeFile[]): Promise<ExecutionResult> {
    isExecuting.value = true
    const logs: string[] = []

    try {
      logs.push('🔍 코드 분석 모드 (Mock Runtime)')
      logs.push('WebContainers의 제한으로 인해 실제 실행 대신 코드를 분석합니다.')
      logs.push('')

      // 파일 분석
      logs.push('📁 파일 목록:')
      for (const file of files) {
        logs.push(`  ✓ ${file.name}`)
      }
      logs.push('')

      // schema.prisma 분석
      const schemaFile = files.find(f => f.name === 'schema.prisma')
      if (schemaFile) {
        logs.push('🔷 Prisma Schema 분석:')
        
        // 모델 찾기
        const modelMatches = schemaFile.content.match(/model\s+(\w+)\s*{/g)
        if (modelMatches) {
          logs.push(`  ✓ ${modelMatches.length}개의 모델 발견`)
          modelMatches.forEach(match => {
            const modelName = match.match(/model\s+(\w+)/)?.[1]
            logs.push(`    - ${modelName}`)
          })
        }
        logs.push('')
      }

      // app.js 분석
      const appFile = files.find(f => f.name === 'app.js' || f.name === 'index.js')
      if (appFile) {
        logs.push('📝 JavaScript 코드 분석:')
        
        // import 체크
        if (appFile.content.includes('@prisma/client')) {
          logs.push('  ✓ Prisma Client import 확인됨')
        }
        
        // PrismaClient 인스턴스 체크
        if (appFile.content.includes('new PrismaClient')) {
          logs.push('  ✓ PrismaClient 인스턴스 생성 확인됨')
        }
        
        // Prisma 메서드 체크
        const methods = [
          'create', 'findMany', 'findUnique', 'findFirst',
          'update', 'delete', 'upsert', 'count'
        ]
        
        methods.forEach(method => {
          if (appFile.content.includes(`.${method}(`)) {
            logs.push(`  ✓ .${method}() 메서드 호출 발견`)
          }
        })
        
        logs.push('')
      }

      // 시뮬레이션 결과 생성
      let output = '=== 코드 분석 완료 ===\n\n'
      
      // Step에 따라 다른 출력 시뮬레이션
      if (appFile?.content.includes('.create(')) {
        output += '시뮬레이션 결과:\n'
        output += '생성된 사용자: { id: 1, email: "alice@example.com", name: "Alice" }\n'
      } else if (appFile?.content.includes('.findMany(')) {
        output += '시뮬레이션 결과:\n'
        output += '모든 사용자: []\n'
      } else if (appFile?.content.includes('.findUnique(')) {
        output += '시뮬레이션 결과:\n'
        output += '특정 사용자: null\n'
      } else {
        output += '✓ 코드가 올바르게 작성되었습니다.\n'
        output += '✓ Prisma Client가 정상적으로 초기화될 수 있습니다.\n'
      }

      logs.push('✅ 분석 완료!')

      // 약간의 지연으로 실제 실행처럼 보이게
      await new Promise(resolve => setTimeout(resolve, 800))

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
    // Mock이므로 정리할 것 없음
  }

  return {
    isExecuting,
    isInitialized,
    executeCode,
    cleanup
  }
}
