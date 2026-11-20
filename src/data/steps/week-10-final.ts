import type { CurriculumStep } from '@/types/curriculum'
import { codeNote } from './interview-shared'

export const week_10_final: CurriculumStep = {
  id: 'week-10-final',
  title: '면접 1주차 종합 · 모의 라이브 코딩 — 검색 자동완성 순위',
  order: 305,
  category: 'advanced',
  content: {
    mission: '확인 질문 → 접근 → 구현 → 복잡도 → 검증까지, 라이브 코딩 면접 한 판을 처음부터 끝까지 스스로 진행합니다.',
    theory: `
## 모의 라이브 코딩 (제한 시간 30분 권장)

이번 스텝은 1주차에서 연습한 흐름을 한 번에 사용합니다. 타이머를 켜고, **소리 내어 말하면서** 풀어 보세요.

| 시간 | 할 일 | 주석으로 남길 것 |
|---|---|---|
| 0 ~ 5분 | 문제 다시 말하기, 확인 질문 | \`// 확인 질문:\` |
| 5 ~ 10분 | 예시로 규칙 맞추기, 접근 설명 | \`// 접근:\` |
| 10 ~ 25분 | 구현 | |
| 25 ~ 30분 | 복잡도와 엣지 케이스 검증 | \`// 복잡도:\` \`// 엣지 케이스:\` |

## 접근을 설명하는 문장 틀

> "결과를 두 그룹으로 나누겠습니다. 접두어로 시작하는 것과, 중간에 포함된 것입니다.
> 각 그룹은 원래 순서를 유지하고, 앞 그룹을 먼저 이어 붙인 뒤 개수를 자릅니다."

구현 전에 이렇게 말하면, 면접관이 방향이 틀렸을 때 **코드를 다 치기 전에** 바로잡아 줄 수 있습니다.

## 웹 맥락: 자동완성에서 자주 받는 꼬리 질문

- "입력할 때마다 호출하면 서버 부담이 크지 않나요?" → debounce, 캐시
- "항목이 100만 개라면?" → 서버 검색, 트라이(Trie) 또는 검색 엔진 인덱스
- "한글 초성 검색은?" → 정규화 단계를 따로 두는 설계
    `,
    objectives: [
      '확인 질문과 접근 방법을 구현 전에 정리한다',
      '접두어 일치 → 포함 일치 순서, 대소문자 무시, 중복 제거, 개수 제한을 구현한다',
      '복잡도와 엣지 케이스를 설명한다'
    ],
    exercise: `
**상황**
쇼핑몰 검색창의 자동완성 목록이 "입력한 글자로 시작하는 상품" 보다 "중간에 포함된 상품" 을 먼저 보여 줘서 불편하다는 의견이 많습니다. 면접관이 이 순위 함수를 직접 만들어 보라고 합니다.

**요구사항** (\`rankSuggestions(query: string, items: string[], limit: number)\`)
1. 검색어는 앞뒤 공백을 제거하고, 대소문자를 구분하지 않고 비교합니다. 검색어가 비어 있으면 \`[]\` 입니다.
2. 검색어로 **시작하는** 항목을 먼저, 그다음 **중간에 포함된** 항목을 보여 줍니다. 각 그룹 안에서는 원래 순서를 유지합니다.
3. 대소문자만 다른 같은 항목은 처음 나온 하나만 남깁니다. (원래 표기 그대로 반환)
4. 최대 \`limit\` 개만 반환합니다. \`limit\` 이 1보다 작으면 \`[]\` 입니다.

**생각해 보기** (\`//\` 주석으로 작성)
- \`// 확인 질문:\` 면접관에게 확인할 내용
- \`// 접근:\` 구현 전에 말로 설명할 풀이 방향
- \`// 복잡도:\` 시간 복잡도
- \`// 엣지 케이스:\` 따로 신경 쓴 입력
    `.trim(),
    expectedOutput: '검색 자동완성 순위 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      language: 'typescript',
      content: `// 확인 질문:
// 접근:
// 복잡도:
// 엣지 케이스:
export function rankSuggestions(query: string, items: string[], limit: number): string[] {
  // 요구사항에 맞는 자동완성 목록을 반환하세요.
  return [];
}
`
    }
  ],
  validator: {
    staticChecks: [
      codeNote('index.ts', '확인 질문', '면접관에게 확인할 내용을 // 확인 질문: 주석으로 적어야 합니다.'),
      codeNote('index.ts', '접근', '구현 전에 설명할 풀이 방향을 // 접근: 주석으로 적어야 합니다.'),
      codeNote('index.ts', '복잡도', '시간 복잡도를 // 복잡도: 주석으로 적어야 합니다.'),
      codeNote('index.ts', '엣지 케이스', '신경 쓴 입력을 // 엣지 케이스: 주석으로 적어야 합니다.')
    ],
    dynamicChecks: [],
    functionTests: [
      {
        target: 'index.ts',
        functionName: 'rankSuggestions',
        cases: [
          {
            description: '접두어 일치가 먼저, 개수 제한',
            args: ['re', ['Vue', 'React', 'Preact', 'Redux', 'Remix'], 3],
            expected: ['React', 'Redux', 'Remix']
          },
          {
            description: '접두어 그룹 뒤에 포함 그룹',
            args: ['re', ['Vue', 'React', 'Preact', 'Redux', 'Remix'], 10],
            expected: ['React', 'Redux', 'Remix', 'Preact']
          },
          {
            description: '검색어 공백 제거와 대소문자 무시',
            args: ['  RE ', ['Vue', 'React', 'Preact', 'Redux'], 2],
            expected: ['React', 'Redux']
          },
          {
            description: '빈 검색어',
            args: ['   ', ['React'], 5],
            expected: []
          },
          {
            description: '일치 항목 없음',
            args: ['x', ['Vue', 'React'], 5],
            expected: []
          },
          {
            description: '대소문자만 다른 중복은 처음 것만',
            args: ['re', ['React', 'react', 'Preact', 'REACT'], 5],
            expected: ['React', 'Preact']
          },
          {
            description: 'limit 이 1보다 작으면 빈 배열',
            args: ['re', ['React'], 0],
            expected: []
          }
        ]
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '한 번 훑으면서 `prefix` 배열과 `contains` 배열에 나눠 담고, 이미 담은 소문자 값은 Set 으로 걸러 내세요. 마지막에 `[...prefix, ...contains].slice(0, limit)` 로 합치면 됩니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- // 확인 질문:, // 접근:, // 복잡도:, // 엣지 케이스: 주석
- rankSuggestions 함수 테스트 7개 (순위, 개수 제한, 정규화, 빈 검색어, 일치 없음, 중복, limit)`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 확인 질문: 같은 그룹 안의 순서(원래 순서 vs 가나다순), 중복 판단 기준, limit 이 0 일 때 동작을 확인했습니다.
// 접근: 한 번 훑으면서 접두어 그룹과 포함 그룹에 나눠 담고, 소문자 값으로 중복을 거른 뒤 이어 붙여 자릅니다.
// 복잡도: 항목 n 개, 평균 길이 m 일 때 시간 O(n·m), 공간 O(n)
// 엣지 케이스: 공백뿐인 검색어, limit 0, 대소문자만 다른 중복, 검색어가 항목보다 긴 경우
export function rankSuggestions(query: string, items: string[], limit: number): string[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword || limit < 1) return [];

  const seen: Set<string> = new Set();
  const prefix: string[] = [];
  const contains: string[] = [];

  for (const item of items) {
    const lower = item.toLowerCase();
    if (seen.has(lower)) continue;

    if (lower.startsWith(keyword)) {
      prefix.push(item);
      seen.add(lower);
    } else if (lower.includes(keyword)) {
      contains.push(item);
      seen.add(lower);
    }
  }

  return [...prefix, ...contains].slice(0, limit);
}
`
    }
  ]
}
