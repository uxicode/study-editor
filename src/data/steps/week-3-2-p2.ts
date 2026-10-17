import type { CurriculumStep } from '@/types/curriculum'

export const week_3_2_p2: CurriculumStep = {
  id: 'week-3-2-p2',
  title: '2주차 · 연습 ② Prisma 모델 정의와 MySQL 매핑 — role 필드와 이름 매핑',
  order: 35,
  category: 'schema',
  content: {
    mission:
      '`User` 모델에 `role String @default("user")` 를 추가하고, `@@map("users")` 와 `createdAt` 의 `@map("created_at")` 으로 1주차 DDL 의 이름 규약에 맞추세요.',
    theory: `
      ## 복습: Prisma 모델

      \`\`\`prisma
      model User {
        id        Int      @id @default(autoincrement())
        email     String   @unique
        name      String?
        role      String   @default("user")
        createdAt DateTime @default(now()) @map("created_at")

        @@map("users")
      }
      \`\`\`

      - \`?\` 는 NULL 허용, \`@default\` 는 기본값, \`@unique\` 는 UNIQUE.
      - \`@map\` / \`@@map\` 은 컬럼명 / 테이블명을 DB 이름에 맞춥니다.
      - \`@db.VarChar(50)\` 처럼 DB 컬럼 타입을 직접 지정할 수 있습니다.
    `,
    objectives: [
      '@default, @map, @@map 로 DB 이름 규약 맞추기',
      '직전 스텝(Prisma 모델 정의와 MySQL 매핑)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'role 필드와 이름 매핑 — 모든 채점 항목 통과'
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
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}

// TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /model\s+User\s*\{[^}]*\brole\s+String\s+@default\(\s*"user"\s*\)/,
        message: 'User 에 role String @default("user") 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /model\s+User\s*\{[^}]*\bcreatedAt\s+DateTime[^\n]*@map\(\s*"created_at"\s*\)/,
        message: 'User.createdAt 에 @map("created_at") 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /model\s+User\s*\{[^}]*@@map\(\s*"users"\s*\)/,
        message: 'User 에 @@map("users") 가 필요합니다.'
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
      content: '기존 `User` 모델을 수정하세요: `role String @default("user")`, `createdAt ... @map("created_at")`, 모델 끝에 `@@map("users")`.'
    },
    {
      level: 2,
      content: `채점 항목:
- User 에 role String @default("user") 가 필요합니다.
- User.createdAt 에 @map("created_at") 이 필요합니다.
- User 에 @@map("users") 가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      String   @default("user")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")
}
`
    }
  ]
}
