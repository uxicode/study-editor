# Interactive Backend Learning Platform

브라우저에서 Express, Prisma, PostgreSQL을 단계별로 실습할 수 있는 인터랙티브 학습 환경입니다.

## 🎯 프로젝트 목적

별도의 환경 설정 없이 브라우저에서 Node.js 기초를 알고 있는 주니어 개발자가 ORM(Prisma)과 RDB(PostgreSQL) 기반의 백엔드 설계를 익힐 수 있는 "Learning by Doing" 플랫폼입니다.

## 🚀 주요 기능

### 3분할 인터랙티브 레이아웃

- **Content Panel (좌측)**: 마크다운 기반의 이론 설명, 학습 목표, 연습문제 미션
- **Code Editor (우측 상단)**: Monaco Editor를 사용한 다중 파일 편집
- **Console/Result Panel (우측 하단)**: 코드 실행 결과, Prisma 쿼리 로그, DB 데이터 뷰어

### 단계별 커리큘럼

1. **Environment**: Prisma 초기화 및 연결 설정
2. **Schema**: User 모델 정의
3. **Create**: 데이터 생성 (prisma.user.create)
4. **Read**: 데이터 조회 (findMany, findUnique)
5. **Relations**: 1:N 관계 설정
6. **Update/Delete**: 데이터 수정 및 삭제
7. **Advanced**: Transaction 및 Middleware

### 코드 검증 시스템

- **정적 분석**: 코드 내 특정 메서드 호출 확인
- **동적 분석**: 가상 DB에 실제 쿼리 실행 및 결과 검증
- **힌트 시스템**: 단계별 힌트 제공

### 레벨 시스템 & 엠블럼

- **레벨 진행**: 4개 스텝 완료마다 레벨 업
- **축하 팝업**: 모든 단계 완료 시 축하 메시지 및 엠블럼 부여
- **진행 상황**: 우측 상단에 "Step n/total" 및 프로그레스 바 표시
- **액션**: 복습하기(처음부터) 또는 다음 레벨로 진행

## 🛠️ 기술 스택

### 프론트엔드
- **Framework**: Vue 3 (Composition API) + TypeScript
- **Editor**: Monaco Editor
- **Runtime**: WebContainers (StackBlitz)
- **Database**: PGlite (PostgreSQL in WASM)
- **Styling**: Tailwind CSS + SCSS
- **Build Tool**: Vite

### 백엔드
- **Framework**: Express.js + TypeScript
- **API**: RESTful API (Prisma → SQL 변환)
- **Runtime**: Node.js
- **Build Tool**: tsx (TypeScript 실행)

## 📦 설치 및 실행

### 전체 프로젝트 (프론트엔드 + 백엔드)

```bash
# 모든 의존성 설치 (프론트엔드 + 백엔드)
npm run install:all

# 프론트엔드와 백엔드 동시 실행
npm run dev:all
```

### 프론트엔드만 실행

```bash
# 프론트엔드 디렉토리에서
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview
```

### 백엔드만 실행

```bash
# 백엔드 디렉토리로 이동
cd server

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 타입 체크
npm run type-check
```

## 🏗️ 프로젝트 구조

```
study-editor/
├── src/                              # 프론트엔드 (Vue 3)
│   ├── components/
│   │   └── learning-environment/
│   │       ├── LearningEnvironment.vue
│   │       ├── ContentPanel.vue
│   │       ├── CodeEditor.vue
│   │       └── ConsolePanel.vue
│   ├── composables/
│   │   ├── use-curriculum.ts
│   │   ├── use-runtime.ts
│   │   └── use-validator.ts
│   ├── data/
│   │   └── curriculum-steps.ts
│   ├── types/
│   │   ├── curriculum.d.ts
│   │   └── runtime.d.ts
│   ├── styles/
│   │   └── main.scss
│   ├── App.vue
│   └── main.ts
├── server/                           # 백엔드 (Express.js)
│   ├── index.ts                      # Express 서버 진입점
│   ├── utils/                        # 백엔드 전용 유틸리티
│   │   ├── prisma-schema-parser.ts   # Prisma 스키마 파싱
│   │   └── sql-generator.ts          # SQL 생성
│   ├── package.json                  # 백엔드 의존성
│   └── tsconfig.json                 # 백엔드 TypeScript 설정
└── package.json                      # 프론트엔드 의존성
```

## 🎓 사용 방법

1. 애플리케이션 실행 시 Step 1부터 시작
2. 좌측 패널에서 이론과 미션 확인
3. 우측 에디터에서 코드 작성
4. '정답 확인' 버튼으로 검증
5. 통과 시 다음 단계로 진행

## 🔧 주요 설정

### Vite 설정

WebContainers 사용을 위해 COOP/COEP 헤더가 설정되어 있습니다:

```typescript
server: {
  headers: {
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin'
  }
}
```

## 📝 개발 가이드

### 새로운 학습 단계 추가

`src/data/curriculum-steps.ts`에 새로운 CurriculumStep 객체를 추가:

```typescript
{
  id: 'step-5',
  title: '단계 제목',
  order: 5,
  category: 'create',
  content: {
    mission: '미션 설명',
    theory: '이론 내용',
    objectives: ['목표1', '목표2']
  },
  initialFiles: [/* 파일 템플릿 */],
  validator: {
    staticChecks: [/* 정적 검증 */],
    dynamicChecks: [/* 동적 검증 */]
  },
  hints: [/* 힌트 */]
}
```

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

## 📄 라이선스

MIT
