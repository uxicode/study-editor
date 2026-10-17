import type { CurriculumStep } from '@/types/curriculum'

export const week_4_5_p2: CurriculumStep = {
  id: 'week-4-5-p2',
  title: '3주차 · 연습 ② EXPLAIN 으로 슬로우 쿼리 분석 — 함수가 인덱스를 막는 경우',
  order: 71,
  category: 'advanced',
  content: {
    mission:
      '`WHERE LOWER(email) = \'a@a.com\'` 처럼 컬럼에 함수를 씌우면 인덱스를 못 쓰는 이유와 해결책을 `--` 주석으로 적으세요. 주석에 `LOWER` 와 `소문자`(또는 `함수`) 를 포함합니다.',
    theory: `
      ## 복습: EXPLAIN 읽기

      | 컬럼 | 의미 |
      |------|------|
      | type  | ALL(풀 스캔) < index < range < ref < const |
      | key   | 실제 사용한 인덱스 |
      | rows  | 검사할 것으로 추정되는 행 수 |
      | Extra | \`Using filesort\` 는 별도 정렬이 필요하다는 뜻 |

      - 컬럼에 함수를 씌우면(\`LOWER(email)\`) 그 컬럼의 인덱스를 쓰지 못합니다.
      - \`WHERE a = ? ORDER BY b\` 에는 \`(a, b)\` 복합 인덱스가 filesort 를 없애줍니다.
    `,
    objectives: [
      'LOWER(email) 이 인덱스를 못 쓰는 이유',
      '직전 스텝(EXPLAIN 으로 슬로우 쿼리 분석)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '함수가 인덱스를 막는 경우 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- 참고: posts(user_id, created_at, ...) 와 users(email, name, ...) 테이블이 있다고 가정합니다.
-- users.email 에는 인덱스가 있고 name 에는 없습니다.

-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*LOWER/i,
        message: 'LOWER(email) 이 인덱스를 못 쓰는 이유를 -- 주석으로 적어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(소문자|함수)/,
        message: '해결책(소문자 저장 / 함수 없는 비교)을 -- 주석으로 적어야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: unknown) => Boolean((result as { success?: boolean }).success),
        message: 'SQL 이 정상적으로 분석되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '주석에 `LOWER` 가 인덱스를 못 쓰는 이유를, 다른 줄에 `소문자` 로 저장하거나 `함수` 없이 비교하는 해결책을 적으세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- LOWER(email) 이 인덱스를 못 쓰는 이유를 -- 주석으로 적어야 합니다.
- 해결책(소문자 저장 / 함수 없는 비교)을 -- 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- WHERE LOWER(email) = ... 처럼 컬럼에 함수를 씌우면 인덱스를 사용하지 못합니다.
-- 해결: 저장할 때 소문자로 통일하고 함수 없이 비교하거나, 함수 기반 인덱스를 만듭니다.
`
    }
  ]
}
