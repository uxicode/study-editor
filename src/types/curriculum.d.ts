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
  expectedOutput?: string
}

export interface FileTemplate {
  name: string
  path: string
  content: string
  language: 'javascript' | 'typescript' | 'prisma' | 'json'
  readonly?: boolean
}

export interface StepValidator {
  staticChecks: StaticCheck[]
  dynamicChecks: DynamicCheck[]
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
  level: 1 | 2 | 3
  content: string
  codeSnippet?: string
}

export interface UserProgress {
  completedSteps: string[]
  currentStep: string
  attempts: Record<string, number>
}
