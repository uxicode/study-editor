/**
 * 통합 오류 처리 유틸리티
 */

export interface ErrorHandlerOptions {
  level: 'error' | 'warn' | 'log'
  message: string
  ignore?: boolean
  fallbackValue?: any
  onError?: (error: unknown) => void
}

/**
 * 통합 오류 처리 함수
 * 
 * @param error - 처리할 오류 객체
 * @param options - 오류 처리 옵션
 * @returns fallbackValue (ignore가 false인 경우)
 */
export function handleError(error: unknown, options: ErrorHandlerOptions): any {
  const { level, message, ignore = false, fallbackValue, onError } = options
  
  // 로그 레벨에 따른 출력
  const logMessage = `${message}: ${error instanceof Error ? error.message : String(error)}`
  
  switch (level) {
    case 'error':
      console.error(`❌ ${logMessage}`, error)
      break
    case 'warn':
      console.warn(`⚠️ ${logMessage}`, error)
      break
    case 'log':
      console.log(`ℹ️ ${logMessage}`, error)
      break
  }
  
  // 커스텀 에러 핸들러 실행
  if (onError) {
    onError(error)
  }
  
  // 무시하지 않는 경우에만 fallbackValue 반환
  return ignore ? undefined : fallbackValue
}
