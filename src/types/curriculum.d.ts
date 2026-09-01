export interface CurriculumStep {
  id: string
  title: string
  order: number
  category: StepCategory
  content: StepContent
  initialFiles: FileTemplate[]
  validator: StepValidator
  hints: Hint[]
}

export type StepCategory =
  | 'environment'
  | 'schema'
  | 'migration'
  | 'create'
  | 'read'
  | 'relations'
  | 'update'
  | 'delete'
  | 'advanced'

export interface StepContent {
  mission: string
  theory: string
  objectives: string[]
  /** 연습문제: 학습자가 수행할 구체적인 과제 설명 */
  exercise?: string
  expectedOutput?: string
}

export interface FileTemplate {
  name: string
  path: string
  content: string
  language: 'javascript' | 'typescript' | 'prisma' | 'json' | 'sql'
  readonly?: boolean
}

export interface StepValidator {
  staticChecks: StaticCheck[]
  dynamicChecks: DynamicCheck[]
  /** 알고리즘/함수형 스텝: 사용자 함수를 실제 인자로 호출해 검증 */
  functionTests?: FunctionTest[]
}

export interface FunctionTest {
  target: string
  functionName: string
  cases: FunctionTestCase[]
}

export interface FunctionTestCase {
  description: string
  args: unknown[]
  expected: unknown
}

export interface StaticCheck {
  type: 'includes' | 'regex' | 'ast'
  target: string
  pattern: string | RegExp
  message: string
}

export interface DynamicCheck {
  type: 'query' | 'result' | 'schema'
  test: (result: unknown) => boolean
  message: string
}

export interface Hint {
  level: 1 | 2 | 3 | 4 | 5
  content: string
  codeSnippet?: string
}

export interface UserProgress {
  completedSteps: string[]
  currentStep: string
  attempts: Record<string, number>
}
