import type { CurriculumStep } from '@/types/curriculum'

export const week_4_2: CurriculumStep = {
  id: 'week-4-2',
  title: '4주차 · 인덱스 설계 (@@index)',
  order: 20,
  category: 'advanced',
  content: {
    mission:
      'Prisma 스키마에 두 개의 인덱스를 추가하세요: `User.email` 단일 인덱스와 `Post(userId, createdAt)` 복합 인덱스.',
    theory: `
      ## 인덱스란

      특정 컬럼에 대해 **정렬된 사본** 을 별도로 유지하여 검색을 빠르게 만드는 자료구조 (보통 B+Tree).

      ## Prisma 의 두 가지 인덱스 attribute

      \`\`\`prisma
      model User {
        id    Int    @id @default(autoincrement())
        email String

        @@index([email])
      }

      model Post {
        id        Int      @id @default(autoincrement())
        userId    Int
        createdAt DateTime @default(now())

        @@index([userId, createdAt])
      }
      \`\`\`

      ## 단일 vs 복합

      - 단일 \`@@index([email])\` — 이메일로 자주 검색할 때
      - 복합 \`@@index([userId, createdAt])\` — "특정 사용자의 글을 최신순으로" 와 같은 패턴에 효과

      ## 인덱스의 비용

      - 쓰기 비용 ↑ (INSERT / UPDATE 때 인덱스도 갱신)
      - 디스크 공간 ↑
      - 그러므로 자주 사용하는 검색 패턴에만 신중히 추가
    `,
    objectives: [
      '@@index 의 단일 / 복합 형태',
      '복합 인덱스의 컬럼 순서 의미 이해',
      '인덱스의 비용·이득 트레이드오프'
    ],
    exercise: `
1. \`User\` 모델에 \`@@index([email])\` 을 추가하세요.
2. \`Post\` 모델에 \`@@index([userId, createdAt])\` 복합 인덱스를 추가하세요.
    `.trim(),
    expectedOutput: '@@index 선언 2개'
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
  // TODO: @@index([email]) 을 추가하세요.
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  userId    Int
  createdAt DateTime @default(now())
  author    User     @relation(fields: [userId], references: [id])
  // TODO: @@index([userId, createdAt]) 을 추가하세요.
}
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /@@index\(\s*\[\s*email\s*\]\s*\)/,
        message: 'User 모델에 @@index([email]) 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /@@index\(\s*\[\s*userId\s*,\s*createdAt\s*\]\s*\)/,
        message: 'Post 모델에 @@index([userId, createdAt]) 이 필요합니다.'
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
      content: '@@index 는 model 블록 내부, 필드 정의 아래에 적습니다.'
    },
    {
      level: 2,
      content: '복합 인덱스에서 컬럼 순서가 중요합니다. WHERE 절에서 자주 나오는 컬럼을 앞에 배치하세요.'
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `model User {
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
}
`
    }
  ]
}
