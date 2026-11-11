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
 *
 * 파일 구분자는 `// @file: 경로`, `// schema.prisma` 같은 고정 이름, 그리고
 * `editorFilePaths` 에 있는 파일의 `// 경로` 헤더 줄(뒤에 ` — 설명`이 붙어도 된다)을 인식한다.
 */
export function splitCodeSnippetIntoFiles(codeSnippet: string, editorFilePaths: string[] = []): CodeFile[] {
  const markers = findFileMarkers(codeSnippet, editorFilePaths)

  if (markers.length <= 1) {
    return []
  }

  const files: CodeFile[] = []

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i]
    const startIndex = marker.index + marker.length
    const endIndex = i < markers.length - 1 ? markers[i + 1].index : codeSnippet.length

    const content = codeSnippet.substring(startIndex, endIndex).trim()

    if (content) {
      files.push({
        name: normalizeFileName(marker.fileName),
        content
      })
    }
  }

  return files
}

interface FileMarker {
  fileName: string
  index: number
  length: number
}

function findFileMarkers(codeSnippet: string, editorFilePaths: string[]): FileMarker[] {
  const knownFiles = new Set(editorFilePaths.flatMap((path) => [path, path.split('/').pop() ?? path]))

  const filePattern = /\/\/\s*(?:@file:\s*([\w./\-[\]]+)|(schema\.prisma|app\.js|\.env))[ \t]*\n/gi
  const headerPattern = /^[ \t]*\/\/[ \t]*([\w./\-[\]]+\.[A-Za-z]+)(?:[ \t]+[—–-].*)?[ \t]*\n/gm

  const markers: FileMarker[] = [...codeSnippet.matchAll(filePattern)].map((match) => ({
    fileName: match[1] ?? match[2],
    index: match.index!,
    length: match[0].length
  }))

  for (const match of codeSnippet.matchAll(headerPattern)) {
    const fileName = match[1]
    // 같은 위치를 이미 위 패턴이 잡았다면 건너뛴다 (줄 앞 공백 때문에 index 가 다를 수 있어 줄 범위로 비교)
    const overlaps = markers.some((marker) => marker.index >= match.index! && marker.index < match.index! + match[0].length)
    if (!overlaps && knownFiles.has(fileName)) {
      markers.push({ fileName, index: match.index!, length: match[0].length })
    }
  }

  return markers.sort((a, b) => a.index - b.index)
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
export function detectCodeSnippetType(rawCodeSnippet: string): CodeSnippetType | null {
  // 첫 줄이 `// server.ts` 처럼 대상 파일명만 적힌 주석이면 그 파일을 대상으로 한다
  const headerMatch = rawCodeSnippet.match(/^\s*\/\/\s*([\w./\-[\]]+\.(?:ts|tsx|js|jsx|mjs|cjs|sql|prisma))\s*(?:\r?\n|$)/)
  if (headerMatch) {
    return {
      targetFile: headerMatch[1],
      isPartialCode: !rawCodeSnippet.includes('generator client') || !rawCodeSnippet.includes('datasource db')
    }
  }

  // `//` 주석 줄의 단어(예: "select 는 ...")가 종류 판별을 흐리지 않도록 제거하고 판별한다
  const codeSnippet = rawCodeSnippet.replace(/^[ \t]*\/\/.*$/gm, '')

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

  // SQL 코드인지 확인 (CREATE TABLE, ALTER TABLE 등)
  if (codeSnippet.includes('CREATE TABLE') || 
      codeSnippet.includes('ALTER TABLE') || 
      codeSnippet.includes('CREATE INDEX') ||
      codeSnippet.includes('CREATE UNIQUE INDEX') ||
      codeSnippet.toLowerCase().includes('select ') ||
      codeSnippet.toLowerCase().includes('insert into') ||
      codeSnippet.trim().startsWith('--')) {
    return {
      targetFile: 'schema.sql',
      isPartialCode: false
    }
  }

  // JavaScript/Node/TypeScript/React 코드인지 확인
  if (codeSnippet.includes('prisma.') || 
      codeSnippet.includes('PrismaClient') ||
      codeSnippet.includes('import') ||
      codeSnippet.includes('export') ||
      codeSnippet.includes('async function') ||
      codeSnippet.includes('const ') ||
      codeSnippet.includes('function') ||
      codeSnippet.includes('useState') ||
      codeSnippet.includes('create(') ||
      codeSnippet.includes('jwt.')) {
    const isPartialCode = !(codeSnippet.includes('import') && codeSnippet.includes('async function'))
    return {
      targetFile: 'app.js',
      isPartialCode
    }
  }

  // 기본 fallback
  return {
    targetFile: 'app.js',
    isPartialCode: false
  }
}
