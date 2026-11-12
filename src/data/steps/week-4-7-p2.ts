import type { CurriculumStep } from '@/types/curriculum'

export const week_4_7_p2: CurriculumStep = {
  id: 'week-4-7-p2',
  title: '3주차 · 연습 ② Raw SQL ($queryRaw) — SQL 인젝션 고치기',
  order: 79,
  category: 'read',
  content: {
    mission:
      "`findUserByEmail` 은 `$queryRawUnsafe` 에 문자열을 이어 붙여서 SQL 인젝션에 취약합니다. `$queryRaw` 태그드 템플릿으로 고쳐 `email` 을 바인딩하세요 (`'${email}'` 처럼 따옴표로 감싸지 않습니다). 왜 위험했는지 `//` 주석에 `인젝션` 이라는 단어를 넣어 한 줄로 적으세요.",
    theory: `
      ## 복습: 바인딩

      \`\`\`ts
      await prisma.$queryRaw\`SELECT * FROM users WHERE email = \${email}\`
      // 전송: SELECT * FROM users WHERE email = ?   (값: email)
      \`\`\`

      ## 문자열 연결이 위험한 이유

      \`\`\`ts
      const email = "' OR '1'='1"
      prisma.$queryRawUnsafe(\`SELECT * FROM users WHERE email = '\${email}'\`)
      // 실행: SELECT * FROM users WHERE email = '' OR '1'='1'
      // → 모든 사용자가 조회된다!
      \`\`\`

      - 입력값이 **SQL 문법의 일부**가 되어 버리는 것이 SQL 인젝션입니다.
      - 바인딩하면 입력값은 항상 "값" 으로만 취급되어 문법을 바꿀 수 없습니다.
      - 바인딩할 때는 \`'\${email}'\` 처럼 따옴표를 붙이지 않습니다. 따옴표 처리는 드라이버가 합니다.
      - \`$queryRawUnsafe\` 를 꼭 써야 한다면 \`$queryRawUnsafe('... WHERE email = ?', email)\` 처럼 두 번째 인자로 값을 넘깁니다.
    `,
    objectives: [
      'SQL 인젝션이 일어나는 원리 이해',
      '$queryRawUnsafe 를 $queryRaw 바인딩으로 교체',
      '직전 스텝(Raw SQL ($queryRaw))의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'SQL 인젝션 고치기 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type UserRow = { id: number; email: string; name: string }

// TODO: 아래 함수를 $queryRaw 로 고치고, 왜 위험했는지 주석을 적으세요.
async function findUserByEmail(email: string) {
  return prisma.$queryRawUnsafe<UserRow[]>(
    \`SELECT id, email, name FROM users WHERE email = '\${email}'\`
  )
}

async function main() {
  console.log(await findUserByEmail("' OR '1'='1"))
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
        pattern: /^(?![\s\S]*\$queryRawUnsafe\s*[<(])/,
        message: '$queryRawUnsafe 호출을 제거해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.\$queryRaw\s*(<\s*UserRow\[\]\s*>)?\s*`/,
        message: 'prisma.$queryRaw<UserRow[]>`...` 태그드 템플릿을 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\$queryRaw[^`(]*`[^`]*WHERE\s+email\s*=\s*\$\{\s*email\s*\}[^`]*`/i,
        message: "WHERE email = ${email} 처럼 따옴표 없이 바인딩해야 합니다 ('${email}' 이 아닙니다)."
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\/\/[^\n]*(인젝션|injection)/i,
        message: '문자열 연결이 왜 위험한지 // 주석으로 적어야 합니다 (인젝션 포함).'
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
      content: '`$queryRawUnsafe<UserRow[]>(...)` 호출을 `$queryRaw<UserRow[]>` 태그드 템플릿(괄호 없이 백틱)으로 바꾸고, `${email}` 을 감싼 작은따옴표를 지웁니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- $queryRawUnsafe 호출을 제거해야 합니다.
- prisma.$queryRaw<UserRow[]>\`...\` 태그드 템플릿을 사용해야 합니다.
- WHERE email = \${email} 처럼 따옴표 없이 바인딩해야 합니다.
- 문자열 연결이 왜 위험한지 // 주석으로 적어야 합니다 (인젝션 포함).`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type UserRow = { id: number; email: string; name: string }

// 문자열을 이어 붙이면 입력값이 SQL 문법이 되어 SQL 인젝션이 가능하다. 바인딩으로 값만 전달한다.
async function findUserByEmail(email: string) {
  return prisma.$queryRaw<UserRow[]>\`
    SELECT id, email, name FROM users WHERE email = \${email}
  \`
}

async function main() {
  console.log(await findUserByEmail("' OR '1'='1"))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
