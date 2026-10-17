import type { CurriculumStep } from '@/types/curriculum'

export const week_4_2_p3: CurriculumStep = {
  id: 'week-4-2-p3',
  title: '3주차 · 연습 ③ 인덱스 설계 (@@index) — 복합 인덱스 컬럼 순서',
  order: 60,
  category: 'advanced',
  content: {
    mission:
      '`WHERE userId = ? ORDER BY createdAt DESC` 쿼리에 `(userId, createdAt)` 과 `(createdAt, userId)` 중 어느 쪽이 유리한지, 컬럼 순서가 중요한 이유와 함께 `//` 주석으로 적으세요. 주석에 `(userId, createdAt)` 표기와 `왼쪽`(또는 `선행`) 컬럼이라는 표현을 포함하세요.',
    theory: `
      ## 복습: 인덱스 설계

      - \`@@index([a, b])\` 복합 인덱스는 **왼쪽(선행) 컬럼부터** 사용됩니다.
      - \`WHERE userId = ? ORDER BY createdAt\` 에는 \`(userId, createdAt)\` 순서가 유리합니다 (filesort 회피).
      - \`@@unique([a, b])\` 는 조합의 유일성과 인덱스를 함께 제공합니다.
      - \`LIKE 'abc%'\` 는 인덱스를 탈 수 있지만 \`LIKE '%abc'\` 는 탈 수 없습니다.
    `,
    objectives: [
      '선행 컬럼과 정렬 이점 이해',
      '직전 스텝(인덱스 설계 (@@index))의 내용을 스스로 적용하기'
    ],
    expectedOutput: '복합 인덱스 컬럼 순서 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'schema.prisma',
      path: 'prisma/schema.prisma',
      language: 'prisma',
      content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String
  posts Post[]

  @@index([email])
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  userId    Int
  createdAt DateTime @default(now())
  author    User     @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
  // TODO: 아래에 이 문제의 풀이를 작성하세요.
}
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /\/\/[^\n]*\(\s*userId\s*,\s*createdAt\s*\)/,
        message: '유리한 인덱스 (userId, createdAt) 을 // 주석에 적어야 합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /\/\/[^\n]*(왼쪽|선행)/,
        message: '복합 인덱스는 왼쪽(선행) 컬럼부터 쓰인다는 설명을 // 주석으로 적어야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: unknown) => Boolean((result as { success?: boolean }).success),
        message: '코드가 정상적으로 분석되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '`//` 주석에 `(userId, createdAt)` 이 유리하다고 쓰고 `왼쪽`(또는 `선행`) 컬럼 규칙을 설명하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- 유리한 인덱스 (userId, createdAt) 을 // 주석에 적어야 합니다.
- 복합 인덱스는 왼쪽(선행) 컬럼부터 쓰인다는 설명을 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// (userId, createdAt) 이 유리합니다: userId 로 먼저 좁히고 인덱스 순서대로 createdAt 정렬을 얻어 filesort 를 피합니다.
// 복합 인덱스는 왼쪽(선행) 컬럼부터 사용되므로 컬럼 순서가 중요합니다.
`
    }
  ]
}
