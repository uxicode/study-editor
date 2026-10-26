# Curriculum Steps

백엔드 코어 학습 커리큘럼은 3주차 · 총 76스텝(1주차 28 · 2주차 24 · 3주차 24)으로 구성되며, 각 스텝은 독립된 파일로 관리합니다. 기본 스텝 19개마다 직후에 "연습 스텝" 3개(`week-{n}-{k}-p1` ~ `-p3`)가 이어집니다.

## 파일 구조

```
src/data/
├── curriculum-steps.ts          # CURRICULUM_STEPS 배열과 LEVEL_STEP_COUNTS export
└── steps/
    ├── week-2-1.ts ~ week-2-5.ts # 1주차 · MySQL DDL
    ├── week-2-6.ts              # 1주차 · 기본 쿼리 (INSERT · SELECT · JOIN)
    ├── week-2-final.ts          # 1주차 종합 · 게시판 스키마
    ├── week-3-1.ts ~ week-3-5.ts # 2주차 · Prisma ORM / 레이어드 아키텍처
    ├── week-3-final.ts          # 2주차 종합 · Fastify + Prisma 사용자 API
    ├── week-4-1.ts ~ week-4-5.ts # 3주차 · 트랜잭션 / 인덱스 / 성능
    └── week-4-final.ts          # 3주차 종합 · 페이징 · 인덱스 · 트랜잭션
```

## 연습 스텝 (`-p1` ~ `-p3`)

- 기본 스텝을 마친 뒤 문제 하나씩 풀며 확인하는 스텝입니다. 예: `week-2-4` → `week-2-4-p1`, `-p2`, `-p3`.
- 각 연습 스텝은 자기 문제 하나만 `staticChecks` 로 채점하며, 초기 파일은 기본 스텝을 마친 상태에서 시작합니다.
- 힌트 1 = 접근 방법, 힌트 2 = 채점 항목 목록, 힌트 3 = 정답 예시.
- `id` 가 `week-{n}-` 로 시작해야 주차 판별 / 로그인 잠금 로직이 동작합니다.

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
- `order` 는 커리큘럼 내에서 고유한 정수(백엔드 1~19)로, 학습 순서를 결정합니다.
- 파일 종류: `server.ts` (Fastify), `schema.prisma` (Prisma), `schema.sql` (MySQL DDL), `queries.sql` (MySQL DML), `*.repository.ts` / `*.service.ts` (레이어드 아키텍처).
- 학습은 **mock 기반** 으로 검증되므로 `validator.staticChecks` 가 핵심입니다.
- `content.localPractice` (선택) 는 로컬 MySQL 에서 같은 내용을 직접 실행해 보는 마크다운 가이드입니다. 채점 대상이 아니며 콘텐츠 패널에 "로컬 MySQL로 직접 해보기" 섹션으로 표시됩니다. 환경 준비는 `week-2-1` 에 있습니다.
- 알고리즘/함수형 스텝은 `validator.functionTests` 로 사용자 함수를 실제 인자로 호출해 검증합니다.
- `dynamicChecks` 는 인터페이스 일관성을 위해 최소 1개를 둘 수 있습니다.
