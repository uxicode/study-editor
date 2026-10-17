import type { CurriculumStep } from '@/types/curriculum'

export const week_4_2_p2: CurriculumStep = {
  id: 'week-4-2-p2',
  title: '3주차 · 연습 ② 인덱스 설계 (@@index) — title 인덱스와 LIKE',
  order: 59,
  category: 'advanced',
  content: {
    mission:
      '`Post` 모델에 `@@index([title])` 를 추가하세요. `LIKE \'abc%\'` 는 인덱스를 타지만 `LIKE \'%abc\'` 는 타지 못하는 이유를 `LIKE` 라는 단어를 넣어 `//` 주석으로 적으세요.',
    theory: `
      ## 복습: 인덱스 설계

      - \`@@index([a, b])\` 복합 인덱스는 **왼쪽(선행) 컬럼부터** 사용됩니다.
      - \`WHERE userId = ? ORDER BY createdAt\` 에는 \`(userId, createdAt)\` 순서가 유리합니다 (filesort 회피).
      - \`@@unique([a, b])\` 는 조합의 유일성과 인덱스를 함께 제공합니다.
      - \`LIKE 'abc%'\` 는 인덱스를 탈 수 있지만 \`LIKE '%abc'\` 는 탈 수 없습니다.
    `,
    objectives: [
      'LIKE 접두 검색과 인덱스의 관계',
      '직전 스텝(인덱스 설계 (@@index))의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'title 인덱스와 LIKE — 모든 채점 항목 통과'
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
        pattern: /@@index\(\s*\[\s*title\s*\]\s*\)/,
        message: '@@index([title]) 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /\/\/[^\n]*LIKE/i,
        message: 'LIKE 검색과 인덱스의 관계를 // 주석으로 적어야 합니다.'
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
      content: '`@@index([title])` 를 추가하고, `//` 주석에 `LIKE \'abc%\'` 와 `LIKE \'%abc\'` 의 차이를 설명하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- @@index([title]) 이 필요합니다.
- LIKE 검색과 인덱스의 관계를 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `@@index([title])
// LIKE 'abc%' (접두 검색) 는 인덱스를 탈 수 있지만, LIKE '%abc' 는 앞부분이 정해지지 않아 전체를 스캔합니다.
`
    }
  ]
}
