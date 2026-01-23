import type { CurriculumStep } from '@/types/curriculum'
import type { RuntimeFile, ExecutionResult, ValidationResult, ValidationError } from '@/types/runtime'

export function useValidator() {
  async function validateStep(
    step: CurriculumStep,
    files: RuntimeFile[],
    executionResult: ExecutionResult
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const hints: string[] = []

    console.log('🔍 검증 시작:', step.title)
    console.log('정적 검사 항목:', step.validator.staticChecks.length)
    console.log('동적 검사 항목:', step.validator.dynamicChecks.length)

    // 정적 검증
    for (const check of step.validator.staticChecks) {
      const targetFile = files.find(f => f.path === check.target)
      if (!targetFile) {
        errors.push({
          type: 'static',
          message: `파일을 찾을 수 없습니다: ${check.target}`
        })
        console.log('❌ 파일 없음:', check.target)
        continue
      }

      const content = targetFile.content

      switch (check.type) {
        case 'includes':
          if (!content.includes(String(check.pattern))) {
            errors.push({
              type: 'static',
              message: check.message
            })
            console.log('❌ includes 실패:', check.pattern)
          } else {
            console.log('✓ includes 통과:', check.pattern)
          }
          break

        case 'regex':
          const regex = check.pattern instanceof RegExp 
            ? check.pattern 
            : new RegExp(check.pattern)
          if (!regex.test(content)) {
            errors.push({
              type: 'static',
              message: check.message
            })
            console.log('❌ regex 실패:', check.pattern)
          } else {
            console.log('✓ regex 통과:', check.pattern)
          }
          break

        case 'ast':
          // TODO: AST 기반 검증 구현
          console.log('⚠️ AST 검증은 아직 구현되지 않았습니다')
          break
      }
    }

    // 동적 검증 (Mock Runtime에서는 더 관대하게 처리)
    const isMockRuntime = executionResult.logs.some(log => 
      log.includes('코드 분석 모드') || log.includes('Mock Runtime')
    )

    if (executionResult.success && !isMockRuntime) {
      // 실제 런타임일 경우에만 동적 검증 수행
      console.log('동적 검증 수행 (실제 런타임)')
      for (const check of step.validator.dynamicChecks) {
        try {
          const passed = await check.test(executionResult)
          if (!passed) {
            errors.push({
              type: 'dynamic',
              message: check.message
            })
            console.log('❌ 동적 검증 실패')
          } else {
            console.log('✓ 동적 검증 통과')
          }
        } catch (error) {
          errors.push({
            type: 'dynamic',
            message: `검증 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`
          })
          console.log('❌ 동적 검증 에러:', error)
        }
      }
    } else if (isMockRuntime) {
      // Mock Runtime일 경우: 실행 성공 + 정적 검증 통과면 OK
      console.log('✓ Mock Runtime 모드: 정적 검증으로 판단')
    }

    // 힌트 생성
    if (errors.length > 0) {
      // 에러 개수에 따라 적절한 힌트 제공
      const errorCount = errors.length
      const availableHints = step.hints.filter(h => h.level <= Math.min(3, errorCount))
      hints.push(...availableHints.map(h => h.content))
    }

    const passed = errors.length === 0

    return {
      passed,
      errors,
      hints,
      nextStep: passed ? getNextStepId(step.id) : undefined
    }
  }

  function getNextStepId(currentStepId: string): string | undefined {
    // 단계 ID 파싱 (예: "step-1" -> "step-2")
    const match = currentStepId.match(/step-(\d+)/)
    if (match) {
      const nextNum = parseInt(match[1]) + 1
      return `step-${nextNum}`
    }
    return undefined
  }

  return {
    validateStep
  }
}
