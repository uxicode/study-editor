import type { CurriculumStep } from '@/types/curriculum'

export const week_3_2_p1: CurriculumStep = {
  id: 'week-3-2-p1',
  title: '2주차 · 연습 ① Prisma 모델 정의와 MySQL 매핑 — Post 모델 정의',
  order: 34,
  category: 'schema',
  content: {
    mission:
      '`Post` 모델을 추가하세요: `id Int @id @default(autoincrement())`, `title String`, `content String?`, `published Boolean @default(false)`, `createdAt DateTime @default(now())`.',
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
      'Boolean / 선택 필드 / 기본값을 가진 모델 정의',
      '직전 스텝(Prisma 모델 정의와 MySQL 매핑)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'Post 모델 정의 — 모든 채점 항목 통과'
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
        pattern: /model\s+Post\s*\{[^}]*\bid\s+Int\s+@id\s+@default\(autoincrement\(\)\)/,
        message: 'Post 에 id Int @id @default(autoincrement()) 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /model\s+Post\s*\{[^}]*\btitle\s+String\b/,
        message: 'Post 에 title String 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /model\s+Post\s*\{[^}]*\bcontent\s+String\?/,
        message: 'Post 에 content String? 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /model\s+Post\s*\{[^}]*\bpublished\s+Boolean\s+@default\(false\)/,
        message: 'Post 에 published Boolean @default(false) 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /model\s+Post\s*\{[^}]*\bcreatedAt\s+DateTime\s+@default\(now\(\)\)/,
        message: 'Post 에 createdAt DateTime @default(now()) 가 필요합니다.'
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
      content: '`content String?`, `published Boolean @default(false)`, `createdAt DateTime @default(now())` 를 포함합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- Post 에 id Int @id @default(autoincrement()) 가 필요합니다.
- Post 에 title String 이 필요합니다.
- Post 에 content String? 이 필요합니다.
- Post 에 published Boolean @default(false) 가 필요합니다.
- Post 에 createdAt DateTime @default(now()) 가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
}
`
    }
  ]
}
