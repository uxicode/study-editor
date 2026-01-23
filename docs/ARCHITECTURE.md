# 아키텍처 문서

## 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                     브라우저 환경                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Vue 3 Application                    │  │
│  │                                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │ ContentPanel │  │ CodeEditor   │             │  │
│  │  │              │  │ (Monaco)     │             │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  │                    ┌──────────────┐             │  │
│  │                    │ConsolePanel  │             │  │
│  │                    └──────────────┘             │  │
│  └───────────────────────────────────────────────────┘  │
│         │                    │                          │
│         ▼                    ▼                          │
│  ┌──────────────┐    ┌──────────────┐                 │
│  │ Curriculum   │    │  Runtime     │                 │
│  │ Management   │    │  Engine      │                 │
│  └──────────────┘    └──────────────┘                 │
│                             │                          │
│                 ┌───────────┴───────────┐             │
│                 ▼                       ▼             │
│          ┌──────────────┐        ┌──────────┐        │
│          │WebContainers │        │  PGlite  │        │
│          │(Node.js WASM)│        │(PG WASM) │        │
│          └──────────────┘        └──────────┘        │
└─────────────────────────────────────────────────────────┘
```

## 핵심 컴포넌트

### 1. LearningEnvironment

메인 레이아웃 컴포넌트로, 3분할 UI를 구성합니다.

**책임:**
- 전체 레이아웃 관리
- 하위 컴포넌트 간 데이터 흐름 조정
- 사용자 액션 처리 (정답 확인, 단계 이동)

**상태:**
- `editorFiles`: 현재 편집 중인 파일들
- `executionResult`: 코드 실행 결과
- `validationResult`: 검증 결과
- `dbSnapshot`: 데이터베이스 스냅샷

### 2. ContentPanel

학습 콘텐츠 표시 패널

**책임:**
- 단계별 이론 설명 렌더링
- 미션 및 학습 목표 표시
- 힌트 제공

### 3. CodeEditor

Monaco Editor 기반 코드 편집기

**책임:**
- 다중 파일 편집 지원
- 문법 하이라이팅 (JS, TS, Prisma)
- 코드 자동 완성

**특징:**
- Tab 기반 파일 전환
- Prisma 언어 지원 추가
- 다크 테마

### 4. ConsolePanel

실행 결과 및 피드백 표시

**책임:**
- 코드 실행 출력 표시
- 검증 결과 및 에러 메시지
- 데이터베이스 테이블 뷰어

**탭 구성:**
- Output: 실행 로그
- Validation: 검증 결과
- Database: DB 스냅샷

## 핵심 Composables

### useCurriculum

커리큘럼 관리

**기능:**
- 단계 로딩 및 탐색
- 사용자 진행 상황 추적
- LocalStorage 기반 진행 상태 저장

### useRuntime

WebContainers 런타임 관리

**기능:**
- WebContainer 인스턴스 초기화
- 파일 시스템 관리
- npm 패키지 설치 및 코드 실행

**실행 흐름:**
1. 파일 작성
2. npm install
3. Prisma generate
4. node 실행

### useValidator

코드 검증 시스템

**검증 단계:**
1. **정적 검증**: 코드 구문 분석
   - includes: 특정 문자열 포함 확인
   - regex: 정규식 패턴 매칭
   - ast: 추상 구문 트리 분석 (TODO)

2. **동적 검증**: 실행 결과 검증
   - 반환값 검증
   - 쿼리 결과 검증
   - 스키마 검증

### useDatabase

PGlite 데이터베이스 관리

**기능:**
- PGlite 인스턴스 초기화
- SQL 쿼리 실행
- 데이터베이스 스냅샷 생성
- 초기화 및 리셋

## 데이터 흐름

### 1. 학습 시작

```
사용자 → loadStep(id) → useCurriculum → CURRICULUM_STEPS
                                              ↓
                                        currentStep
                                              ↓
                                        initialFiles
                                              ↓
                                        CodeEditor
```

### 2. 코드 실행 및 검증

```
사용자 클릭 → handleCheckAnswer
                 ↓
            executeCode (useRuntime)
                 ↓
            WebContainers 실행
                 ↓
            ExecutionResult
                 ↓
            validateStep (useValidator)
                 ↓
            ValidationResult
                 ↓
            ConsolePanel 업데이트
```

### 3. 데이터베이스 조회

```
ValidationResult.passed === true
                 ↓
          getSnapshot (useDatabase)
                 ↓
            PGlite 쿼리
                 ↓
            DBSnapshot
                 ↓
        ConsolePanel Database Tab
```

## 보안 고려사항

### WebContainers 샌드박스

- 브라우저 내 격리된 환경
- 파일 시스템 접근 제한
- 네트워크 요청 제한

### PGlite 메모리 DB

- 메모리 내 실행 (파일 시스템 미사용)
- 세션 종료 시 데이터 소멸
- 외부 연결 불가

## 성능 최적화

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

별도 워커 스레드에서 실행하여 UI 블로킹 방지

### 3. 상태 관리

- 필요한 경우에만 re-render
- computed를 통한 파생 상태 캐싱
- watch 사용 최소화

## 확장 가능성

### 새로운 학습 단계 추가

`src/data/curriculum-steps.ts`에 객체 추가

### 새로운 언어 지원

`src/monaco-setup.ts`에 언어 정의 추가

### 새로운 검증 로직

`StepValidator` 인터페이스 확장

### 클라우드 동기화

- Firebase/Supabase 통합
- 사용자 인증 추가
- 진행 상황 클라우드 저장

## 배포

### Vercel/Netlify

```bash
npm run build
# dist 폴더 배포
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

## 문제 해결

### WebContainers 초기화 실패

- HTTPS 필요 (localhost는 제외)
- COOP/COEP 헤더 설정 확인

### Monaco Editor 워커 에러

- vite.config.ts의 worker 설정 확인
- monaco-setup.ts import 확인

### PGlite 쿼리 실패

- WASM 지원 브라우저 확인 (Chrome 95+)
- 메모리 제한 확인
