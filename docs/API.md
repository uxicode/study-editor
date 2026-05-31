# API 문서

학습 플랫폼은 별도의 백엔드 API 를 두지 않습니다. 모든 학습 로직은 Vue Composables 와 `src/lib/learning` 에서 처리하고, 회원 인증과 진행 상황은 Supabase 클라이언트로 호출합니다.

## Composables

### useCurriculum()

커리큘럼 및 사용자 진행 상황을 관리합니다.

```typescript
interface UseCurriculumReturn {
  currentStep: ComputedRef<CurriculumStep | null>
  allSteps: ComputedRef<CurriculumStep[]>
  isLoadingStep: Ref<boolean>
  userProgress: Ref<UserProgress>
  canGoNext: ComputedRef<boolean>
  canGoPrevious: ComputedRef<boolean>
  isAllStepsCompleted: ComputedRef<boolean>
  currentLevel: ComputedRef<number>

  loadStep: (stepId: string) => Promise<void>
  goToNextStep: () => void
  goToPreviousStep: () => void
  markStepCompleted: (stepId: string) => void
  incrementAttempt: (stepId: string) => void
  loadProgress: () => Promise<void>
  resetProgress: () => void
  restartCurriculum: () => void
}
```

로그인 사용자는 Supabase 의 `user_progress` 테이블, 비로그인 사용자는 `localStorage` 에 저장됩니다.

```typescript
import { useCurriculum } from '@/composables/use-curriculum'

const { currentStep, loadStep, markStepCompleted, loadProgress } = useCurriculum()

await loadProgress()
await loadStep('week-1-1')
markStepCompleted('week-1-1')
```

---

### useMockRuntime()

Fastify · Prisma · MySQL 코드 패턴을 분석하여 가상 출력과 로그를 만들어 줍니다.

```typescript
interface UseMockRuntimeReturn {
  isExecuting: Ref<boolean>
  isInitialized: Ref<boolean>
  executeCode: (files: RuntimeFile[]) => Promise<ExecutionResult>
  cleanup: () => Promise<void>
}
```

- **Prisma**: 모델, `PrismaClient` 인스턴스, `.create / .findMany / .update / .delete / .$transaction` 호출 인식, `@@index` 카운트
- **Fastify**: import, `get / post / put / delete / patch` 라우트, `schema:` 검증, `register` / `decorate`, `listen` 호출 인식
- **MySQL DDL (`*.sql`)**: `CREATE TABLE`, `PRIMARY KEY`, `AUTO_INCREMENT`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL`, `DEFAULT`, `CHECK`, `ON DELETE`, `CREATE INDEX`, `EXPLAIN` 키워드와 테이블 / 인덱스 개수 집계

```typescript
import { useMockRuntime } from '@/composables/use-mock-runtime'

const { executeCode } = useMockRuntime()
const result = await executeCode(editorFiles.value)
```

---

### useValidator()

정적 / 동적 검증을 수행합니다.

```typescript
interface UseValidatorReturn {
  validateStep: (
    step: CurriculumStep,
    files: RuntimeFile[],
    executionResult: ExecutionResult
  ) => Promise<ValidationResult>
}
```

- `staticChecks`: `includes`, `regex`
- `dynamicChecks`: `test(result)` 함수가 `executionResult` 를 받아 boolean 반환

Mock Runtime 으로 실행된 결과에 대해서는 동적 검증은 더 관대하게 통과 처리됩니다 (정적 검증 위주).

---

### useDatabase()

학습용 인메모리 DB ([`src/lib/learning`](../src/lib/learning/)) 를 노출합니다.

```typescript
interface UseDatabaseReturn {
  isInitialized: Ref<boolean>
  isLoading: Ref<boolean>
  initializeDatabase: () => Promise<void>
  getSnapshot: () => Promise<DBSnapshot>
  reset: () => Promise<void>
  close: () => Promise<void>
}
```

`useDatabase` 자체는 SQL 을 직접 받지 않습니다. Prisma 스키마/출력 → SQL 변환은 [src/services/prisma-api.service.ts](../src/services/prisma-api.service.ts) 가 담당합니다.

---

## Services

### auth.service

`@supabase/supabase-js` 의 Auth API 를 감싼 얇은 래퍼입니다.

```typescript
import * as authService from '@/services/auth.service'

await authService.register(email, password)
await authService.login(email, password)
await authService.loginWithOAuth('google') // or 'github'
const user = await authService.fetchMe()
await authService.logout()
```

### progress.service

`user_progress` 테이블에 대한 read / upsert.

```typescript
import { getProgress, saveProgress } from '@/services/progress.service'

const progress = await getProgress()
await saveProgress(progress)
```

RLS 가 활성화되어 있으므로 본인 행만 접근할 수 있습니다.

### prisma-api.service

학습용 시뮬레이션 진입점. 내부적으로 [src/lib/learning](../src/lib/learning/) 의 함수를 호출합니다.

```typescript
import { prismaToSql, prismaOutputToSql } from '@/services/prisma-api.service'

const sql = await prismaToSql(schemaContent) // MySQL DDL 문자열
const { insertStatements } = await prismaOutputToSql(output, schemaContent)
```

---

## 타입 정의

### CurriculumStep

```typescript
interface CurriculumStep {
  id: string
  title: string
  order: number
  category: StepCategory
  content: StepContent
  initialFiles: FileTemplate[]
  validator: StepValidator
  hints: Hint[]
}
```

### FileTemplate

```typescript
interface FileTemplate {
  name: string
  path: string
  content: string
  language: 'javascript' | 'typescript' | 'prisma' | 'json' | 'sql'
  readonly?: boolean
}
```

`language: 'sql'` 은 4주차 MySQL DDL 학습 파일(`schema.sql`)을 위해 추가되었습니다. Monaco Editor 는 이 값에 따라 알맞은 문법 강조를 적용합니다.

### ExecutionResult

```typescript
interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  logs: string[]
  queryLogs?: PrismaQueryLog[]
}
```

### ValidationResult

```typescript
interface ValidationResult {
  passed: boolean
  errors: ValidationError[]
  hints: string[]
  nextStep?: string
}
```

### DBSnapshot

```typescript
interface DBSnapshot {
  tables: DBTable[]
  timestamp: number
  schemaSQL?: string
}

interface DBTable {
  name: string
  columns: DBColumn[]
  rows: Record<string, unknown>[]
}
```

---

## 유틸리티

### parseMarkdown(text: string): string

마크다운을 HTML 로 변환합니다.

```typescript
import { parseMarkdown } from '@/utils/markdown'

const html = parseMarkdown('**Bold** and *italic*')
```

### formatDate / formatDuration

[src/utils/format.ts](../src/utils/format.ts) 에서 제공됩니다.

```typescript
formatDuration(1500) // '1.50s'
formatDuration(500) // '500ms'
```

---

## 커스텀 Composable 작성 패턴

```typescript
import { ref, computed } from 'vue'

interface UseMyFeatureReturn {
  state: Ref<MyState>
  isLoading: Ref<boolean>
  doSomething: () => Promise<void>
}

export function useMyFeature(): UseMyFeatureReturn {
  const state = ref<MyState>({})
  const isLoading = ref(false)

  async function doSomething() {
    isLoading.value = true
    try {
      // 로직
    } finally {
      isLoading.value = false
    }
  }

  return { state, isLoading, doSomething }
}
```

## 타입 확장

새로운 타입은 [src/types/](../src/types/) 의 `.d.ts` 에 추가합니다.

```typescript
// src/types/my-feature.d.ts
export interface MyFeature {
  id: string
  name: string
}

export type MyFeatureType = 'typeA' | 'typeB'
```
