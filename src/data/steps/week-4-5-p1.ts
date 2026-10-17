import type { CurriculumStep } from '@/types/curriculum'

export const week_4_5_p1: CurriculumStep = {
  id: 'week-4-5-p1',
  title: '3주차 · 연습 ① EXPLAIN 으로 슬로우 쿼리 분석 — ORDER BY 와 filesort',
  order: 70,
  category: 'advanced',
  content: {
    mission:
      '`EXPLAIN SELECT * FROM posts WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;` 을 작성하고, 인덱스가 없을 때 `Extra` 에 나타나는 `filesort` 를 `--` 주석으로 언급하며 `(user_id, created_at)` 인덱스가 있을 때와 어떻게 달라질지 적으세요.',
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
      '정렬 쿼리의 EXPLAIN 예측',
      '직전 스텝(EXPLAIN 으로 슬로우 쿼리 분석)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'ORDER BY 와 filesort — 모든 채점 항목 통과'
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
        pattern: /EXPLAIN\s+SELECT[^;]*FROM\s+posts[^;]*WHERE\s+user_id\s*=\s*1[^;]*ORDER\s+BY\s+created_at\s+DESC[^;]*LIMIT\s+10/i,
        message: 'EXPLAIN SELECT ... FROM posts WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*filesort/i,
        message: 'filesort 에 대한 예상을 -- 주석으로 적어야 합니다.'
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
      content: '`EXPLAIN SELECT * FROM posts WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;` 와 `-- ... filesort ...` 주석.'
    },
    {
      level: 2,
      content: `채점 항목:
- EXPLAIN SELECT ... FROM posts WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10 이 필요합니다.
- filesort 에 대한 예상을 -- 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `EXPLAIN SELECT * FROM posts WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;
-- 인덱스가 없으면 type=ALL(풀 스캔)에 Extra 에 filesort 가 나타나고, (user_id, created_at) 인덱스가 있으면 type=ref 로 filesort 없이 처리됩니다.
`
    }
  ]
}
