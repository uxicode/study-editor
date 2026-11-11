import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { CURRICULUM_STEPS } from '@/data/curriculum-steps'
import { useValidator } from '@/composables/use-validator'
import { splitCodeSnippetIntoFiles } from '@/utils/code-snippet-processor'
import { runFunctionTests } from '@/utils/function-test-runner'

const { validateStep } = useValidator()

async function errorsFor(stepId: string, contents: Record<string, string>): Promise<string[]> {
  const step = CURRICULUM_STEPS.find((s) => s.id === stepId)
  if (!step) throw new Error(`스텝을 찾을 수 없습니다: ${stepId}`)
  const files = step.initialFiles.map((f) => ({
    name: f.name,
    path: f.path,
    content: contents[f.path] ?? f.content,
    readonly: f.readonly
  }))
  const result = await validateStep(step, files, { success: true, output: '', logs: ['Mock Runtime'] })
  return result.errors.map((e) => e.message)
}

describe('여러 파일 정답 분리', () => {
  const paths = ['prisma/schema.prisma', 'src/users/user.service.ts', 'server.ts']

  it('스텝의 실제 파일과 일치하는 `// 경로` 헤더로 나눈다', () => {
    const files = splitCodeSnippetIntoFiles('// server.ts\nconst a = 1\n\n// src/users/user.service.ts\nconst b = 2\n', paths)
    expect(files).toEqual([
      { name: 'server.ts', content: 'const a = 1' },
      { name: 'src/users/user.service.ts', content: 'const b = 2' }
    ])
  })

  it('헤더 뒤의 ` — 설명` 은 무시한다', () => {
    const files = splitCodeSnippetIntoFiles('// server.ts — 라우트 추가\nA\n// prisma/schema.prisma\nB\n', paths)
    expect(files.map((f) => f.name)).toEqual(['server.ts', 'prisma/schema.prisma'])
  })

  it('스텝에 없는 파일명 주석은 구분자로 취급하지 않는다', () => {
    const files = splitCodeSnippetIntoFiles('// server.ts\nA\n// helper.ts\nB\n', paths)
    expect(files).toEqual([])
  })

  it('헤더를 모르는 호출(기존 방식)은 이전과 동일하게 동작한다', () => {
    expect(splitCodeSnippetIntoFiles('// server.ts\nA\n// src/users/user.service.ts\nB\n')).toEqual([])
    expect(splitCodeSnippetIntoFiles('// @file: a.ts\nA\n// @file: b.ts\nB\n').map((f) => f.name)).toEqual(['a.ts', 'b.ts'])
  })
})

describe('검증 패턴 보정', () => {
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })
  afterAll(() => {
    vi.restoreAllMocks()
  })

  const themeStore = (toggle: string) => `import { create } from 'zustand';
interface ThemeState { isDarkMode: boolean; toggleTheme: () => void }
export const useThemeStore = create<ThemeState>()((set) => ({
  isDarkMode: false,
  toggleTheme: () => ${toggle},
}));`

  it('week-8-1: 객체를 반환하는 올바른 토글을 통과시킨다', async () => {
    expect(await errorsFor('week-8-1', { 'stores/themeStore.ts': themeStore('set((state) => ({ isDarkMode: !state.isDarkMode }))') })).toEqual([])
  })

  it('week-8-1: 객체가 아닌 블록 문장(`=> { isDarkMode: ... }`)이라 동작하지 않는 토글은 거부한다', async () => {
    const errors = await errorsFor('week-8-1', { 'stores/themeStore.ts': themeStore('set((state) => { isDarkMode: !state.isDarkMode })') })
    expect(errors).toEqual(['set 함수를 호출하여 현재 isDarkMode의 상태를 반전시켜야 합니다.'])
  })

  it('week-8-3: 제네릭을 쓴 useQuery<T>({ ... }) 도 통과시킨다', async () => {
    const errors = await errorsFor('week-8-3', {
      'hooks/useUsers.ts': `import { useQuery } from '@tanstack/react-query';
export function useFetchUsers() {
  return useQuery<{ id: string }[]>({ queryKey: ['users'], queryFn: () => fetch('/api/users').then((r) => r.json()) });
}`
    })
    expect(errors).toEqual([])
  })

  it('week-7-final: useState<User[]>(initialUsers) 제네릭 표기를 통과시킨다', async () => {
    const step = CURRICULUM_STEPS.find((s) => s.id === 'week-7-final')
    const answer = step?.hints[step.hints.length - 1].codeSnippet ?? ''
    expect(answer).toContain('useState<User[]>(initialUsers)')
    expect(await errorsFor('week-7-final', { 'components/Dashboard.tsx': answer })).toEqual([])
  })
})

describe('week-5 정답 코드는 실제로 올바르게 동작한다', () => {
  function answerOf(stepId: string) {
    const step = CURRICULUM_STEPS.find((s) => s.id === stepId)
    const content = step?.hints[step.hints.length - 1].codeSnippet ?? ''
    return [{ name: 'index.ts', path: 'index.ts', content }]
  }

  it('week-5-3: 활성 사용자 평균 나이', () => {
    const results = runFunctionTests(answerOf('week-5-3'), [
      {
        target: 'index.ts',
        functionName: 'calculateAverageAgeOfActiveUsers',
        cases: [
          { description: '활성 사용자만 평균', args: [[{ name: 'a', age: 20, isActive: true }, { name: 'b', age: 40, isActive: true }, { name: 'c', age: 90, isActive: false }]], expected: 30 },
          { description: '활성 사용자 없음', args: [[{ name: 'a', age: 20, isActive: false }]], expected: 0 }
        ]
      }
    ])
    expect(results.filter((r) => !r.passed)).toEqual([])
    expect(results).toHaveLength(2)
  })

  it('week-5-4: some / every / find', () => {
    const items = [
      { id: '1', name: 'a', price: 1, isOutOfStock: false, isFreeShipping: true },
      { id: '2', name: 'b', price: 2, isOutOfStock: true, isFreeShipping: true }
    ]
    const results = runFunctionTests(answerOf('week-5-4'), [
      { target: 'index.ts', functionName: 'hasOutOfStockItem', cases: [{ description: '품절 있음', args: [items], expected: true }, { description: '품절 없음', args: [[items[0]]], expected: false }] },
      { target: 'index.ts', functionName: 'areAllFreeShipping', cases: [{ description: '모두 무료', args: [items], expected: true }, { description: '일부 유료', args: [[{ ...items[0], isFreeShipping: false }]], expected: false }] },
      { target: 'index.ts', functionName: 'findItemById', cases: [{ description: '찾기', args: [items, '2'], expected: items[1] }, { description: '없음', args: [items, '9'], expected: undefined }] }
    ])
    expect(results.filter((r) => !r.passed)).toEqual([])
    expect(results).toHaveLength(6)
  })

  it('week-5-5: 재고 0 이하 제외', () => {
    const results = runFunctionTests(answerOf('week-5-5'), [
      { target: 'index.ts', functionName: 'filterAvailableStock', cases: [{ description: '품절 제외', args: [{ apple: 10, banana: 0, orange: 5 }], expected: { apple: 10, orange: 5 } }] }
    ])
    expect(results.filter((r) => !r.passed)).toEqual([])
    expect(results).toHaveLength(1)
  })
})
