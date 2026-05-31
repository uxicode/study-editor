# Interactive Backend Learning Platform

브라우저에서 **Fastify · Prisma · MySQL** 을 단계별로 실습할 수 있는 인터랙티브 학습 환경입니다. 실제 서버나 DB 를 띄우지 않고, 패턴 분석과 인메모리 시뮬레이션으로 정답을 검증합니다.

## 프로젝트 목적

별도의 환경 설정 없이, 브라우저 안에서 ORM(Prisma) + 관계형 DB(MySQL) + 가벼운 웹 프레임워크(Fastify) 기반 백엔드 구성을 익힐 수 있는 "Learning by Doing" 플랫폼입니다.

## 주요 기능

### 3분할 인터랙티브 레이아웃

- **Content Panel (좌측)**: 마크다운 기반의 이론 설명, 학습 목표, 연습문제 미션
- **Code Editor (우측 상단)**: Monaco Editor 를 사용한 다중 파일 편집 (Prisma, TS, JS)
- **Console / DB Panel (우측 하단)**: 코드 분석 로그, 검증 결과, 가상 DB 데이터 뷰어

### 4주차 커리큘럼 (총 24스텝)

| 주차    | 주제                              | 사용 파일                                       | 핵심 키워드                            |
|---------|-----------------------------------|--------------------------------------------------|----------------------------------------|
| 1주차   | Fastify + TypeScript              | `server.ts`                                      | Fastify, 라우트, schema, plugin        |
| 2주차   | MySQL — 데이터 무결성과 설계       | `schema.sql`                                     | CREATE TABLE, PK, FK, UNIQUE, CHECK    |
| 3주차   | Prisma ORM · 레이어드 아키텍처    | `schema.prisma`, `server.ts`, `*.repository.ts` | model, @relation, repository, service  |
| 4주차   | 트랜잭션 · 인덱스 · 성능          | `schema.prisma`, `server.ts`, `schema.sql`       | $transaction, @@index, 페이징, EXPLAIN |

각 주차는 5개의 기본 스텝 + 1개의 종합 스텝으로 구성됩니다.

### 코드 검증 시스템

- **정적 분석**: 코드 내 특정 import / 메서드 호출 / 라우트 등록 / SQL 키워드 패턴 확인
- **동적 분석 (mock)**: 분석 결과로 만들어진 가상 출력에 대한 검증
- **힌트 시스템**: 단계별 힌트와 정답 코드 스니펫 제공

### 주차 진행 시스템

- 4주차 구성, 각 주차의 마지막 스텝은 그 주의 내용을 종합한 실전 과제
- 한 주차의 모든 단계를 완료하면 축하 모달과 엠블럼이 표시됩니다.
- 우측 상단에 "Step n/total" 진행률 표시

## 기술 스택

### 프론트엔드 (이 앱)

- **Framework**: Vue 3 (Composition API) + TypeScript
- **Editor**: Monaco Editor
- **Styling**: Tailwind CSS + SCSS
- **Build Tool**: Vite

### 인증 / 진행 상황 저장

- **Supabase Auth**: 이메일·비밀번호, Google, GitHub OAuth
- **Supabase Postgres**: 사용자별 `user_progress` 테이블 + RLS

### 학습 시뮬레이션

- 모든 변환·검증은 `src/lib/learning/` 의 **프론트엔드 인메모리 시뮬**로 처리
- 별도의 백엔드 서버 없음 (서버리스)

### 학습자가 배우는 스택 (커리큘럼 내용)

- **Fastify + TypeScript**: 라우트, request/reply, JSON Schema, 플러그인·데코레이터
- **MySQL**: CREATE TABLE, AUTO_INCREMENT, FK·CASCADE, N:M 조인 테이블, EXPLAIN
- **Prisma ORM**: schema model, @relation, CRUD, include, 레이어드 아키텍처
- **고도화**: `$transaction`, `@@index`, 페이징(skip·take / cursor), N+1 회피

## 설치 및 실행

### 1. Supabase 프로젝트 준비

자세한 절차는 [supabase/README.md](supabase/README.md) 를 참고하세요. 요약하면:

1. [supabase.com](https://supabase.com) 에서 프로젝트 생성
2. [supabase/migrations/001_user_progress.sql](supabase/migrations/001_user_progress.sql) 을 SQL Editor 에 붙여 넣어 실행
3. (선택) Google / GitHub OAuth provider 활성화

### 2. 환경 변수 설정

`.env.example` 을 참고하여 `.env` 를 생성합니다.

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

빌드는 다음과 같이 수행합니다.

```bash
npm run build
npm run preview
```

## 프로젝트 구조

```
study-editor/
├── src/
│   ├── components/learning-environment/   # 학습 UI (3분할 레이아웃)
│   ├── composables/                       # use-curriculum, use-validator, use-mock-runtime, use-database
│   ├── data/steps/                        # 단계별 커리큘럼 (Prisma + MySQL + Fastify)
│   ├── lib/
│   │   ├── supabase.ts                    # Supabase 클라이언트
│   │   └── learning/                      # 학습용 인메모리 DB + Prisma → MySQL DDL 시뮬
│   ├── services/                          # auth / progress / prisma-api
│   ├── stores/                            # Pinia 스토어 (auth)
│   ├── views/                             # LearningPage, LoginPage, RegisterPage
│   └── ...
├── supabase/
│   ├── README.md                          # Supabase 설정 가이드
│   └── migrations/                        # 회원 진행 상황 테이블 SQL
├── docs/                                  # 아키텍처·API 문서
└── package.json
```

## 사용 방법

1. 회원가입 또는 비로그인 상태로 Step 1 부터 시작
2. 좌측 패널에서 이론·미션 확인
3. 우측 에디터에서 코드 작성
4. "정답 확인" 으로 검증 → 통과하면 다음 단계
5. 로그인 사용자는 진행 상황이 Supabase 에 저장되어 어디서나 이어 학습 가능

> 비로그인 사용자는 진행 상황이 `localStorage` 에 보관되며, 2주차 이상은 로그인이 필요합니다.

## 개발 가이드

### 새로운 학습 단계 추가

[src/data/steps/](src/data/steps/) 에 새 파일을 추가하고 [src/data/curriculum-steps.ts](src/data/curriculum-steps.ts) 의 배열에 포함시키세요. 단계 구조는 [src/types/curriculum.d.ts](src/types/curriculum.d.ts) 의 `CurriculumStep` 인터페이스를 따릅니다.

검증은 다음 두 가지를 활용합니다.

- `staticChecks`: 코드 패턴(`includes` / `regex`) 검사
- `dynamicChecks`: `executeCode` 가 생성한 mock 출력에 대한 검사

`use-mock-runtime.ts` 가 Prisma, Fastify, 그리고 MySQL DDL(`*.sql`) 패턴을 모두 분석합니다.

## 라이선스

MIT
