import type { CurriculumStep } from '@/types/curriculum'

export const step_1: CurriculumStep = {

    id: 'step-1',
    title: 'Prisma 초기 설정',
    order: 1,
    category: 'environment',
    content: {
      mission: 'Prisma를 초기화하고 PostgreSQL 데이터베이스에 연결하는 설정을 완료하세요.',
      theory: `
        **Prisma**는 Node.js와 TypeScript를 위한 차세대 ORM입니다.
        
        주요 특징:
        - 타입 안전성이 보장되는 데이터베이스 클라이언트
        - 직관적인 데이터 모델링
        - 자동 마이그레이션
        
        ## 데이터베이스 연결 설정
        
        Prisma는 \`schema.prisma\` 파일에서 데이터베이스 연결을 설정합니다.
        
        **datasource db 블록:**
        - \`provider\`: 사용할 데이터베이스 종류 (postgresql, mysql, sqlite 등)
        - \`url\`: 데이터베이스 연결 URL
        
        **환경 변수 사용:**
        \`url = env("DATABASE_URL")\`는 \`.env\` 파일의 DATABASE_URL 변수를 참조합니다.
        
        **.env 파일 예시:**
        \`\`\`
        DATABASE_URL="postgresql://username@localhost:5432/database?schema=public"
        PORT=3001
        NODE_ENV=development
        CORS_ORIGIN="http://localhost:5173"
        \`\`\`
        
        **DATABASE_URL 형식:**
        \`postgresql://사용자명@호스트:포트/데이터베이스명?schema=스키마명\`
        
        이렇게 환경 변수를 사용하면:
        - 개발/운영 환경별로 다른 DB 사용 가능
        - 민감한 정보(비밀번호 등)를 코드에서 분리
        - .env 파일은 .gitignore에 추가하여 보안 유지
      `,
      objectives: [
        'Prisma Schema 파일의 구조 이해',
        'PostgreSQL 데이터베이스 연결 설정',
        '환경 변수를 통한 DATABASE_URL 설정 방법',
        'Prisma Client 생성 방법 학습'
      ],
      expectedOutput: 'Prisma 설정 완료'
    },
    initialFiles: [
      {
        name: '.env',
        path: '.env',
        language: 'javascript',
        readonly: true,
        content: `# 데이터베이스 연결 URL
# 형식: postgresql://사용자명@호스트:포트/데이터베이스명?schema=스키마명
DATABASE_URL="postgresql://jeonbongcheol@localhost:5432/api_watcher?schema=public"

# 서버 포트
PORT=3001

# 실행 환경
NODE_ENV=development

# CORS 설정
CORS_ORIGIN="http://localhost:5173"
`
      },
      {
        name: 'schema.prisma',
        path: 'prisma/schema.prisma',
        language: 'prisma',
        content: `// Prisma 스키마 파일
// 데이터베이스 연결과 클라이언트 설정을 여기에 작성하세요

generator client {
  provider = "prisma-client-js"
}

datasource db {
  // provider와 url을 설정하세요
  // url은 env("DATABASE_URL")을 사용하여 .env 파일의 환경 변수를 참조합니다
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`
      },
      {
        name: 'app.js',
        path: 'app.js',
        language: 'javascript',
        content: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  console.log('Prisma 연결 성공!')
  console.log('데이터베이스 클라이언트가 생성되었습니다.')
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
          type: 'includes',
          target: 'prisma/schema.prisma',
          pattern: 'generator client',
          message: 'schema.prisma에 generator client 블록이 필요합니다.'
        },
        {
          type: 'includes',
          target: 'prisma/schema.prisma',
          pattern: 'datasource db',
          message: 'schema.prisma에 datasource db 블록이 필요합니다.'
        },
        {
          type: 'includes',
          target: 'prisma/schema.prisma',
          pattern: 'provider = "postgresql"',
          message: 'PostgreSQL을 provider로 설정해야 합니다.'
        }
      ],
      dynamicChecks: [
        {
          type: 'result',
          test: (result: any) => {
            return result.success && result.output.includes('Prisma 연결 성공')
          },
          message: '코드가 성공적으로 실행되어야 합니다.'
        }
      ]
    },
    hints: [
      {
        level: 1,
        content: 'datasource db 블록에서 provider를 "postgresql"로 설정하세요. url은 env("DATABASE_URL")을 사용하여 .env 파일의 환경 변수를 참조합니다.'
      },
      {
        level: 2,
        content: '.env 파일의 DATABASE_URL 변수가 자동으로 schema.prisma에 연결됩니다.',
        codeSnippet: `// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// .env 파일
DATABASE_URL="postgresql://username@localhost:5432/database?schema=public"`
      },
      {
        level: 3,
        content: 'env() 함수는 환경 변수를 읽어옵니다. 이렇게 하면 민감한 정보를 코드에서 분리할 수 있습니다.',
        codeSnippet: `// ✅ 올바른 방법 (환경 변수 사용)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ❌ 잘못된 방법 (하드코딩)
datasource db {
  provider = "postgresql"
  url      = "postgresql://user:password@localhost:5432/db"
}`
      }
    ]
}
