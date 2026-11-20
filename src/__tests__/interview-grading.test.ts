import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { CURRICULUM_STEPS } from '@/data/curriculum-steps'
import { useValidator } from '@/composables/use-validator'

/**
 * 면접 대응(week-10 ~ week-12) 채점 규칙 확인.
 * 정답 예시 통과 / 빈 템플릿 실패는 answer-baseline 이 확인하므로, 여기서는 경계 사례만 다룬다.
 */

const { validateStep } = useValidator()

function findStep(stepId: string) {
  const step = CURRICULUM_STEPS.find((s) => s.id === stepId)
  if (!step) throw new Error(`스텝을 찾을 수 없습니다: ${stepId}`)
  return step
}

async function grade(stepId: string, contents: Record<string, string>): Promise<string[]> {
  const step = findStep(stepId)
  const files = step.initialFiles.map((f) => ({
    name: f.name,
    path: f.path,
    content: contents[f.path] ?? f.content,
    readonly: f.readonly
  }))
  const result = await validateStep(step, files, { success: true, output: '', logs: ['Mock Runtime'] })
  return result.errors.map((e) => e.message)
}

function answerOf(stepId: string): string {
  const step = findStep(stepId)
  const snippet = step.hints[step.hints.length - 1]?.codeSnippet
  if (!snippet) throw new Error(`정답 예시가 없습니다: ${stepId}`)
  return snippet
}

describe('면접 대응 채점', () => {
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })
  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('제목 줄에 부연을 붙여도 섹션으로 인정한다', async () => {
    const answer = answerOf('week-12-1').replace('## 상황\n', '## 상황 (Situation)\n')
    expect(await grade('week-12-1', { 'answer.md': answer })).toEqual([])
  })

  it('행동을 "우리" 로만 쓰면 1인칭 항목에서 걸러진다', async () => {
    const answer = answerOf('week-12-1').replace(/제가|저는/g, '우리 팀이')
    expect(await grade('week-12-1', { 'answer.md': answer })).toEqual([
      '## 행동은 "우리" 가 아니라 "제가 / 저는" 처럼 내가 한 일로 적어야 합니다.'
    ])
  })

  it('물음표 없는 확인 질문은 질문 목록으로 인정하지 않는다', async () => {
    const answer = answerOf('week-11-1').replace(/\?/g, '.')
    expect(await grade('week-11-1', { 'plan.md': answer })).toEqual([
      '## 확인 질문 아래에 물음표(?)가 들어간 질문을 3개 이상 목록으로 적어야 합니다.'
    ])
  })

  it('안내 주석만 남긴 섹션은 비어 있는 것으로 본다', async () => {
    const answer = answerOf('week-11-4').replace(
      /## 결정\n[^\n]+\n/,
      '## 결정\n<!-- 무엇을, 왜 -->\n'
    )
    expect(await grade('week-11-4', { 'design.md': answer })).toEqual([
      '## 결정 아래에 고른 방식과 이유를 적어야 합니다.'
    ])
  })

  it('태그 없는 리뷰 코멘트는 코멘트 개수에 들어가지 않는다', async () => {
    const answer = answerOf('week-12-3').replace(/- \[(?:필수|제안|질문)\] /g, '- ')
    const errors = await grade('week-12-3', { 'review.md': answer })
    expect(errors).toContain('## 코멘트 아래에 [필수] / [제안] / [질문] 태그로 시작하는 코멘트를 3개 이상 적어야 합니다.')
    expect(errors).toContain('머지 전에 꼭 고쳐야 할 버그를 [필수] 코멘트로 1개 이상 남겨야 합니다.')
  })

  it('앞부분이 같은 다른 제목의 섹션으로 대신 통과하지 않는다', async () => {
    // "## 마일스톤" 목록을 지우고 "## 마일스톤 기준" 에만 목록을 둔다
    const answer = answerOf('week-11-5')
      .replace(/## 마일스톤\n[\s\S]*?(?=## 첫 주에)/, '## 마일스톤\n\n')
      .replace(/## 마일스톤 기준\n/, '## 마일스톤 기준\n- 결과물 1\n- 결과물 2\n- 결과물 3\n')
    expect(await grade('week-11-5', { 'plan.md': answer })).toContain(
      '## 마일스톤 아래에 결과물이 있는 마일스톤을 3개 이상 적어야 합니다.'
    )
  })

  it('AI 가 만든 슬러그 코드를 그대로 두면 한글 제목에서 걸러진다', async () => {
    const template = findStep('week-10-8').initialFiles[0].content
    const notes = template
      .replace('// 먼저 정한 검증 기준:', '// 먼저 정한 검증 기준: 영어 제목만 확인')
      .replace('// AI 코드에서 찾은 문제:', '// AI 코드에서 찾은 문제: 없음 확인함')
      .replace('// 머지 판단:', '// 머지 판단: 그대로 머지합니다')
    const errors = await grade('week-10-8', { 'index.ts': notes })
    expect(errors.some((message) => message.startsWith('한글 제목을 지우지 않음'))).toBe(true)
  })

  it('입력을 직접 수정하는 버그 코드를 실행해도 이후 정답 채점이 오염되지 않는다', async () => {
    const template = findStep('week-10-4').initialFiles[0].content
    await grade('week-10-4', { 'index.ts': template })
    expect(await grade('week-10-4', { 'index.ts': answerOf('week-10-4') })).toEqual([])
  })
})
