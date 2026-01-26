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
    const targetFile = editorFiles.find(f => f.name === file.name)
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
  // 타겟 파일 찾기
  let targetFile = editorFiles.find(f => f.name === targetFileName)

  // 타겟 파일을 찾지 못했으면 readonly가 아닌 첫 번째 파일 사용
  if (!targetFile) {
    targetFile = editorFiles.find(f => !f.readonly)
  }

  return targetFile || null
}
