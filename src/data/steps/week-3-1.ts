import type { CurriculumStep } from '@/types/curriculum'

export const week_3_1: CurriculumStep = {
  id: 'week-3-1',
  title: '3주차 · Prisma 초기 설정',
  order: 13,
  category: 'environment',
  content: {
    mission:
      '`schema.prisma` 에 `generator client` 와 `datasource db` 블록을 작성하여 Prisma 가 MySQL 을 대상으로 동작하도록 설정하세요.',
    theory: `
      ## Prisma 의 두 블록

      \`\`\`prisma
      generator client {
        provider = "prisma-client-js"
      }

      datasource db {
        provider = "mysql"
        url      = env("DATABASE_URL")
      }
      \`\`\`

      - \`generator client\` — 어떤 클라이언트(JS/TS)를 만들 것인지
      - \`datasource db\` — 실제 데이터베이스 연결 정보

      ## 환경 변수와 URL

      \`DATABASE_URL\` 형식 (MySQL):
      \`\`\`
      mysql://user:password@host:3306/dbname
      \`\`\`

      ## 마이그레이션 흐름 (개념)

      1. \`schema.prisma\` 수정
      2. \`prisma migrate dev\` 로 MySQL 에 DDL 적용
      3. \`prisma generate\` 가 자동 실행되어 \`@prisma/client\` 갱신

      이 학습 환경에서는 실제 마이그레이션 대신 mock 분석으로 검증합니다.
    `,
    objectives: [
      'Prisma 의 generator / datasource 구조 이해',
      'MySQL provider 지정 방법',
      '환경 변수로 연결 URL 분리'
    ],
    exercise: `
1. \`schema.prisma\` 에 \`generator client { provider = "prisma-client-js" }\` 블록을 작성하세요.
2. \`datasource db { provider = "mysql" url = env("DATABASE_URL") }\` 블록을 작성하세요.
    `.trim(),
    expectedOutput: 'MySQL provider 확인됨'
  },
  initialFiles: [
    {
      name: 'schema.prisma',
      path: 'prisma/schema.prisma',
      language: 'prisma',
      content: `// TODO: generator client 블록을 작성하세요.
// TODO: datasource db 블록을 작성하세요 (provider = "mysql", url = env("DATABASE_URL")).
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /generator\s+client\s*\{/,
        message: 'generator client 블록이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /provider\s*=\s*"prisma-client-js"/,
        message: 'generator 의 provider 가 "prisma-client-js" 여야 합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /datasource\s+db\s*\{/,
        message: 'datasource db 블록이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /provider\s*=\s*"mysql"/,
        message: 'datasource 의 provider 가 "mysql" 이어야 합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /url\s*=\s*env\(\s*"DATABASE_URL"\s*\)/,
        message: 'url 은 env("DATABASE_URL") 로 환경 변수를 참조해야 합니다.'
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
      content: 'Prisma 의 두 블록은 항상 함께 작성됩니다.'
    },
    {
      level: 2,
      content: 'env("DATABASE_URL") 은 .env 파일의 환경 변수를 읽어옵니다. 코드에 직접 비밀번호를 넣지 마세요.'
    },
    {
      level: 3,
      content: '정답 Prisma 스키마 예시입니다.',
      codeSnippet: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
`
    }
  ]
}
