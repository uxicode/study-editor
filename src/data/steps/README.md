# Curriculum Steps

이 디렉토리는 학습 커리큘럼의 각 단계를 개별 파일로 관리합니다.

## 파일 구조

```
src/data/
├── curriculum-steps.ts          # 메인 export (재export만 수행)
└── steps/
    ├── index.ts                 # 모든 step을 import하여 배열로 결합
    ├── step-1.ts                # Step 1: Prisma 초기 설정
    ├── step-2-1.ts              # Step 2-1: User 모델 정의 (기본)
    ├── step-2-2.ts              # Step 2-2: User 모델 정의 (타임스탬프)
    ├── step-2-3.ts              # Step 2-3: User 모델 정의 (실무 기능)
    ├── step-3.ts                # Step 3: Create - 사용자 생성
    ├── step-4-1.ts              # Step 4-1: Read - 기본 조회 메서드
    ├── step-4-2.ts              # Step 4-2: Read - 정렬과 필드 선택
    └── step-4-3.ts              # Step 4-3: Read - 페이징과 복합 쿼리
```

## 새로운 단계 추가하기

1. **새 파일 생성**
   ```bash
   touch src/data/steps/step-5.ts
   ```

2. **step 파일 작성**
   ```typescript
   import type { CurriculumStep } from '@/types/curriculum'

   export const step_5: CurriculumStep = {
     id: 'step-5',
     title: '새로운 단계',
     order: 9,
     category: 'update',
     content: {
       mission: '미션 설명',
       theory: '이론 내용',
       objectives: ['목표1', '목표2']
     },
     initialFiles: [/* 파일 목록 */],
     validator: {/* 검증 로직 */},
     hints: [/* 힌트 목록 */]
   }
   ```

3. **index.ts에 import 추가**
   ```typescript
   import { step_5 as step5 } from './step-5'
   
   export const CURRICULUM_STEPS: CurriculumStep[] = [
     // ... 기존 steps
     step5
   ]
   ```

## 장점

### 1. **유지보수성**
- 각 step을 독립적으로 수정 가능
- 파일이 작아서 찾기 쉽고 편집하기 쉬움

### 2. **확장성**
- 새로운 step 추가가 간단
- 병합 충돌 최소화

### 3. **가독성**
- 한 파일에 한 step만 집중
- 코드 리뷰가 용이

### 4. **성능**
- 필요한 step만 선택적으로 import 가능 (향후 lazy loading 대비)

## 주의사항

- step 파일의 export 이름은 `step_X` 형식 (언더스코어)
- index.ts에서 import 시 `as stepX` (camelCase)로 alias 지정
- order 값은 중복되지 않도록 주의
