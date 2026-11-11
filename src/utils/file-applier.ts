/**
 * 파일 적용 유틸리티
 */

import type { RuntimeFile } from '@/types/runtime'
import type { CodeFile } from './code-snippet-processor'
import { mergePrismaPartialCode } from './prisma-code-merger'

/**
 * 파일에 코드 적용 및 탭 활성화
 */
export interface ApplyFileResult {
  appliedFiles: string[]
  shouldUpdateSnapshot: boolean
}

/**
 * 여러 파일에 코드 적용
 */
export function applyMultipleFiles(
  files: CodeFile[],
  editorFiles: RuntimeFile[],
  openTabs: string[],
  activeFile: string
): ApplyFileResult & { activeFile: string } {
  const appliedFiles: string[] = []
  let shouldUpdateSnapshot = false
  let newActiveFile = activeFile

  for (const file of files) {
    const targetFile = editorFiles.find(f => f.path === file.name || f.name === file.name)
    if (targetFile && !targetFile.readonly) {
      targetFile.content = file.content

      // 해당 파일을 활성화 (탭 열기 및 활성화)
      if (!openTabs.includes(targetFile.name)) {
        openTabs.push(targetFile.name)
      }
      appliedFiles.push(targetFile.name)

      // schema.prisma 파일이 적용되었으면 스냅샷 업데이트 필요
      if (targetFile.name === 'schema.prisma') {
        shouldUpdateSnapshot = true
      }
    }
  }

  // 첫 번째 적용된 파일을 활성화
  if (appliedFiles.length > 0) {
    newActiveFile = appliedFiles[0]
  }

  return {
    appliedFiles,
    shouldUpdateSnapshot,
    activeFile: newActiveFile
  }
}

/**
 * 단일 파일에 코드 적용
 */
export function applySingleFile(
  targetFile: RuntimeFile,
  codeSnippet: string,
  isPartialCode: boolean,
  openTabs: string[]
): { shouldUpdateSnapshot: boolean } {
  if (isPartialCode && targetFile.name === 'schema.prisma') {
    // Prisma 스키마의 부분 코드인 경우 스마트 병합
    targetFile.content = mergePrismaPartialCode(targetFile.content, codeSnippet)
  } else {
    // 전체 파일 교체
    targetFile.content = codeSnippet
  }

  // 해당 파일을 활성화 (탭 열기 및 활성화)
  if (!openTabs.includes(targetFile.name)) {
    openTabs.push(targetFile.name)
  }

  return {
    shouldUpdateSnapshot: targetFile.name === 'schema.prisma'
  }
}

/**
 * 타겟 파일 찾기
 */
export function findTargetFile(
  targetFileName: string,
  editorFiles: RuntimeFile[]
): RuntimeFile | null {
  const editableFiles = editorFiles.filter(f => !f.readonly)

  // 1. 이름이 일치하는 편집 가능 파일 (읽기 전용 파일은 덮어쓰지 않는다)
  const exactMatch = editableFiles.find(f => f.name === targetFileName)
  if (exactMatch) return exactMatch

  // 2. 같은 종류(SQL / Prisma / 스크립트)의 편집 가능 파일
  const targetKind = getFileKind(targetFileName)
  if (targetKind) {
    const sameKind = editableFiles.find(f => getFileKind(f.name) === targetKind)
    if (sameKind) return sameKind
  }

  // 3. 편집 가능한 첫 번째 파일
  return editableFiles[0] ?? null
}

type FileKind = 'sql' | 'prisma' | 'script'

function getFileKind(fileName: string): FileKind | null {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'sql':
      return 'sql'
    case 'prisma':
      return 'prisma'
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'mjs':
    case 'cjs':
      return 'script'
    default:
      return null
  }
}
