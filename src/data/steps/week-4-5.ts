import type { CurriculumStep } from '@/types/curriculum'

export const week_4_5: CurriculumStep = {
  id: 'week-4-5',
  title: '4주차 · EXPLAIN 으로 슬로우 쿼리 분석',
  order: 23,
  category: 'advanced',
  content: {
    mission:
      '`schema.sql` 에 두 개의 `EXPLAIN SELECT ...` 문을 작성하세요. 하나는 인덱스가 없는 컬럼(`name`)으로 조회, 다른 하나는 인덱스가 있는 컬럼(`email`)으로 조회하는 쿼리를 비교 분석합니다.',
    theory: `
      ## EXPLAIN

      MySQL 은 \`EXPLAIN\` 키워드로 **쿼리 실행 계획** 을 보여줍니다. 옵티마이저가 어떤 인덱스를 선택했는지, 몇 행을 훑을지 미리 예측할 수 있습니다.

      \`\`\`sql
      EXPLAIN SELECT * FROM users WHERE email = 'alice@example.com';
      \`\`\`

      ## 주요 출력 컬럼

      | 컬럼          | 의미                                          |
      |---------------|-----------------------------------------------|
      | type          | 접근 방식 (ALL = 풀스캔, ref = 인덱스 사용)   |
      | possible_keys | 사용할 수 있는 인덱스 목록                    |
      | key           | 옵티마이저가 실제로 선택한 인덱스             |
      | rows          | 추정 검색 행 수                               |

      ## 풀스캔 vs 인덱스 스캔

      - \`type: ALL\` 또는 \`Using filesort\`, \`Using temporary\` 가 보이면 인덱스가 없거나 부적절한 경우가 많습니다.
      - 이때 \`@@index\` 를 추가하거나, WHERE / ORDER BY 컬럼 조합에 맞는 복합 인덱스를 만듭니다.

      ## 슬로우 쿼리 로그
      운영에서는 \`slow_query_log\` 를 켜서 임계 시간을 넘는 쿼리를 자동 수집하고, 주기적으로 \`EXPLAIN\` 으로 분석합니다.

      이 학습 환경에서는 실제 EXPLAIN 을 실행하지 않고 SQL 키워드만 검증합니다.
    `,
    objectives: [
      'EXPLAIN 의 역할 이해',
      '풀스캔과 인덱스 스캔의 차이',
      '슬로우 쿼리 진단의 첫 단계 익히기'
    ],
    exercise: `
1. \`schema.sql\` 에 두 개의 \`EXPLAIN SELECT\` 문을 작성하세요.
2. 하나는 \`name\` 컬럼(인덱스 없음), 다른 하나는 \`email\` 컬럼(인덱스 있음)을 WHERE 절에 사용합니다.
3. 두 EXPLAIN 결과를 비교했을 때 어떤 차이가 예상되는지 SQL 주석으로 간단히 적어 보세요.
    `.trim(),
    expectedOutput: 'EXPLAIN 2회 사용'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- 참고: users 테이블에 email 컬럼에는 인덱스가 있고, name 에는 없다고 가정합니다.

-- TODO: name 으로 조회하는 EXPLAIN SELECT 를 작성하세요.

-- TODO: email 로 조회하는 EXPLAIN SELECT 를 작성하세요.

-- TODO: 두 EXPLAIN 결과의 차이가 어떻게 나타날지 한 줄 주석으로 적어 보세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /EXPLAIN\s+SELECT[\s\S]*WHERE\s+name\s*=/i,
        message: 'name 컬럼을 사용하는 EXPLAIN SELECT 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /EXPLAIN\s+SELECT[\s\S]*WHERE\s+email\s*=/i,
        message: 'email 컬럼을 사용하는 EXPLAIN SELECT 가 필요합니다.'
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
      content: '`EXPLAIN` 은 SELECT 문 앞에 그냥 붙이면 됩니다.'
    },
    {
      level: 2,
      content: '실제 환경에서는 `EXPLAIN ANALYZE` (MySQL 8.0+) 로 실행 시간까지 함께 측정할 수 있습니다.'
    },
    {
      level: 3,
      content: '정답 SQL 예시입니다.',
      codeSnippet: `-- 인덱스가 없는 컬럼: 풀스캔(type: ALL) 예상
EXPLAIN SELECT * FROM users WHERE name = 'Alice';

-- 인덱스가 있는 컬럼: 인덱스 사용(type: ref) 예상
EXPLAIN SELECT * FROM users WHERE email = 'alice@example.com';

-- 두 쿼리는 type / rows 컬럼에서 차이가 보인다.
`
    }
  ]
}
