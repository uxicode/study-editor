import type { CurriculumStep } from '@/types/curriculum'

export const week_3_2_p3: CurriculumStep = {
  id: 'week-3-2-p3',
  title: '2주차 · 연습 ③ Prisma 모델 정의와 MySQL 매핑 — @db.VarChar 로 타입 지정',
  order: 36,
  category: 'schema',
  content: {
    mission:
      '`Tag` 모델을 만들고 `name String @unique @db.VarChar(50)` 로 MySQL 컬럼 타입을 명시하세요. `@db.VarChar` 가 없을 때 MySQL 에서 `String` 의 기본 길이(숫자)를 `//` 주석으로 적으세요.',
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
      '네이티브 DB 타입 지정과 기본 매핑 이해',
      '직전 스텝(Prisma 모델 정의와 MySQL 매핑)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '@db.VarChar 로 타입 지정 — 모든 채점 항목 통과'
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
        pattern: /model\s+Tag\s*\{[^}]*\bname\s+String\s+@unique\s+@db\.VarChar\(\s*50\s*\)/,
        message: 'Tag 에 name String @unique @db.VarChar(50) 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /\/\/[^\n]*191/,
        message: 'MySQL 에서 String 의 기본 길이를 // 주석으로 적어야 합니다.'
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
      content: '`name String @unique @db.VarChar(50)` 로 쓰고, `@db.VarChar` 가 없을 때 MySQL 의 String 기본 길이(숫자)를 `//` 주석에 적으세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- Tag 에 name String @unique @db.VarChar(50) 이 필요합니다.
- MySQL 에서 String 의 기본 길이를 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `model Tag {
  id   Int    @id @default(autoincrement())
  // @db.VarChar 가 없으면 MySQL 에서 String 은 기본 VARCHAR(191) 로 매핑됩니다.
  name String @unique @db.VarChar(50)
}
`
    }
  ]
}
