import type { CurriculumStep } from '@/types/curriculum'

export const week_3_1_p2: CurriculumStep = {
  id: 'week-3-1-p2',
  title: '2주차 · 연습 ② Prisma 초기 설정 — prisma 명령어의 역할',
  order: 31,
  category: 'environment',
  content: {
    mission:
      '`npx prisma init`, `npx prisma generate`, `npx prisma migrate dev` 가 각각 무엇을 하는지 한 줄씩 `//` 주석으로 정리하세요. (명령어 이름을 주석에 그대로 포함)',
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
      'init / generate / migrate dev 구분',
      '직전 스텝(Prisma 초기 설정)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'prisma 명령어의 역할 — 모든 채점 항목 통과'
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
        pattern: /\/\/[^\n]*prisma\s+init/,
        message: 'prisma init 의 역할을 // 주석으로 적어야 합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /\/\/[^\n]*prisma\s+generate/,
        message: 'prisma generate 의 역할을 // 주석으로 적어야 합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /\/\/[^\n]*migrate\s+dev/,
        message: 'prisma migrate dev 의 역할을 // 주석으로 적어야 합니다.'
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
      content: '각 명령어를 `// npx prisma init : ...` 형태로 한 줄씩 적으세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- prisma init 의 역할을 // 주석으로 적어야 합니다.
- prisma generate 의 역할을 // 주석으로 적어야 합니다.
- prisma migrate dev 의 역할을 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// npx prisma init        : prisma/schema.prisma 와 .env 파일을 생성
// npx prisma generate    : schema.prisma 를 읽어 타입 안전한 Prisma Client 코드를 생성
// npx prisma migrate dev : 스키마 변경을 SQL 마이그레이션으로 만들어 DB 에 적용
`
    }
  ]
}
