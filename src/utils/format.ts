/**
 * 날짜 포맷 유틸리티
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('ko-KR')
}

/**
 * 실행 시간 포맷
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * 파일 크기 포맷
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

/**
 * JSON 포맷팅 (pretty print)
 */
export function formatJSON(obj: unknown): string {
  return JSON.stringify(obj, null, 2)
}
