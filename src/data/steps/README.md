# Curriculum Steps

학습 커리큘럼은 4주차 · 주당 6스텝 = 총 24스텝으로 구성되며, 각 스텝은 독립된 파일로 관리합니다.

## 파일 구조

```
src/data/
├── curriculum-steps.ts          # CURRICULUM_STEPS 배열과 LEVEL_STEP_COUNTS export
└── steps/
    ├── week-1-1.ts              # 1주차 · Fastify 부트스트랩
    ├── week-1-2.ts              # 1주차 · 라우트 핸들러와 reply
    ├── week-1-3.ts              # 1주차 · TypeScript 라우트 타입
    ├── week-1-4.ts              # 1주차 · JSON Schema 입력 검증
    ├── week-1-5.ts              # 1주차 · 플러그인과 데코레이터
    ├── week-1-final.ts          # 1주차 종합 · Todo API
    ├── week-2-1.ts ~ week-2-5.ts # 2주차 · MySQL DDL
    ├── week-2-final.ts          # 2주차 종합 · 게시판 스키마
    ├── week-3-1.ts ~ week-3-5.ts # 3주차 · Prisma ORM / 레이어드 아키텍처
    ├── week-3-final.ts          # 3주차 종합 · Fastify + Prisma 사용자 API
    ├── week-4-1.ts ~ week-4-5.ts # 4주차 · 트랜잭션 / 인덱스 / 성능
    └── week-4-final.ts          # 4주차 종합 · 페이징 · 인덱스 · 트랜잭션
```

## 새 스텝 추가하기

1. `src/data/steps/week-{n}-{k}.ts` 파일을 생성합니다.
2. 다음과 같이 `CurriculumStep` 을 export 합니다.

   ```ts
   import type { CurriculumStep } from '@/types/curriculum'

   export const week_5_1: CurriculumStep = {
     id: 'week-5-1',
     title: '5주차 · 새로운 주제',
     order: 25,
     category: 'advanced',
     content: { mission: '...', theory: '...', objectives: [...] },
     initialFiles: [/* ... */],
     validator: { staticChecks: [/* ... */], dynamicChecks: [/* ... */] },
     hints: [/* ... */]
   }
   ```

3. `src/data/curriculum-steps.ts` 의 import 와 `CURRICULUM_STEPS` 배열, 그리고 `LEVEL_STEP_COUNTS` 에 새 주차의 개수를 추가합니다.

## 규약

- `id` 는 파일명과 동일 (`week-3-2.ts` ↔ `id: 'week-3-2'`).
- `order` 는 1~24 사이의 고유한 정수로, 학습 순서를 결정합니다.
- 파일 종류: `server.ts` (Fastify), `schema.prisma` (Prisma), `schema.sql` (MySQL DDL), `*.repository.ts` / `*.service.ts` (레이어드 아키텍처).
- 학습은 **mock 기반** 으로 검증되므로 `validator.staticChecks` 가 핵심입니다.
- 알고리즘/함수형 스텝은 `validator.functionTests` 로 사용자 함수를 실제 인자로 호출해 검증합니다.
- `dynamicChecks` 는 인터페이스 일관성을 위해 최소 1개를 둘 수 있습니다.
