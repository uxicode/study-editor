# API 문서

## Composables

### useCurriculum()

커리큘럼 및 사용자 진행 상황을 관리합니다.

#### 반환값

```typescript
interface UseCurriculumReturn {
  // 상태
  currentStep: ComputedRef<CurriculumStep | null>
  allSteps: ComputedRef<CurriculumStep[]>
  isLoadingStep: Ref<boolean>
  userProgress: Ref<UserProgress>
  canGoNext: ComputedRef<boolean>
  canGoPrevious: ComputedRef<boolean>

  // 메서드
  loadStep: (stepId: string) => Promise<void>
  goToNextStep: () => void
  goToPreviousStep: () => void
  markStepCompleted: (stepId: string) => void
  incrementAttempt: (stepId: string) => void
  loadProgress: () => void
  resetProgress: () => void
}
```

#### 사용 예시

```typescript
import { useCurriculum } from '@/composables/use-curriculum'

const { currentStep, loadStep, markStepCompleted } = useCurriculum()

// 단계 로드
await loadStep('step-1')

// 단계 완료 표시
markStepCompleted('step-1')

// 현재 단계 정보 접근
console.log(currentStep.value?.title)
```

---

### useRuntime()

WebContainers 런타임을 관리하고 코드를 실행합니다.

#### 반환값

```typescript
interface UseRuntimeReturn {
  // 상태
  isExecuting: Ref<boolean>
  isInitialized: Ref<boolean>

  // 메서드
  initializeWebContainer: () => Promise<WebContainer>
  executeCode: (files: RuntimeFile[]) => Promise<ExecutionResult>
  cleanup: () => Promise<void>
}
```

#### 사용 예시

```typescript
import { useRuntime } from '@/composables/use-runtime'

const { executeCode, isExecuting } = useRuntime()

// 코드 실행
const result = await executeCode([
  {
    name: 'app.js',
    path: 'app.js',
    content: 'console.log("Hello World")'
  }
])

if (result.success) {
  console.log('Output:', result.output)
} else {
  console.error('Error:', result.error)
}
```

---

### useValidator()

코드 검증을 수행합니다.

#### 반환값

```typescript
interface UseValidatorReturn {
  validateStep: (
    step: CurriculumStep,
    files: RuntimeFile[],
    executionResult: ExecutionResult
  ) => Promise<ValidationResult>
}
```

#### 사용 예시

```typescript
import { useValidator } from '@/composables/use-validator'

const { validateStep } = useValidator()

const validation = await validateStep(currentStep, files, executionResult)

if (validation.passed) {
  console.log('통과!')
} else {
  console.log('오류:', validation.errors)
  console.log('힌트:', validation.hints)
}
```

---

### useDatabase()

PGlite 데이터베이스를 관리합니다.

#### 반환값

```typescript
interface UseDatabaseReturn {
  // 상태
  isInitialized: Ref<boolean>
  isLoading: Ref<boolean>

  // 메서드
  initializeDatabase: () => Promise<PGlite>
  executeQuery: (sql: string, params?: unknown[]) => Promise<unknown>
  getSnapshot: () => Promise<DBSnapshot>
  reset: () => Promise<void>
  close: () => Promise<void>
}
```

#### 사용 예시

```typescript
import { useDatabase } from '@/composables/use-database'

const { executeQuery, getSnapshot } = useDatabase()

// 쿼리 실행
await executeQuery('CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT)')

// 스냅샷 가져오기
const snapshot = await getSnapshot()
console.log('Tables:', snapshot.tables)
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
}

interface DBTable {
  name: string
  columns: DBColumn[]
  rows: Record<string, unknown>[]
}
```

---

## 유틸리티 함수

### parseMarkdown(text: string): string

마크다운을 HTML로 변환합니다.

```typescript
import { parseMarkdown } from '@/utils/markdown'

const html = parseMarkdown('**Bold** and *italic*')
// '<strong>Bold</strong> and <em>italic</em>'
```

### formatDate(timestamp: number): string

타임스탬프를 한국어 날짜 형식으로 변환합니다.

```typescript
import { formatDate } from '@/utils/format'

const date = formatDate(Date.now())
// '2026. 1. 23. 오후 3:34:00'
```

### formatDuration(ms: number): string

밀리초를 사람이 읽기 쉬운 형식으로 변환합니다.

```typescript
import { formatDuration } from '@/utils/format'

formatDuration(1500) // '1.50s'
formatDuration(500)  // '500ms'
```

---

## 이벤트

### CodeEditor 이벤트

```typescript
interface CodeEditorEmits {
  'update:content': (fileName: string, content: string) => void
  'update:activeFile': (fileName: string) => void
}
```

### ContentPanel 이벤트

```typescript
interface ContentPanelEmits {
  'showHint': (level: number) => void
}
```

### ErrorMessage 이벤트

```typescript
interface ErrorMessageEmits {
  'retry': () => void
}
```

---

## 커스텀 훅 만들기

새로운 composable을 만들 때는 다음 패턴을 따르세요:

```typescript
import { ref, computed } from 'vue'

export function useMyFeature() {
  // 상태
  const state = ref<MyState>({})
  const isLoading = ref(false)

  // 계산된 속성
  const computedValue = computed(() => {
    return state.value.something
  })

  // 메서드
  async function doSomething() {
    isLoading.value = true
    try {
      // 로직
    } finally {
      isLoading.value = false
    }
  }

  // 반환
  return {
    state,
    isLoading,
    computedValue,
    doSomething
  }
}
```

---

## 타입 확장

새로운 타입을 추가할 때는 `src/types/` 디렉토리에 `.d.ts` 파일을 생성하세요:

```typescript
// src/types/my-feature.d.ts
export interface MyFeature {
  id: string
  name: string
  // ...
}

export type MyFeatureType = 'typeA' | 'typeB'
```
