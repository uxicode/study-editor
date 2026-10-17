import type { CurriculumStep } from '@/types/curriculum'

export const week_4_5_p3: CurriculumStep = {
  id: 'week-4-5-p3',
  title: '3주차 · 연습 ③ EXPLAIN 으로 슬로우 쿼리 분석 — 인덱스 생성 후 비교',
  order: 72,
  category: 'advanced',
  content: {
    mission:
      '`CREATE INDEX idx_posts_user_created ON posts (user_id, created_at);` 를 작성한 뒤 같은 `EXPLAIN` 을 다시 쓰고, 검사하는 `rows` 가 줄어들 것이라는 예상을 `--` 주석으로 적으세요.',
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
      'CREATE INDEX 후 EXPLAIN 재확인',
      '직전 스텝(EXPLAIN 으로 슬로우 쿼리 분석)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '인덱스 생성 후 비교 — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+INDEX\s+idx_posts_user_created\s+ON\s+posts\s*\(\s*user_id\s*,\s*created_at\s*\)/i,
        message: 'CREATE INDEX idx_posts_user_created ON posts (user_id, created_at) 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+INDEX[^;]*;[\s\S]*EXPLAIN\s+SELECT[^;]*FROM\s+posts/i,
        message: '인덱스 생성 후 EXPLAIN 을 다시 실행해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*rows[^\n]*(줄|감소)/i,
        message: 'rows 감소 예상을 -- 주석으로 적어야 합니다.'
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
      content: '`CREATE INDEX idx_posts_user_created ON posts (user_id, created_at);` 뒤에 같은 EXPLAIN 을 다시 쓰고 `rows` 감소 예상을 주석으로 적으세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- CREATE INDEX idx_posts_user_created ON posts (user_id, created_at) 이 필요합니다.
- 인덱스 생성 후 EXPLAIN 을 다시 실행해야 합니다.
- rows 감소 예상을 -- 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `CREATE INDEX idx_posts_user_created ON posts (user_id, created_at);
EXPLAIN SELECT * FROM posts WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10;
-- 인덱스 생성 후에는 검사하는 rows 가 크게 줄어듭니다.
`
    }
  ]
}
