/**
 * 코드 스니펫 처리 유틸리티
 */

export interface CodeFile {
  name: string
  content: string
}

/**
 * 코드 스니펫에서 마커 제거 (❌, ✅ 등)
 */
export function cleanCodeSnippet(codeSnippet: string): string {
  let cleaned = codeSnippet

  // ❌ 잘못된 방법 부분 제거
  if (cleaned.includes('❌')) {
    const wrongMethodIndex = cleaned.indexOf('❌')
    if (wrongMethodIndex > 0) {
      const lines = cleaned.substring(0, wrongMethodIndex).split('\n')
      // 마지막 빈 줄과 주석 제거
      while (lines.length > 0 && (!lines[lines.length - 1].trim() || lines[lines.length - 1].startsWith('//'))) {
        lines.pop()
      }
      cleaned = lines.join('\n').trim()
    }
  }

  // ✅ 표시 제거
  cleaned = cleaned.replace(/\/\/ ✅.*\n/g, '')

  return cleaned
}

/**
 * 코드 스니펫에서 여러 파일 분리
 */
export function splitCodeSnippetIntoFiles(codeSnippet: string): CodeFile[] {
  const filePattern = /\/\/\s*(schema\.prisma|app\.js|\.env)\s*\n/gi
  const fileMatches = [...codeSnippet.matchAll(filePattern)]

  if (fileMatches.length <= 1) {
    return []
  }

  const files: CodeFile[] = []

  for (let i = 0; i < fileMatches.length; i++) {
    const match = fileMatches[i]
    const fileName = match[1]
    const startIndex = match.index! + match[0].length
    const endIndex = i < fileMatches.length - 1 
      ? fileMatches[i + 1].index! 
      : codeSnippet.length

    const content = codeSnippet.substring(startIndex, endIndex).trim()

    if (content) {
      files.push({
        name: normalizeFileName(fileName),
        content
      })
    }
  }

  return files
}

/**
 * 파일명 정규화
 */
function normalizeFileName(fileName: string): string {
  const normalizedMap: Record<string, string> = {
    'schema.prisma': 'schema.prisma',
    'app.js': 'app.js',
    '.env': '.env'
  }
  return normalizedMap[fileName] || fileName
}

/**
 * 코드 스니펫 타입 감지
 */
export interface CodeSnippetType {
  targetFile: string
  isPartialCode: boolean
}

/**
 * 코드 스니펫의 타입과 타겟 파일 결정
 */
export function detectCodeSnippetType(codeSnippet: string): CodeSnippetType | null {
  // Prisma 스키마 코드인지 확인
  if (codeSnippet.includes('model ') || 
      codeSnippet.includes('enum ') || 
      codeSnippet.includes('generator client') ||
      codeSnippet.includes('datasource db')) {
    const isPartialCode = !(codeSnippet.includes('generator client') && codeSnippet.includes('datasource db'))
    return {
      targetFile: 'schema.prisma',
      isPartialCode
    }
  }

  // JavaScript/Node 코드인지 확인
  if (codeSnippet.includes('prisma.') || 
      codeSnippet.includes('PrismaClient') ||
      codeSnippet.includes('import') ||
      codeSnippet.includes('async function')) {
    const isPartialCode = !(codeSnippet.includes('import') && codeSnippet.includes('async function'))
    return {
      targetFile: 'app.js',
      isPartialCode
    }
  }

  return null
}
