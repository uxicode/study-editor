export interface RuntimeFile {
  name: string
  path: string
  content: string
  readonly?: boolean
}

export interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  logs: string[]
  queryLogs?: PrismaQueryLog[]
}

export interface PrismaQueryLog {
  timestamp: number
  query: string
  params: unknown[]
  duration: number
}

export interface ValidationResult {
  passed: boolean
  errors: ValidationError[]
  hints: string[]
  nextStep?: string
}

export interface ValidationError {
  type: 'static' | 'dynamic'
  message: string
  line?: number
  column?: number
}

export interface DBSnapshot {
  tables: DBTable[]
  timestamp: number
}

export interface DBTable {
  name: string
  columns: DBColumn[]
  rows: Record<string, unknown>[]
}

export interface DBColumn {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
}
