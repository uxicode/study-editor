import type { CurriculumStep } from '@/types/curriculum'

export const week_3_2: CurriculumStep = {
  id: 'week-3-2',
  title: '3주차 · Prisma 모델 정의와 MySQL 매핑',
  order: 14,
  category: 'schema',
  content: {
    mission:
      '`schema.prisma` 에 `User` 모델을 정의하세요. `id` 는 자동 증가 정수 기본키, `email` 은 유일, `name` 은 선택, `createdAt` 은 현재 시각 기본값을 가집니다.',
    theory: `
      ## 모델 정의

      \`\`\`prisma
      model User {
        id        Int      @id @default(autoincrement())
        email     String   @unique
        name      String?
        createdAt DateTime @default(now())
      }
      \`\`\`

      ## 자주 쓰는 attribute

      | attribute              | 의미 (MySQL 매핑)              |
      |------------------------|------------------------------|
      | \`@id\`                | PRIMARY KEY                  |
      | \`@default(autoincrement())\` | AUTO_INCREMENT          |
      | \`@unique\`            | UNIQUE                        |
      | \`@default(now())\`    | DEFAULT CURRENT_TIMESTAMP     |
      | \`?\` (nullable type)  | NULL 허용                     |

      ## 명명 규약

      - 모델명은 PascalCase (\`User\`, \`PostTag\`) — Prisma 가 자동으로 MySQL 의 \`users\` 등으로 매핑하거나 \`@@map\` 으로 직접 지정 가능
      - 필드명은 camelCase 가 권장
    `,
    objectives: [
      'Prisma 의 model 블록 구문 학습',
      '`@id`, `@unique`, `@default` 의미 이해',
      'Prisma 가 MySQL DDL 로 어떻게 매핑되는지 인지'
    ],
    exercise: `
1. \`schema.prisma\` 에 \`model User\` 블록을 추가하세요.
2. 필드: \`id Int @id @default(autoincrement())\`, \`email String @unique\`, \`name String?\`, \`createdAt DateTime @default(now())\` 를 모두 정의하세요.
    `.trim(),
    expectedOutput: 'model User { ... } 인식됨'
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

// TODO: model User 를 정의하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /model\s+User\s*\{/,
        message: 'model User 블록이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /id\s+Int\s+@id\s+@default\(autoincrement\(\)\)/,
        message: 'id 는 Int @id @default(autoincrement()) 여야 합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /email\s+String\s+@unique/,
        message: 'email 은 String @unique 여야 합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /name\s+String\?/,
        message: 'name 은 String? (nullable) 이어야 합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /createdAt\s+DateTime\s+@default\(now\(\)\)/,
        message: 'createdAt DateTime @default(now()) 가 필요합니다.'
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
      content: '필드는 한 줄에 `이름 타입 [attribute들]` 형태로 정의합니다.'
    },
    {
      level: 2,
      content: 'nullable 필드는 타입 뒤에 `?` 를 붙입니다. 예: `name String?`'
    },
    {
      level: 3,
      content: '정답 Prisma 스키마 예시입니다.',
      codeSnippet: `model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
`
    }
  ]
}
