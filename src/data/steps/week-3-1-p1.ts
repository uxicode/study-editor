import type { CurriculumStep } from '@/types/curriculum'

export const week_3_1_p1: CurriculumStep = {
  id: 'week-3-1-p1',
  title: '2주차 · 연습 ① Prisma 초기 설정 — DATABASE_URL 형식',
  order: 30,
  category: 'environment',
  content: {
    mission:
      '`.env` 에 들어갈 `DATABASE_URL` 예시를 `mysql://USER:PASSWORD@localhost:3306/DBNAME` 형식으로 `//` 주석에 적으세요.',
    theory: `
      ## 복습: Prisma 초기 설정

      | 명령 | 역할 |
      |------|------|
      | \`npx prisma init\` | schema.prisma 와 .env 생성 |
      | \`npx prisma generate\` | schema 로부터 Prisma Client 코드 생성 |
      | \`npx prisma migrate dev\` | 스키마 변경을 마이그레이션으로 만들어 DB 에 적용 |

      - 연결 문자열 형식: \`mysql://USER:PASSWORD@HOST:PORT/DBNAME\`
      - Prisma 스키마의 주석은 \`//\` 입니다.
    `,
    objectives: [
      'MySQL 연결 문자열 구성 요소 이해',
      '직전 스텝(Prisma 초기 설정)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'DATABASE_URL 형식 — 모든 채점 항목 통과'
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

// TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /\/\/[^\n]*mysql:\/\/\w+:\w+@[\w.]+:\d+\/\w+/,
        message: 'mysql://USER:PASSWORD@localhost:3306/DBNAME 형식의 URL 을 // 주석으로 적어야 합니다.'
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
      content: '`// DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DBNAME"` 처럼 주석으로 적습니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- mysql://USER:PASSWORD@localhost:3306/DBNAME 형식의 URL 을 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// .env 예시: DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DBNAME"
//   USER=사용자, PASSWORD=비밀번호, localhost=호스트, 3306=포트, DBNAME=데이터베이스 이름
`
    }
  ]
}
