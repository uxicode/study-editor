import type { CurriculumStep } from '@/types/curriculum'

export const week_4_7: CurriculumStep = {
  id: 'week-4-7',
  title: '3주차 · Raw SQL ($queryRaw) 과 SQL 인젝션 방지',
  order: 77,
  category: 'advanced',
  content: {
    mission:
      '`getTopWriters(minPosts)` 를 `prisma.$queryRaw` 로 구현하세요. 글을 `minPosts` 개 이상 쓴 사용자의 `id`, `name`, 글 수(`postCount`)를 조회합니다. 결과 타입을 제네릭으로 지정하고, `minPosts` 는 문자열을 이어 붙이지 말고 `${minPosts}` 로 **바인딩**합니다.',
    theory: `
      ## ORM 으로 어려운 쿼리는 Raw SQL 로

      실무에서도 CRUD 는 ORM 으로, 아래 같은 쿼리는 SQL 을 직접 쓰는 경우가 많습니다.

      - JOIN + GROUP BY + HAVING 이 섞인 통계 · 리포트
      - 윈도우 함수(\`ROW_NUMBER() OVER ...\`), 복잡한 서브쿼리
      - 수천 건을 한 번에 바꾸는 대량 UPDATE

      ## $queryRaw — 태그드 템플릿

      \`\`\`ts
      type Row = { id: number; name: string; postCount: bigint }

      const rows = await prisma.$queryRaw<Row[]>\`
        SELECT u.id, u.name, COUNT(p.id) AS postCount
        FROM users u
        JOIN posts p ON p.user_id = u.id
        GROUP BY u.id, u.name
        HAVING COUNT(p.id) >= \${minPosts}
      \`
      \`\`\`

      - 괄호 없이 백틱을 바로 붙이는 **태그드 템플릿**입니다.
      - \`\${minPosts}\` 는 문자열에 끼워 넣어지는 게 아니라 \`?\` 바인딩 값으로 따로 전달됩니다 → **SQL 인젝션에 안전**
      - SQL 안에서는 모델 이름이 아니라 실제 테이블 · 컬럼 이름(\`users\`, \`user_id\`)을 씁니다.

      ## 결과 타입 주의

      - 제네릭 \`<Row[]>\` 은 **타입 단언일 뿐** 런타임 검증이 아닙니다. 별칭과 타입을 쿼리와 정확히 맞추세요.
      - MySQL 의 \`COUNT(*)\` 는 BIGINT 라서 \`bigint\` 로 옵니다. JSON 으로 응답하려면 \`Number(row.postCount)\` 로 바꿔야 합니다 (\`JSON.stringify\` 는 bigint 를 직렬화하지 못합니다).

      ## 절대 하지 말 것

      \`\`\`ts
      // ❌ 문자열을 직접 이어 붙이면 SQL 인젝션 위험
      prisma.$queryRawUnsafe(\`SELECT * FROM users WHERE email = '\${email}'\`)
      \`\`\`
    `,
    objectives: [
      'ORM 대신 Raw SQL 을 쓰는 상황 이해',
      '$queryRaw 태그드 템플릿과 파라미터 바인딩',
      '결과 타입 지정과 bigint 변환'
    ],
    exercise: `
1. \`TopWriter\` 타입(\`id: number\`, \`name: string\`, \`postCount: bigint\`)을 선언하세요.
2. \`getTopWriters(minPosts: number)\` 에서 \`prisma.$queryRaw<TopWriter[]>\` 태그드 템플릿으로 users 와 posts 를 JOIN 하고 \`GROUP BY\` · \`HAVING COUNT(p.id) >= \${minPosts}\` 로 조회하세요.
3. 반환할 때 \`postCount\` 를 \`Number(...)\` 로 변환하세요.
    `.trim(),
    expectedOutput: '$queryRaw 태그드 템플릿 + 바인딩 사용',
    localPractice: `로컬에서 \`log: ['query']\` 를 켜고 실행하면 \`\${minPosts}\` 자리가 \`?\` 로 바뀌어 전송되는 것을 확인할 수 있습니다.

\`\`\`ts
const prisma = new PrismaClient({ log: ['query'] })
console.log(await getTopWriters(2))
\`\`\`

\`\`\`
prisma:query SELECT u.id, u.name, COUNT(p.id) AS postCount ... HAVING COUNT(p.id) >= ?
\`\`\`
    `.trim()
  },
  initialFiles: [
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 참고: 테이블은 users(id, email, name), posts(id, user_id, title, ...) 입니다.

// TODO: TopWriter 타입을 선언하세요.

async function getTopWriters(minPosts: number) {
  // TODO: prisma.$queryRaw 로 글을 minPosts 개 이상 쓴 사용자를 조회하고,
  //       postCount 를 number 로 바꿔 반환하세요.
}

async function main() {
  console.log(await getTopWriters(2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /type\s+TopWriter\s*=\s*\{(?=[^}]*\bid\s*:\s*number)(?=[^}]*\bname\s*:\s*string)(?=[^}]*\bpostCount\s*:\s*bigint)[^}]*\}/,
        message: 'TopWriter 타입에 id: number, name: string, postCount: bigint 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.\$queryRaw\s*<\s*TopWriter\[\]\s*>\s*`/,
        message: 'prisma.$queryRaw<TopWriter[]>`...` 태그드 템플릿 형태로 호출해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\$queryRaw[^`]*`[^`]*JOIN\s+posts[^`]*GROUP\s+BY[^`]*`/i,
        message: 'users 와 posts 를 JOIN 하고 GROUP BY 로 묶어야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\$queryRaw[^`]*`[^`]*HAVING\s+COUNT\s*\([^)]*\)\s*>=\s*\$\{\s*minPosts\s*\}[^`]*`/i,
        message: 'HAVING COUNT(p.id) >= ${minPosts} 처럼 minPosts 를 바인딩해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /Number\s*\(\s*[\w.]*postCount\s*\)/,
        message: 'bigint 인 postCount 를 Number(...) 로 변환해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /^(?![\s\S]*\$queryRawUnsafe)/,
        message: '$queryRawUnsafe 는 SQL 인젝션 위험이 있으니 $queryRaw 를 사용하세요.'
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
      content: '`prisma.$queryRaw<TopWriter[]>` 뒤에 괄호 없이 바로 백틱(`)을 붙여 SQL 을 씁니다. 변수는 `${minPosts}` 로 넣습니다.'
    },
    {
      level: 2,
      content: '`SELECT u.id, u.name, COUNT(p.id) AS postCount FROM users u JOIN posts p ON p.user_id = u.id GROUP BY u.id, u.name HAVING COUNT(p.id) >= ${minPosts}` 형태입니다. 반환할 때 `rows.map(...)` 으로 `Number(row.postCount)` 를 적용하세요.'
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type TopWriter = { id: number; name: string; postCount: bigint }

async function getTopWriters(minPosts: number) {
  const rows = await prisma.$queryRaw<TopWriter[]>\`
    SELECT u.id, u.name, COUNT(p.id) AS postCount
    FROM users u
    JOIN posts p ON p.user_id = u.id
    GROUP BY u.id, u.name
    HAVING COUNT(p.id) >= \${minPosts}
  \`

  return rows.map((row) => ({ ...row, postCount: Number(row.postCount) }))
}

async function main() {
  console.log(await getTopWriters(2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
