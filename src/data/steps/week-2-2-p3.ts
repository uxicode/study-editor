import type { CurriculumStep } from '@/types/curriculum'

export const week_2_2_p3: CurriculumStep = {
  id: 'week-2-2-p3',
  title: '1주차 · 연습 ③ 기본키와 자동증가 — AUTO_INCREMENT 번호의 재사용',
  order: 8,
  category: 'schema',
  content: {
    mission:
      '`users` 에 id 1, 2, 3 이 들어 있다가 3번 행을 `DELETE` 한 뒤 새로 `INSERT` 하면 새 행의 id 는 몇이 될지 SQL 주석으로 적으세요. 주석에 `재사용` 이라는 단어를 포함하세요.',
    theory: `
      ## 복습: 기본키와 AUTO_INCREMENT

      \`\`\`sql
      id INT AUTO_INCREMENT PRIMARY KEY
      \`\`\`

      - \`PRIMARY KEY\` 는 행을 유일하게 식별하며 NULL 과 중복을 허용하지 않습니다.
      - \`AUTO_INCREMENT\` 는 INSERT 때 자동으로 증가하는 번호를 붙입니다.
      - 삭제된 번호는 다시 쓰지 않고 계속 증가합니다.
    `,
    objectives: [
      '지운 id 가 재사용되지 않음을 이해',
      '직전 스텝(기본키와 자동증가)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'AUTO_INCREMENT 번호의 재사용 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(재사용|reuse)/i,
        message: 'AUTO_INCREMENT 번호가 재사용되지 않는다는 설명을 -- 주석으로 적어야 합니다.'
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
      content: 'id 1, 2, 3 중 3을 삭제한 뒤 새로 넣으면 4 가 됩니다. 주석에 `재사용` 이라는 단어를 넣어 설명하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- AUTO_INCREMENT 번호가 재사용되지 않는다는 설명을 -- 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 지워진 id 3 은 재사용되지 않으므로 새 행의 id 는 4 가 됩니다.
`
    }
  ]
}
