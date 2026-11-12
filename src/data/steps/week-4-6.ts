import type { CurriculumStep } from '@/types/curriculum'

export const week_4_6: CurriculumStep = {
  id: 'week-4-6',
  title: '3주차 · Prisma 쿼리 ↔ SQL 대조',
  order: 73,
  category: 'read',
  content: {
    mission:
      '`queries.sql` 의 주석에 적힌 두 Prisma 호출이 MySQL 에 보내는 것과 같은 결과를 내는 `SELECT` 문을 각각 작성하세요. 테이블·컬럼 이름은 모델 이름이 아니라 `@@map` / `@map` 으로 매핑된 **DB 이름**(`users`, `posts`, `user_id`)을 씁니다.',
    theory: `
      ## ORM 도 결국 SQL 을 보낸다

      Prisma 의 모든 호출은 SQL 로 바뀌어 MySQL 에 전달됩니다. 실무에서 느린 API 를 디버깅하면 결국 **"ORM 이 무슨 SQL 을 만들었나"** 를 보게 됩니다.

      \`\`\`ts
      // 실행되는 SQL 을 콘솔에 출력
      const prisma = new PrismaClient({ log: ['query'] })
      \`\`\`

      ## 이 스텝의 모델

      \`\`\`prisma
      model User {
        id    Int    @id @default(autoincrement())
        email String @unique
        name  String
        role  String @default("user")
        posts Post[]

        @@map("users")
      }

      model Post {
        id        Int      @id @default(autoincrement())
        userId    Int      @map("user_id")
        title     String
        published Boolean  @default(false)
        createdAt DateTime @default(now()) @map("created_at")
        user      User     @relation(fields: [userId], references: [id])

        @@map("posts")
      }
      \`\`\`

      ## Prisma 옵션 → SQL 절 대응표

      | Prisma                                   | SQL                              |
      |------------------------------------------|----------------------------------|
      | \`prisma.user.findMany()\`               | \`SELECT ... FROM users\`        |
      | \`select: { id: true, email: true }\`    | \`SELECT id, email\`             |
      | \`where: { role: 'admin' }\`             | \`WHERE role = 'admin'\`         |
      | \`where: { title: { contains: 'SQL' } }\`| \`WHERE title LIKE '%SQL%'\`     |
      | \`where: { id: { in: [1, 2] } }\`        | \`WHERE id IN (1, 2)\`           |
      | \`orderBy: { id: 'desc' }\`              | \`ORDER BY id DESC\`             |
      | \`take: 10\`                             | \`LIMIT 10\`                     |
      | \`skip: 20\`                             | \`OFFSET 20\`                    |
      | \`prisma.post.count()\`                  | \`SELECT COUNT(*) FROM posts\`   |

      - \`select\` 를 생략하면 모델의 **모든 스칼라 필드**를 가져옵니다 (\`SELECT *\` 와 비슷).
      - 실제 로그에는 \`db.users.id\` 처럼 DB·테이블 이름이 붙은 컬럼과 \`?\` 바인딩 자리가 보입니다. 값은 별도로 전달되므로 SQL 인젝션에 안전합니다.
    `,
    objectives: [
      'Prisma 쿼리 옵션이 어떤 SQL 절로 바뀌는지 이해',
      '@@map / @map 때문에 모델 이름과 DB 이름이 다를 수 있음을 인지',
      "PrismaClient 의 log: ['query'] 로 실제 SQL 을 확인하는 방법 익히기"
    ],
    exercise: `
1. 첫 번째 Prisma 호출과 같은 결과를 내는 SELECT 를 작성하세요 (\`id\`, \`email\` 컬럼).
2. 두 번째 Prisma 호출과 같은 결과를 내는 SELECT 를 작성하세요 (\`id\` 컬럼을 포함).
3. 테이블은 \`users\`, \`posts\` 가 이미 있다고 가정합니다. CREATE TABLE 은 필요 없습니다.
    `.trim(),
    expectedOutput: '두 SELECT 의 실행 결과가 Prisma 호출 결과와 일치',
    localPractice: `로컬 프로젝트에서 \`log: ['query']\` 를 켜고 같은 호출을 실행해 보세요.

\`\`\`ts
const prisma = new PrismaClient({ log: ['query'] })

await prisma.post.findMany({
  where: { title: { contains: 'SQL' } },
  orderBy: { id: 'desc' },
  take: 3
})
\`\`\`

콘솔에 대략 이런 SQL 이 찍힙니다.

\`\`\`sql
SELECT \`study\`.\`posts\`.\`id\`, \`study\`.\`posts\`.\`user_id\`, ... FROM \`study\`.\`posts\`
WHERE \`study\`.\`posts\`.\`title\` LIKE ? ORDER BY \`study\`.\`posts\`.\`id\` DESC LIMIT ? OFFSET ?
\`\`\`

직접 쓴 SQL 과 비교해 보고, MySQL 에서 \`EXPLAIN\` 을 붙여 실행 계획도 확인해 보세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'queries.sql',
      path: 'queries.sql',
      language: 'sql',
      content: `-- 참고: users(id, email, name, role), posts(id, user_id, title, published, created_at) 테이블이 있다고 가정합니다.

-- ① prisma.user.findMany({
--      where: { role: 'admin' },
--      select: { id: true, email: true },
--      orderBy: { id: 'asc' }
--    })
-- TODO: 같은 결과를 내는 SELECT 를 작성하세요.


-- ② prisma.post.findMany({
--      where: { title: { contains: 'SQL' } },
--      orderBy: { id: 'desc' },
--      take: 3
--    })
-- TODO: 같은 결과를 내는 SELECT 를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /^\s*SELECT[\s\S]*FROM\s+users[\s\S]*WHERE\s+role\s*=\s*'admin'/im,
        message: "① users 에서 role = 'admin' 인 사용자의 id, email 을 id 오름차순으로 조회하는 SELECT 가 필요합니다."
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /^\s*SELECT[\s\S]*FROM\s+posts[\s\S]*LIKE\s*'%SQL%'[\s\S]*ORDER\s+BY\s+id\s+DESC[\s\S]*LIMIT\s+3/im,
        message: "② posts 에서 title 에 'SQL' 이 포함된 글을 id 내림차순으로 3개만 조회하는 SELECT 가 필요합니다."
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
      content: '`select` → SELECT 컬럼 목록, `where` → WHERE, `orderBy` → ORDER BY, `take` → LIMIT 로 하나씩 옮기면 됩니다.'
    },
    {
      level: 2,
      content: "`contains: 'SQL'` 은 `LIKE '%SQL%'` 입니다. 테이블 이름은 모델 이름(`User`)이 아니라 `@@map` 으로 정한 `users` / `posts` 를 씁니다."
    },
    {
      level: 3,
      content: '정답 SQL 예시입니다.',
      codeSnippet: `-- ① role 이 admin 인 사용자의 id, email
SELECT id, email
FROM users
WHERE role = 'admin'
ORDER BY id ASC;

-- ② 제목에 SQL 이 들어간 최신 글 3개
SELECT *
FROM posts
WHERE title LIKE '%SQL%'
ORDER BY id DESC
LIMIT 3;
`
    }
  ]
}
