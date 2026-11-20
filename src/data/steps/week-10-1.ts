import type { CurriculumStep } from '@/types/curriculum'
import { codeNote } from './interview-shared'

export const week_10_1: CurriculumStep = {
  id: 'week-10-1',
  title: '면접 1주차 · 문제를 다시 말하고 질문하기 — 쿼리 문자열 파싱',
  order: 301,
  category: 'advanced',
  content: {
    mission: '라이브 코딩 면접에서 바로 코드를 치지 않고, 요구사항을 확인하는 질문과 엣지 케이스를 먼저 정리한 뒤 `parseQuery` 를 구현합니다.',
    theory: `
## 면접관이 보는 것은 "정답"보다 "푸는 과정"입니다

소프트웨어 엔지니어링 면접은 크게 세 가지를 봅니다.

| 평가 영역 | 면접관의 질문 | 이 커리큘럼 |
|---|---|---|
| **문제 해결** | 모호한 문제를 스스로 좁히고, 검증 가능한 답을 만드는가? | 1주차 |
| **작업 구조화** | 큰 일을 쪼개고, 우선순위와 위험을 설명할 수 있는가? | 2주차 |
| **의사소통 · 협업** | 생각을 말로 정리하고, 동료와 의견을 맞출 수 있는가? | 3주차 |

## 라이브 코딩 5단계

1. **문제 다시 말하기** — "제가 이해한 게 맞는지 확인하겠습니다. 입력은 ~, 출력은 ~ 입니다."
2. **확인 질문** — 입력의 범위, 잘못된 입력 처리, 중복, 대소문자 같은 애매한 부분을 묻습니다.
3. **예시로 확인** — 작은 입력 하나를 손으로 풀어 보며 규칙을 맞춥니다.
4. **구현** — 말하면서 칩니다. 막히면 막힌 지점을 말합니다.
5. **검증** — 처음 정한 예시와 엣지 케이스를 직접 대입해 봅니다.

> 1~3단계를 건너뛰고 바로 코드를 치는 것이 가장 흔한 감점 요인입니다.
> 질문 자체가 "실무에서 요구사항을 확인하는 습관"의 증거가 됩니다.

## 좋은 확인 질문의 예

- "같은 키가 여러 번 나오면 마지막 값만 남길까요, 배열로 모을까요?"
- "\`%20\` 같은 인코딩된 문자는 디코딩해서 돌려줄까요?"
- "값이 없는 키(\`?flag\`)는 어떻게 표현할까요?"

면접관이 "알아서 정하세요" 라고 하면, **정한 규칙을 말로 선언하고** 진행하면 됩니다.
    `,
    objectives: [
      '코드를 쓰기 전에 확인 질문과 엣지 케이스를 주석으로 정리한다',
      '같은 키 반복, 값 없는 키, 인코딩된 문자를 처리한다',
      '정한 규칙대로 동작하는지 테스트로 확인한다'
    ],
    exercise: `
**상황**
프론트엔드 라이브 코딩 면접입니다. 면접관이 "검색 페이지 URL 의 쿼리 문자열을 객체로 바꾸는 함수를 만들어 주세요" 라고만 말했습니다. 질문을 하자 아래와 같이 답해 주었습니다.

**요구사항** (\`parseQuery(search: string)\`)
1. 앞의 \`?\` 는 있어도 되고 없어도 됩니다. 빈 문자열이면 \`{}\` 를 반환합니다.
2. \`page=2&sort=new\` → \`{ page: '2', sort: 'new' }\` (값은 모두 문자열)
3. 같은 키가 여러 번 나오면 나온 순서대로 배열로 모읍니다. \`tag=a&tag=b\` → \`{ tag: ['a', 'b'] }\`
4. 값이 없는 키는 빈 문자열입니다. \`flag\`, \`a=\` → \`{ flag: '' }\`, \`{ a: '' }\`
5. \`%20\` 같은 인코딩은 디코딩하고, \`+\` 는 공백으로 바꿉니다. \`q=hello%20world+vue\` → \`{ q: 'hello world vue' }\`

**생각해 보기** (\`//\` 주석으로 작성)
- \`// 확인 질문:\` 위 규칙을 얻기 위해 면접관에게 했을 질문을 한 줄로 적어 주세요.
- \`// 엣지 케이스:\` 구현하면서 따로 신경 쓴 입력을 적어 주세요.
    `.trim(),
    expectedOutput: '쿼리 문자열 파싱 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      language: 'typescript',
      content: `// 확인 질문:
// 엣지 케이스:
export function parseQuery(search: string): Record<string, string | string[]> {
  // 쿼리 문자열을 객체로 바꿔 반환하세요.
  return {};
}
`
    }
  ],
  validator: {
    staticChecks: [
      codeNote('index.ts', '확인 질문', '코드를 쓰기 전에 면접관에게 할 확인 질문을 // 확인 질문: 주석으로 적어야 합니다.'),
      codeNote('index.ts', '엣지 케이스', '신경 쓴 엣지 케이스를 // 엣지 케이스: 주석으로 적어야 합니다.')
    ],
    dynamicChecks: [],
    functionTests: [
      {
        target: 'index.ts',
        functionName: 'parseQuery',
        cases: [
          { description: '기본 키=값 쌍', args: ['?page=2&sort=new'], expected: { page: '2', sort: 'new' } },
          { description: '앞의 ? 가 없어도 동작', args: ['page=2'], expected: { page: '2' } },
          { description: '빈 문자열은 빈 객체', args: [''], expected: {} },
          { description: '? 만 있으면 빈 객체', args: ['?'], expected: {} },
          { description: '같은 키는 배열로 모음', args: ['?tag=a&tag=b&tag=c'], expected: { tag: ['a', 'b', 'c'] } },
          { description: '값 없는 키는 빈 문자열', args: ['?flag&a=&b=1'], expected: { flag: '', a: '', b: '1' } },
          { description: '인코딩 디코딩과 + 공백 처리', args: ['?q=hello%20world+vue'], expected: { q: 'hello world vue' } }
        ]
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '앞의 `?` 를 떼고 `&` 로 나눈 뒤, 각 조각을 첫 번째 `=` 기준으로 키와 값으로 나누세요. 이미 있는 키를 만나면 배열로 바꿔 모으면 됩니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- // 확인 질문: 주석
- // 엣지 케이스: 주석
- parseQuery 함수 테스트 7개 (기본, ? 생략, 빈 입력, 같은 키 배열, 값 없는 키, 디코딩)`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 확인 질문: 같은 키가 반복되면 배열로 모을지, 값 없는 키와 + 기호는 어떻게 표현할지 확인했습니다.
// 엣지 케이스: 빈 문자열, ? 만 있는 입력, 값에 = 가 또 들어 있는 경우(a=b=c), 빈 조각(a=1&&b=2)
export function parseQuery(search: string): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  const query = search.startsWith('?') ? search.slice(1) : search;
  if (!query) return result;

  for (const part of query.split('&')) {
    if (!part) continue;
    const index = part.indexOf('=');
    const rawKey = index === -1 ? part : part.slice(0, index);
    const rawValue = index === -1 ? '' : part.slice(index + 1);
    const key = decodeURIComponent(rawKey.replace(/\\+/g, ' '));
    const value = decodeURIComponent(rawValue.replace(/\\+/g, ' '));

    const existing = result[key];
    if (existing === undefined) {
      result[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      result[key] = [existing, value];
    }
  }

  return result;
}
`
    }
  ]
}
