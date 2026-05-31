# 아키텍처 문서

## 전체 구조

```
┌────────────────────────────────────────────────────────────┐
│                    브라우저 (Vue 3 + TS)                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           LearningEnvironment (3분할 UI)              │ │
│  │   ContentPanel   │   CodeEditor   │   ConsolePanel    │ │
│  └───────────────────────────────────────────────────────┘ │
│       │                    │                  │            │
│       ▼                    ▼                  ▼            │
│  use-curriculum     use-mock-runtime    use-database       │
│  use-validator      use-validator       (in-memory)        │
│       │                                                    │
│       ▼                                                    │
│  ┌─────────────────────────┐    ┌────────────────────────┐ │
│  │   @supabase/supabase-js │    │  src/lib/learning      │ │
│  │   Auth + Postgres       │    │  Prisma → MySQL DDL    │ │
│  └─────────────────────────┘    │  Prisma output → INSERT│ │
│                                  │  In-memory DB          │ │
│                                  └────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
              │                                ▲
              ▼                                │ 변환 결과만 표시
       ┌───────────────┐                       │
       │  Supabase     │                  외부 연결 없음
       │  Auth + RLS   │
       └───────────────┘
```

별도의 백엔드 서버 (Express, Fastify 인스턴스) 는 **운영되지 않습니다**. 학습자에게 보여 주는 Fastify / Prisma / MySQL 은 모두 **mock 시뮬레이션**으로 동작합니다.

## 핵심 컴포넌트

### LearningEnvironment

3분할 레이아웃을 구성하는 메인 컴포넌트입니다.

**책임**

- 전체 레이아웃 관리
- 하위 컴포넌트 간 데이터 흐름 조정
- "정답 확인" / "이전 / 다음 단계" 액션 처리

**상태**

- `editorFiles`: 현재 편집 중인 파일들
- `executionResult`: 코드 실행(분석) 결과
- `validationResult`: 검증 결과
- `dbSnapshot`: 인메모리 DB 스냅샷

### ContentPanel / CodeEditor / ConsolePanel

- **ContentPanel**: 단계별 이론, 미션, 힌트 표시
- **CodeEditor**: Monaco Editor 기반 다중 파일 편집 (Prisma, TypeScript, JavaScript)
- **ConsolePanel**: 분석 로그, 검증 결과, MySQL DDL 및 DB 데이터 표시

## 핵심 Composables

### useCurriculum

- 단계 로딩 및 탐색
- 사용자 진행 상황 추적
- **로그인** 사용자는 [`progress.service`](../src/services/progress.service.ts) 를 통해 Supabase 의 `user_progress` 와 동기화
- **비로그인** 사용자는 `localStorage` 만 사용

### useMockRuntime

- 실제 Node / Fastify / MySQL 실행 없이 코드 패턴 분석
- **Prisma**: `schema.prisma` 의 `model`·`@@index`·`provider`, `app.js`/`app.ts` 의 메서드 호출 (`create`, `findMany`, `$transaction` 등) 인식
- **Fastify**: `server.ts`/`server.js` 의 라우트 등록 (`get`, `post`, ...), `schema`·`register`·`decorate`, `listen` 호출 인식
- **MySQL DDL** (`*.sql`): `CREATE TABLE`, `PRIMARY KEY`, `AUTO_INCREMENT`, `FOREIGN KEY`, `CHECK`, `EXPLAIN` 등 키워드와 테이블·인덱스 개수 집계
- 시뮬레이션 출력을 생성하여 동적 검증으로 전달

### useValidator

- **정적 검증**: `includes`, `regex`
- **동적 검증**: mock 출력에 대한 사용자 정의 `test(result)` 함수
- Mock Runtime 으로 판정되면 동적 검증은 더 관대하게 통과 처리

### useDatabase

- 학습용 인메모리 DB ([`src/lib/learning`](../src/lib/learning/)) 를 노출
- Prisma schema → MySQL DDL 변환 → 메모리 테이블 등록
- Prisma 실행 출력 → INSERT SQL → 메모리 행 추가
- ConsolePanel "Database" 탭의 데이터 소스

## 4주차 커리큘럼 매핑

```
Week 1 — Fastify + TS         → server.ts (typescript) 만 사용
Week 2 — MySQL DDL            → schema.sql (sql)
Week 3 — Prisma ORM           → schema.prisma + server.ts (+ repository/service)
Week 4 — Transactions/Indexes → schema.prisma + server.ts (+ schema.sql for EXPLAIN)
```

각 주차는 5개의 기본 스텝 + 1개의 종합 스텝으로 구성됩니다 (`LEVEL_STEP_COUNTS = {1:6, 2:6, 3:6, 4:6}`).

## 데이터 흐름

### 학습 시작

```
사용자 → loadStep(id) → useCurriculum → CURRICULUM_STEPS
                                                ↓
                                          currentStep
                                                ↓
                                          initialFiles
                                                ↓
                                            CodeEditor
```

### 정답 확인

```
사용자 클릭 → handleCheckAnswer
                 ↓
            executeCode (use-mock-runtime)
                 ↓
            ExecutionResult (분석 로그 + 가상 출력)
                 ↓
            validateStep (use-validator)
                 ↓
            ValidationResult
                 ↓
            ConsolePanel 업데이트
                 ↓
            (성공 시) Prisma 출력 → INSERT SQL → 인메모리 DB 반영
                 ↓
            getSnapshot → DB 탭 갱신
```

### 인증 / 진행 상황

```
LoginPage / RegisterPage
        ↓
   auth.service (supabase.auth.*)
        ↓
   auth-store (Pinia) ← onAuthStateChange
        ↓
   use-curriculum.saveProgress / loadProgress
        ↓
   progress.service → supabase.from('user_progress')
```

## 보안 고려사항

### Supabase RLS

`user_progress` 테이블은 Row Level Security 가 활성화되어 있어, 사용자는 본인의 `user_id` 행만 읽고 쓸 수 있습니다. 마이그레이션은 [supabase/migrations/001_user_progress.sql](../supabase/migrations/001_user_progress.sql) 을 참고하세요.

### 학습용 시뮬 DB

`src/lib/learning/in-memory-db.ts` 는 메모리 안에서만 동작합니다. 학습자가 입력하는 SQL/Prisma 코드는 외부 데이터베이스에 도달하지 않습니다.

## 성능

### 1. 코드 분할

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'monaco-editor': ['monaco-editor']
      }
    }
  }
}
```

### 2. Monaco Editor Worker

별도 워커 스레드에서 실행하여 UI 블로킹 방지.

### 3. 상태 관리

- 필요한 경우에만 re-render
- `computed` 를 활용한 파생 상태 캐싱
- `watch` 사용 최소화

## 확장 가능성

### 새로운 학습 단계 추가

[src/data/steps/](../src/data/steps/) 에 새 파일을 추가하고 [src/data/curriculum-steps.ts](../src/data/curriculum-steps.ts) 의 배열에 등록합니다.

### 새로운 검증 로직

[src/types/curriculum.d.ts](../src/types/curriculum.d.ts) 의 `StepValidator` 인터페이스를 확장할 수 있습니다. 새 `staticChecks.type` 값을 추가하면 [use-validator.ts](../src/composables/use-validator.ts) 의 switch 에 케이스를 더해 처리합니다.

### Mock Runtime 패턴 추가

[use-mock-runtime.ts](../src/composables/use-mock-runtime.ts) 에 새 분석기를 추가합니다. 예) GraphQL 라우트 검출, NestJS decorator 검출 등.

## 배포

### Vercel / Netlify

```bash
npm run build
# dist 폴더 배포
```

빌드 시 `.env` 에 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 가 주입되어야 합니다.

## 문제 해결

### Supabase 호출 실패

- `.env` 의 키가 비어 있지 않은지 확인
- Auth provider 설정 (Email, Google, GitHub) 활성화 확인
- RLS 정책이 누락되면 `getProgress` / `saveProgress` 가 빈 결과를 반환할 수 있음 → 마이그레이션 재실행

### Monaco Editor 워커 에러

- [vite.config.ts](../vite.config.ts) 의 worker 설정 확인
- [src/monaco-setup.ts](../src/monaco-setup.ts) import 확인
