import type { CurriculumStep } from '@/types/curriculum'

export const week_3_1_p3: CurriculumStep = {
  id: 'week-3-1-p3',
  title: '2주차 · 연습 ③ Prisma 초기 설정 — 다른 DB 로 바꾸면?',
  order: 32,
  category: 'environment',
  content: {
    mission:
      '`provider` 를 `postgresql` 로 바꾸면 달라지는 점 2가지를 `//` 주석으로 적으세요. URL 형식(`postgresql://...`)과 `타입 매핑` 이라는 표현을 포함하세요.',
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
      'provider 변경 시 달라지는 점 이해',
      '직전 스텝(Prisma 초기 설정)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '다른 DB 로 바꾸면? — 모든 채점 항목 통과'
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
        pattern: /\/\/[^\n]*postgresql:\/\//,
        message: 'postgresql:// URL 형식을 // 주석으로 적어야 합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /\/\/[^\n]*타입\s*매핑/,
        message: '타입 매핑 차이를 // 주석으로 적어야 합니다.'
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
      content: '`postgresql://USER:PASSWORD@localhost:5432/DBNAME` 형식과 `타입 매핑` 차이를 주석으로 적으세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- postgresql:// URL 형식을 // 주석으로 적어야 합니다.
- 타입 매핑 차이를 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// postgresql 로 바꾸면 URL 이 postgresql://USER:PASSWORD@localhost:5432/DBNAME 형식이 되고,
// 컬럼 타입 매핑(String, DateTime 이 대응되는 DB 타입)도 달라집니다.
`
    }
  ]
}
