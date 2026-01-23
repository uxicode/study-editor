# 기여 가이드

이 프로젝트에 기여해주셔서 감사합니다!

## 개발 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd study-editor

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 프로젝트 구조

```
src/
├── components/          # Vue 컴포넌트
│   └── learning-environment/
├── composables/         # Vue Composition API 함수
├── data/               # 정적 데이터 (커리큘럼)
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
└── styles/             # 전역 스타일
```

## 새로운 학습 단계 추가하기

1. `src/data/curriculum-steps.ts`에 새로운 `CurriculumStep` 객체 추가
2. `initialFiles` 배열에 필요한 파일 템플릿 정의
3. `validator` 객체에 정적/동적 검증 로직 작성
4. `hints` 배열에 단계별 힌트 추가

### 예시

```typescript
{
  id: 'step-5',
  title: '새로운 단계',
  order: 5,
  category: 'create',
  content: {
    mission: '미션 설명',
    theory: '이론 내용',
    objectives: ['목표1', '목표2']
  },
  initialFiles: [
    {
      name: 'app.js',
      path: 'app.js',
      language: 'javascript',
      content: '// 코드를 작성하세요'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'prisma',
        message: 'Prisma를 사용해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: []
}
```

## 코드 스타일

- TypeScript strict mode 사용
- Vue 3 Composition API 사용
- 함수형 프로그래밍 스타일 선호
- 명확한 변수명 사용 (isLoading, hasError 등)

## 커밋 메시지

- `feat: 새로운 기능 추가`
- `fix: 버그 수정`
- `docs: 문서 수정`
- `style: 코드 포맷팅`
- `refactor: 코드 리팩토링`
- `test: 테스트 추가/수정`

## Pull Request

1. Feature 브랜치 생성
2. 변경사항 커밋
3. PR 생성 및 설명 작성
4. 코드 리뷰 대기

## 질문이나 제안

이슈를 생성해주세요!
