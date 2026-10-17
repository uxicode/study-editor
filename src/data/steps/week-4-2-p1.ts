import type { CurriculumStep } from '@/types/curriculum'

export const week_4_2_p1: CurriculumStep = {
  id: 'week-4-2-p1',
  title: '3주차 · 연습 ① 인덱스 설계 (@@index) — 복합 유니크 @@unique',
  order: 58,
  category: 'advanced',
  content: {
    mission:
      '`Post` 모델에 `@@unique([userId, title])` 복합 유니크를 추가하세요. 같은 사용자가 같은 제목의 글을 두 번 쓸 수 없게 됩니다.',
    theory: `
      ## 복습: 인덱스 설계

      - \`@@index([a, b])\` 복합 인덱스는 **왼쪽(선행) 컬럼부터** 사용됩니다.
      - \`WHERE userId = ? ORDER BY createdAt\` 에는 \`(userId, createdAt)\` 순서가 유리합니다 (filesort 회피).
      - \`@@unique([a, b])\` 는 조합의 유일성과 인덱스를 함께 제공합니다.
      - \`LIKE 'abc%'\` 는 인덱스를 탈 수 있지만 \`LIKE '%abc'\` 는 탈 수 없습니다.
    `,
    objectives: [
      '조합의 유일성을 스키마로 표현',
      '직전 스텝(인덱스 설계 (@@index))의 내용을 스스로 적용하기'
    ],
    expectedOutput: '복합 유니크 @@unique — 모든 채점 항목 통과'
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
        pattern: /@@unique\(\s*\[\s*userId\s*,\s*title\s*\]\s*\)/,
        message: '@@unique([userId, title]) 이 필요합니다.'
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
      content: '`Post` 모델 안에 `@@unique([userId, title])` 을 추가합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- @@unique([userId, title]) 이 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `@@unique([userId, title])
`
    }
  ]
}
