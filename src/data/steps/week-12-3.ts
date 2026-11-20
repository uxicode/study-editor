import type { CurriculumStep } from '@/types/curriculum'
import { mdList, mdSection } from './interview-shared'

const FILE = 'review.md'

const PULL_REQUEST_CODE = `// PR #128 — 회원 검색 컴포넌트 추가 (작성자: 입사 2개월 차 동료)
import { useEffect, useState } from 'react'

export function UserSearch({ keyword }: { keyword: string }) {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetch(\`/api/users?q=\${keyword}\`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
  }, [])

  return (
    <ul className="user-list">
      {users.map((user, i) => (
        <li key={i}>{user.name}</li>
      ))}
    </ul>
  )
}
`

export const week_12_3: CurriculumStep = {
  id: 'week-12-3',
  title: '면접 3주차 · 코드 리뷰 코멘트 쓰기 — 회원 검색 컴포넌트 PR',
  order: 313,
  category: 'advanced',
  content: {
    mission: '동료의 PR 을 읽고, 심각도를 구분하고 이유와 대안을 담은 리뷰 코멘트를 작성합니다.',
    theory: `
## 코드 리뷰는 "협업 능력"을 가장 직접 보여 줍니다

최근 면접에서는 코드를 주고 "이 PR 에 리뷰를 남겨 보세요" 라고 하는 경우가 늘고 있습니다.
버그를 찾는 눈과 **그것을 전달하는 방식**을 함께 봅니다.

## 심각도를 태그로 구분하기

| 태그 | 의미 | 머지 전에 |
|---|---|---|
| **[필수]** | 버그, 보안, 데이터 손상 | 반드시 수정 |
| **[제안]** | 더 나은 방법, 가독성, 성능 | 작성자가 판단 |
| **[질문]** | 의도를 모르겠음 | 답변 후 결정 |

모든 코멘트가 같은 무게로 보이면, 작성자는 무엇부터 고쳐야 할지 모릅니다.

## 좋은 코멘트의 3요소: 무엇이 · 왜 · 어떻게

- ❌ "이거 이상한데요."
- ✅ "[필수] \`useEffect\` 의존성 배열이 비어 있어서 **keyword 가 바뀌어도 다시 검색하지 않습니다.** \`[keyword]\` 를 넣어 주세요."

## 사람이 아니라 코드에 대해

- ❌ "왜 에러 처리를 안 하셨어요?"
- ✅ "응답이 실패하면 화면이 빈 채로 멈출 것 같아요. \`res.ok\` 확인과 에러 상태를 추가하면 어떨까요?"

## 좋았던 점도 적기

잘한 점을 짚는 것은 예의가 아니라 **정보**입니다. "이 패턴은 유지해 주세요" 라는 신호가 됩니다.
특히 입사 초기 동료에게는 리뷰가 학습 경험이 되도록 쓰는 것이 시니어의 역할입니다.
    `,
    objectives: [
      'PR 에서 버그(의존성 배열, 에러 처리, 인코딩)와 개선점(any, key, 경쟁 상태)을 찾는다',
      '[필수] / [제안] / [질문] 태그로 심각도를 구분한다',
      '이유와 대안이 담긴 코멘트, 좋았던 점, 요약을 적는다'
    ],
    exercise: `
**상황**
입사 2개월 차 동료가 회원 검색 컴포넌트 PR 을 올렸습니다. 읽기 전용 파일 \`UserSearch.tsx\` 가 PR 의 코드입니다. 면접관이 "이 PR 에 리뷰를 남겨 주세요" 라고 합니다.

**요구사항** (\`review.md\` 에 작성)
1. \`## 요약\` — PR 전체에 대한 한두 문장 의견 (머지 가능 여부 포함)
2. \`## 코멘트\` — 리뷰 코멘트 **3개 이상**. 각 항목은 \`- [필수]\`, \`- [제안]\`, \`- [질문]\` 중 하나로 시작합니다.
3. \`[필수]\` 코멘트가 **1개 이상** 있어야 합니다. (머지 전에 꼭 고쳐야 할 버그)
4. 응답 실패(에러) 처리에 대한 코멘트가 있어야 합니다.

**생각해 보기** (\`## 좋았던 점\` 섹션으로 작성)
- 이 PR 에서 유지했으면 하는 점을 **1개 이상** 목록으로 적어 주세요.
    `.trim(),
    expectedOutput: '회원 검색 PR 코드 리뷰 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'UserSearch.tsx',
      path: 'UserSearch.tsx',
      language: 'typescript',
      readonly: true,
      content: PULL_REQUEST_CODE
    },
    {
      name: FILE,
      path: FILE,
      language: 'markdown',
      content: `# PR #128 리뷰 — 회원 검색 컴포넌트

## 요약 <!-- 전체 의견, 머지 가능 여부 -->

## 코멘트 <!-- 3개 이상, "- [필수]" / "- [제안]" / "- [질문]" 으로 시작 -->

## 좋았던 점 <!-- 1개 이상 -->
`
    }
  ],
  validator: {
    staticChecks: [
      mdSection(FILE, '요약', '## 요약 아래에 PR 전체에 대한 의견과 머지 가능 여부를 적어야 합니다.'),
      mdList(FILE, '코멘트', 3, '## 코멘트 아래에 [필수] / [제안] / [질문] 태그로 시작하는 코멘트를 3개 이상 적어야 합니다.', {
        itemPrefix: String.raw`\[(?:필수|제안|질문)\]`
      }),
      {
        type: 'regex',
        target: FILE,
        pattern: /^[ \t]*[-*][ \t]+\[필수\]/m,
        message: '머지 전에 꼭 고쳐야 할 버그를 [필수] 코멘트로 1개 이상 남겨야 합니다.'
      },
      {
        type: 'regex',
        target: FILE,
        pattern: /^[ \t]*[-*][ \t]+\[(?:필수|제안|질문)\][^\n]*(?:에러|오류|실패|catch|res\.ok)/im,
        message: '요청이 실패했을 때(에러) 처리가 없다는 코멘트가 있어야 합니다.'
      },
      mdList(FILE, '좋았던 점', 1, '## 좋았던 점 아래에 유지했으면 하는 점을 1개 이상 적어야 합니다.')
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`useEffect` 의 의존성 배열, `fetch` 뒤의 실패 처리, URL 에 그대로 붙인 `keyword`, `any` 타입, `key={i}`, 그리고 빠르게 타이핑할 때 늦게 도착한 응답이 최신 결과를 덮어쓰는 문제를 차례로 살펴보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- ## 요약: 15자 이상의 문장
- ## 코멘트: [필수]/[제안]/[질문] 으로 시작하는 목록 3개 이상
- [필수] 코멘트 1개 이상
- 에러(실패) 처리에 대한 코멘트
- ## 좋았던 점: 목록 1개 이상`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `# PR #128 리뷰 — 회원 검색 컴포넌트

## 요약
컴포넌트를 작게 나눠 주셔서 읽기 편했습니다. 다만 검색어가 바뀌어도 다시 검색하지 않는 버그가 있어, 아래 [필수] 항목을 고친 뒤 머지하면 좋겠습니다.

## 코멘트
- [필수] useEffect 의존성 배열이 [] 라서 keyword 가 바뀌어도 다시 검색하지 않습니다. [keyword] 를 넣어 주세요.
- [필수] 요청이 실패하면(네트워크 오류, 500 응답) 화면이 빈 목록으로 멈춥니다. res.ok 를 확인하고, 에러 상태와 안내 문구를 추가해 주세요.
- [필수] keyword 를 URL 에 그대로 붙이면 & 나 # 이 들어간 검색어에서 쿼리가 깨집니다. encodeURIComponent(keyword) 로 감싸 주세요.
- [제안] 빠르게 타이핑하면 늦게 도착한 이전 응답이 최신 결과를 덮어쓸 수 있습니다. AbortController 로 이전 요청을 취소하거나 debounce 를 적용하면 어떨까요?
- [제안] any[] 대신 User 타입({ id: number; name: string })을 정의하면 user.name 오타를 컴파일 단계에서 잡을 수 있습니다.
- [질문] 목록 순서가 바뀔 수 있다면 key={i} 대신 user.id 를 쓰는 게 안전할 것 같은데, id 가 응답에 포함되나요?

## 좋았던 점
- 검색 결과 표시를 별도 컴포넌트로 분리해서 다른 화면에서도 재사용하기 쉽습니다.
- props 로 keyword 를 받아 검색 입력과 결과 표시의 책임을 나눈 구조가 좋습니다.
`
    }
  ]
}
