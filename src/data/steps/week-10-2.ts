import type { CurriculumStep } from '@/types/curriculum'
import { codeNote } from './interview-shared'

export const week_10_2: CurriculumStep = {
  id: 'week-10-2',
  title: '면접 1주차 · 무식한 풀이에서 개선까지 — 중복 가입 이메일 찾기',
  order: 302,
  category: 'advanced',
  content: {
    mission: '먼저 떠오르는 단순한 풀이를 말로 설명하고, 그 복잡도를 근거로 더 나은 풀이로 개선하는 과정을 보여 줍니다.',
    theory: `
## "일단 되는 풀이"를 먼저 말해도 됩니다

면접에서 최적해가 바로 떠오르지 않는 것은 감점이 아닙니다. 감점은 **아무 말 없이 멈춰 있는 것**입니다.

1. **무식한 풀이(Brute Force)를 말로 제시** — "모든 쌍을 비교하면 됩니다. 이중 반복이라 O(n²) 입니다."
2. **병목을 짚기** — "회원이 10만 명이면 50억 번 비교라 배치 작업에서도 느립니다."
3. **개선 아이디어** — "이미 본 값을 Set 에 기록하면, 한 번만 훑어도 됩니다. O(n) 입니다."
4. **트레이드오프 언급** — "대신 Set 에 최대 n 개를 저장하므로 메모리를 O(n) 더 씁니다."

## 복잡도를 말하는 문장 틀

> "시간은 O(\\_\\_) 입니다. 왜냐하면 \\_\\_ 을 한 번씩만 보기 때문입니다.
> 공간은 O(\\_\\_) 입니다. \\_\\_ 을 저장하기 때문입니다."

## 웹 서비스에서 자주 나오는 정규화

이메일은 사람이 입력하므로 **앞뒤 공백**과 **대소문자**가 섞여 들어옵니다.
"같은 이메일" 의 기준을 정하는 것도 문제 해결의 일부이므로, 면접관에게 확인하거나 정한 기준을 선언하세요.
    `,
    objectives: [
      '처음 떠올린 풀이와 그 복잡도를 설명한다',
      'Set/Map 으로 이미 본 값을 기록해 O(n) 으로 개선한다',
      '입력값 정규화(공백, 대소문자)를 요구사항으로 다룬다'
    ],
    exercise: `
**상황**
회원 데이터 이관 중, 같은 사람이 이메일 대소문자만 바꿔 여러 번 가입한 계정이 발견됐습니다. 운영팀이 "중복된 이메일 목록만 뽑아 달라"고 요청했습니다. 회원 수는 약 10만 명입니다.

**요구사항** (\`findDuplicateEmails(emails: string[])\`)
1. 앞뒤 공백을 제거하고 소문자로 바꾼 값이 같으면 같은 이메일입니다.
2. 두 번 이상 나온 이메일을 **소문자로** 반환합니다. 같은 이메일은 결과에 한 번만 넣습니다.
3. 결과 순서는 "두 번째로 등장해 중복이 확인된 순서" 입니다.
4. 중복이 없으면 빈 배열을 반환합니다.
5. 이미 본 이메일은 \`Set\` 또는 \`Map\` 으로 기록해 한 번만 훑으세요.

**생각해 보기** (\`//\` 주석으로 작성)
- \`// 처음 떠올린 방법:\` 이중 반복 같은 단순한 풀이와 그 시간 복잡도
- \`// 개선한 방법:\` 무엇을 기록해서 반복을 줄였는지
- \`// 복잡도:\` 개선한 풀이의 시간·공간 복잡도
    `.trim(),
    expectedOutput: '중복 가입 이메일 찾기 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      language: 'typescript',
      content: `// 처음 떠올린 방법:
// 개선한 방법:
// 복잡도:
export function findDuplicateEmails(emails: string[]): string[] {
  // 중복 가입된 이메일 목록을 반환하세요.
  return [];
}
`
    }
  ],
  validator: {
    staticChecks: [
      codeNote('index.ts', '처음 떠올린 방법', '처음 떠올린 단순한 풀이와 복잡도를 // 처음 떠올린 방법: 주석으로 적어야 합니다.'),
      codeNote('index.ts', '개선한 방법', '무엇을 기록해 개선했는지 // 개선한 방법: 주석으로 적어야 합니다.'),
      codeNote('index.ts', '복잡도', '개선한 풀이의 시간·공간 복잡도를 // 복잡도: 주석으로 적어야 합니다.'),
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /new\s+(?:Set|Map)\b/,
        message: '이미 본 이메일을 Set 또는 Map 으로 기록해 한 번만 훑어야 합니다.'
      }
    ],
    dynamicChecks: [],
    functionTests: [
      {
        target: 'index.ts',
        functionName: 'findDuplicateEmails',
        cases: [
          { description: '대소문자만 다른 이메일은 중복', args: [['a@x.com', 'b@x.com', 'A@x.com']], expected: ['a@x.com'] },
          { description: '빈 목록', args: [[]], expected: [] },
          { description: '중복이 없으면 빈 배열', args: [['a@x.com', 'b@x.com']], expected: [] },
          {
            description: '공백 제거, 결과는 한 번만, 확인된 순서대로',
            args: [['b@x.com', 'a@x.com', ' a@x.com ', 'a@x.com', 'B@X.COM']],
            expected: ['a@x.com', 'b@x.com']
          }
        ]
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '`seen` (한 번 본 이메일)과 `reported` (이미 결과에 넣은 이메일) 두 개의 Set 을 두면, 한 번의 반복으로 끝낼 수 있습니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- // 처음 떠올린 방법:, // 개선한 방법:, // 복잡도: 주석
- Set 또는 Map 사용
- findDuplicateEmails 함수 테스트 4개 (대소문자, 빈 목록, 중복 없음, 공백·순서)`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 처음 떠올린 방법: 모든 쌍을 이중 반복으로 비교하면 O(n²) 이라 10만 명이면 약 50억 번 비교합니다.
// 개선한 방법: 한 번 본 이메일을 Set 에 기록해 두고, 다시 나오면 중복으로 판단해 한 번만 훑습니다.
// 복잡도: 시간 O(n), 공간 O(n) (seen 과 reported Set 에 최대 n 개 저장)
export function findDuplicateEmails(emails: string[]): string[] {
  const seen: Set<string> = new Set();
  const reported: Set<string> = new Set();
  const result: string[] = [];

  for (const email of emails) {
    const normalized = email.trim().toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      continue;
    }
    if (!reported.has(normalized)) {
      reported.add(normalized);
      result.push(normalized);
    }
  }

  return result;
}
`
    }
  ]
}
