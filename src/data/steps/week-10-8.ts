import type { CurriculumStep } from '@/types/curriculum'
import { codeNote } from './interview-shared'

const LONG_TITLE = `${'a'.repeat(59)} bc`

export const week_10_8: CurriculumStep = {
  id: 'week-10-8',
  title: '면접 1주차 · AI 가 만든 코드 검증하기 — 게시글 URL 슬러그',
  order: 319,
  category: 'advanced',
  content: {
    mission: 'AI 코딩 도구가 만든 그럴듯한 코드를 그대로 받아들이지 않고, 검증 기준을 먼저 정해 문제를 찾고 고친 뒤 머지 여부를 판단합니다.',
    theory: `
## 면접 질문: "AI 코딩 도구가 만든 코드를 어떻게 검증하고 받아들이나요?"

**평가 의도**: 직접 쓰지 않은 코드를 비판적으로 검증하는 습관

## 검증 순서

1. **기준을 먼저 정한다** — 코드를 읽기 전에 "이 입력엔 이 결과"를 적는다. 코드를 먼저 보면 그 코드에 맞춰 생각하게 된다.
2. **설명할 수 없는 줄은 머지하지 않는다** — 정규식 한 줄이라도 왜 그렇게 동작하는지 말할 수 있어야 한다.
3. **AI 가 자주 놓치는 곳을 따로 본다**
   - 영어 외의 입력 (한글, 이모지)
   - 경계 조건 (빈 문자열, 최대 길이, 앞뒤 공백)
   - 에러 처리, 보안 (입력 검증, 이스케이프)
4. **테스트를 끄거나 경고를 무시해서 통과시킨 변경이 없는지** 확인한다.

## 면접관이 보는 신호

| 좋은 신호 (+) | 위험 신호 (−) |
|---|---|
| 이해한 만큼만 받아들인다 | "돌아가면 그냥 씁니다" |
| 테스트와 타입을 안전망으로 쓴다 | AI 를 전혀 써 보지 않아 비교할 경험이 없다 |
| 그럴듯하게 틀린 사례를 구체적으로 말한다 | 검증 방법을 "꼼꼼히 봅니다"로만 말한다 |

**꼬리 질문**: "AI 가 그럴듯하게 틀린 코드를 만들었던 사례가 있나요?"
    `,
    objectives: [
      '코드를 보기 전에 검증 기준(입력과 기대 결과)을 정한다',
      'AI 코드의 문제(한글 손실, 연속·끝 하이픈, 길이 자르기, 빈 결과)를 찾아 고친다',
      '머지 판단과 그 이유를 설명한다'
    ],
    exercise: `
**상황**
블로그 글 제목으로 URL 슬러그를 만드는 함수를 AI 코딩 도구에게 맡겼고, 아래 코드를 받았습니다. 영어 제목으로 몇 번 해 보니 잘 동작해서 동료가 바로 머지하려고 합니다. 이 블로그의 글 대부분은 한글 제목입니다.

**요구사항** (\`slugify(title: string)\`)
1. 소문자로 바꾸고, 앞뒤 공백을 제거합니다.
2. **한글을 포함한** 문자와 숫자는 남기고, 그 외 문자가 하나 이상 이어지면 하이픈(\`-\`) **하나**로 바꿉니다.
3. 결과의 앞뒤에 하이픈이 남지 않아야 합니다.
4. 최대 60자입니다. 60자로 자른 뒤에도 끝에 하이픈이 남지 않아야 합니다.
5. 결과가 비면 \`'untitled'\` 를 반환합니다.

예: \`'정규식 완전 정복'\` → \`'정규식-완전-정복'\`, \`'  Vue 3 & React!  '\` → \`'vue-3-react'\`

**생각해 보기** (\`//\` 주석으로 작성)
- \`// 먼저 정한 검증 기준:\` 코드를 읽기 전에 정한 입력과 기대 결과
- \`// AI 코드에서 찾은 문제:\` 찾은 문제들
- \`// 머지 판단:\` 동료에게 뭐라고 말할지
    `.trim(),
    expectedOutput: 'AI 생성 코드 검증 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      language: 'typescript',
      content: `// 먼저 정한 검증 기준:
// AI 코드에서 찾은 문제:
// 머지 판단:

// AI 코딩 도구가 만든 코드입니다. 검증하고 고치세요.
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60);
}
`
    }
  ],
  validator: {
    staticChecks: [
      codeNote('index.ts', '먼저 정한 검증 기준', '코드를 읽기 전에 정한 입력과 기대 결과를 // 먼저 정한 검증 기준: 주석으로 적어야 합니다.'),
      codeNote('index.ts', 'AI 코드에서 찾은 문제', '찾은 문제를 // AI 코드에서 찾은 문제: 주석으로 적어야 합니다.'),
      codeNote('index.ts', '머지 판단', '동료에게 전할 머지 판단을 // 머지 판단: 주석으로 적어야 합니다.')
    ],
    dynamicChecks: [],
    functionTests: [
      {
        target: 'index.ts',
        functionName: 'slugify',
        cases: [
          { description: '영어 제목', args: ['Hello World'], expected: 'hello-world' },
          { description: '한글 제목을 지우지 않음', args: ['정규식 완전 정복'], expected: '정규식-완전-정복' },
          { description: '앞뒤 공백과 특수문자, 끝 하이픈 제거', args: ['  Vue 3 & React!  '], expected: 'vue-3-react' },
          { description: '연속된 기호는 하이픈 하나로', args: ['Next.js 14 — App Router'], expected: 'next-js-14-app-router' },
          { description: '60자로 자른 뒤 끝 하이픈 제거', args: [LONG_TITLE], expected: 'a'.repeat(59) },
          { description: '기호만 있으면 untitled', args: ['!!!'], expected: 'untitled' },
          { description: '빈 제목은 untitled', args: [''], expected: 'untitled' }
        ]
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '`[^a-z0-9]` 는 한글을 "그 외 문자"로 봅니다. 유니코드 속성 `\\p{L}`(문자)과 `\\p{N}`(숫자)을 쓰려면 정규식에 `u` 플래그가 필요합니다. 앞뒤 하이픈 제거는 자르기 전과 후에 모두 해야 합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- // 먼저 정한 검증 기준:, // AI 코드에서 찾은 문제:, // 머지 판단: 주석
- slugify 함수 테스트 7개 (영어, 한글, 공백·끝 하이픈, 연속 기호, 60자 자르기, 기호만, 빈 제목)`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 먼저 정한 검증 기준: '정규식 완전 정복' → '정규식-완전-정복', '  Vue 3 & React!  ' → 'vue-3-react', '!!!' → 'untitled', 60자 경계에서 끝 하이픈 없음
// AI 코드에서 찾은 문제: 한글을 모두 하이픈으로 바꿈, 앞뒤 공백·기호가 하이픈으로 남음, 자른 뒤 끝 하이픈, 빈 결과 처리 없음
// 머지 판단: 영어 제목만 확인돼서 머지하지 않고, 한글·경계 테스트를 추가한 수정본으로 다시 올리자고 제안합니다.
const MAX_LENGTH = 60;

function trimHyphens(value: string): string {
  return value.replace(/^-+|-+$/g, '');
}

export function slugify(title: string): string {
  const slug = trimHyphens(
    title
      .trim()
      .toLowerCase()
      .replace(/[^\\p{L}\\p{N}]+/gu, '-')
  );
  const cut = trimHyphens(slug.slice(0, MAX_LENGTH));
  return cut || 'untitled';
}
`
    }
  ]
}
