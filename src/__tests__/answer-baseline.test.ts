import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import type { CurriculumStep } from '@/types/curriculum'
import type { RuntimeFile, ExecutionResult } from '@/types/runtime'
import { CURRICULUM_STEPS } from '@/data/curriculum-steps'
import { useValidator } from '@/composables/use-validator'
import {
  cleanCodeSnippet,
  splitCodeSnippetIntoFiles,
  detectCodeSnippetType
} from '@/utils/code-snippet-processor'
import { applyMultipleFiles, applySingleFile, findTargetFile } from '@/utils/file-applier'

/**
 * 기준선 테스트: 각 스텝의 "정답 적용" 결과가 해당 스텝의 검증을 통과해야 한다.
 * LearningEnvironment.vue 의 handleApplyAnswer 흐름(마지막 힌트 codeSnippet 적용)을 그대로 따른다.
 */

/**
 * 알려진 실패 (기준선).
 * 스텝을 고쳐서 통과하게 되면 `it.fails` 가 실패하므로, 이 목록에서 해당 id 를 제거한다.
 */

/** 아무것도 작성하지 않은 초기 템플릿이 검증을 통과해 버리는 스텝 (채점이 너무 느슨함). */
const KNOWN_TEMPLATE_PASSES = new Set<string>(['regex-3-2', 'regex-3-4'])

const MOCK_EXECUTION: ExecutionResult = {
  success: true,
  output: '',
  logs: ['🔍 코드 분석 모드 (Mock Runtime)']
}

function createEditorFiles(step: CurriculumStep): RuntimeFile[] {
  return step.initialFiles.map((f) => ({
    name: f.name,
    path: f.path,
    content: f.content,
    readonly: f.readonly
  }))
}

function applyAnswer(step: CurriculumStep, files: RuntimeFile[]): boolean {
  const lastHint = step.hints[step.hints.length - 1]
  const snippet = lastHint?.codeSnippet
  if (!snippet) return false

  const cleaned = cleanCodeSnippet(snippet)
  const multiple = splitCodeSnippetIntoFiles(cleaned, files.map((f) => f.path))

  if (multiple.length > 0) {
    return applyMultipleFiles(multiple, files, [], '').appliedFiles.length > 0
  }

  const type = detectCodeSnippetType(cleaned)
  if (!type) return false
  const target = findTargetFile(type.targetFile, files)
  if (!target) return false
  applySingleFile(target, cleaned, type.isPartialCode, [])
  return true
}

describe('스텝 정답 코드 기준선', () => {
  const { validateStep } = useValidator()
  const spies: Array<ReturnType<typeof vi.spyOn>> = []

  beforeAll(() => {
    spies.push(vi.spyOn(console, 'log').mockImplementation(() => undefined))
  })

  afterAll(() => {
    spies.forEach((s) => s.mockRestore())
  })

  it('스텝 id 는 중복되지 않는다', () => {
    const ids = CURRICULUM_STEPS.map((s) => s.id)
    expect(ids.length - new Set(ids).size).toBe(0)
  })

  describe.each(CURRICULUM_STEPS.map((s) => [s.id, s] as const))('%s', (_id, step) => {
    it('정답 코드가 존재하고 적용된다', () => {
      const files = createEditorFiles(step)
      expect(applyAnswer(step, files)).toBe(true)
    })

    it('정답 적용 후 검증을 통과한다', async () => {
      const files = createEditorFiles(step)
      applyAnswer(step, files)
      const result = await validateStep(step, files, MOCK_EXECUTION)
      expect(result.errors.map((e) => e.message)).toEqual([])
      expect(result.passed).toBe(true)
    })

    const templateTest = KNOWN_TEMPLATE_PASSES.has(step.id) ? it.fails : it
    templateTest('초기 템플릿(미작성)은 검증을 통과하지 않는다', async () => {
      const files = createEditorFiles(step)
      const result = await validateStep(step, files, MOCK_EXECUTION)
      expect(result.passed).toBe(false)
    })
  })
})
