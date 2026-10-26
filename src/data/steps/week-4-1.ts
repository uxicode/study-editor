import type { CurriculumStep } from '@/types/curriculum'

export const week_4_1: CurriculumStep = {
  id: 'week-4-1',
  title: '3주차 · 트랜잭션 ($transaction)',
  order: 53,
  category: 'advanced',
  content: {
    mission:
      '`prisma.$transaction([...])` 을 사용하여 "사용자 생성 + 첫 글 작성" 을 원자적으로 처리하세요. 두 작업 중 하나라도 실패하면 모두 롤백되어야 합니다.',
    theory: `
      ## 트랜잭션이란

      여러 SQL 작업을 **"전부 성공" 또는 "전부 실패"** 한 단위로 묶는 메커니즘입니다. 은행 이체처럼 둘 중 하나만 반영되면 데이터가 깨지는 케이스에 필수입니다.

      ## Prisma 의 두 가지 트랜잭션 API

      ### 1) Array 트랜잭션 (간단)

      \`\`\`ts
      const [user, post] = await prisma.$transaction([
        prisma.user.create({ data: { email: 'a@b.c' } }),
        prisma.post.create({ data: { title: 'hello', authorId: 1 } })
      ])
      \`\`\`

      ### 2) Interactive 트랜잭션 (조건 분기 가능)

      \`\`\`ts
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data: {...} })
        await tx.post.create({ data: { authorId: user.id, ... } })
      })
      \`\`\`

      ## ACID 짧은 요약

      - **A**tomic — 트랜잭션은 더 이상 쪼개지지 않음
      - **C**onsistent — 시작 / 종료 상태 모두 제약을 만족
      - **I**solated — 동시에 실행되어도 결과가 직렬 실행과 동등
      - **D**urable — 커밋된 변경은 영속화됨
    `,
    objectives: [
      '$transaction 의 두 형태 이해',
      '원자성 확보의 의미',
      '트랜잭션이 필요한 시점 식별'
    ],
    exercise: `
1. \`server.ts\` 에서 \`prisma.$transaction([...])\` 호출을 작성하세요.
2. 배열 안에는 \`prisma.user.create\` 와 \`prisma.post.create\` 두 가지가 포함되어야 합니다.
    `.trim(),
    expectedOutput: '$transaction 호출 발견',
    localPractice: `트랜잭션은 **롤백이 실제로 일어나는 것을 봐야** 이해됩니다. 먼저 \`mysql\` 클라이언트에서 직접 해보세요.

\`\`\`sql
SELECT @@autocommit;           -- 1 (문장마다 자동 커밋)
START TRANSACTION;
INSERT INTO users (email, name) VALUES ('tx@test.com', 'TX');
SELECT * FROM users;           -- 내 세션에서는 보임
ROLLBACK;
SELECT * FROM users;           -- 사라짐
\`\`\`

**두 세션 비교** — 터미널 두 개로 각각 접속하세요.

1. 세션 A: \`START TRANSACTION;\` 후 \`INSERT\` (아직 \`COMMIT\` 하지 않음)
2. 세션 B: \`SELECT * FROM users;\` → A 의 행이 **보이지 않습니다**
3. 세션 A: \`COMMIT;\` → 세션 B 에서 이제 보입니다.

**Prisma 로 롤백 확인**

\`prisma.$transaction([...])\` 안의 두 번째 작업이 실패하도록 (\`authorId: 9999\` 처럼 없는 사용자) 만들고 실행하세요. \`P2003\` 에러와 함께 **첫 번째 \`create\` 도 반영되지 않았는지** \`SELECT\` 로 확인하세요.
    `.trim()
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
  email String @unique
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}
`
    },
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // TODO: $transaction 에 user 생성과 post 생성을 배열로 묶어 전달하세요.
}

main().finally(() => prisma.$disconnect())
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.\$transaction\s*\(/,
        message: 'prisma.$transaction 호출이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.user\.create\s*\(/,
        message: '$transaction 내부에 prisma.user.create 가 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.post\.create\s*\(/,
        message: '$transaction 내부에 prisma.post.create 가 포함되어야 합니다.'
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
      content: '`$transaction` 의 인자는 **배열** 이거나 **콜백 함수** 입니다.'
    },
    {
      level: 2,
      content: '배열 형태는 단순하지만, 첫 번째 결과(user)를 두 번째 호출(post)에 사용하려면 콜백 형태가 더 자연스럽습니다.'
    },
    {
      level: 3,
      content: '정답 예시입니다 (배열 형태).',
      codeSnippet: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 배열 형태는 앞 작업의 결과(user.id)를 참조할 수 없어 authorId 를 미리 알아야 합니다.
  // 생성된 user.id 를 써야 한다면 Interactive 트랜잭션(콜백 형태)을 사용하세요.
  await prisma.$transaction([
    prisma.user.create({ data: { email: 'tx@example.com' } }),
    prisma.post.create({ data: { title: 'first post', authorId: 1 } })
  ])
}

main().finally(() => prisma.$disconnect())
`
    }
  ]
}
