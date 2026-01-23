import type { CurriculumStep } from '@/types/curriculum'

export const CURRICULUM_STEPS: CurriculumStep[] = [
  {
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
  },
  {
    id: 'step-2',
    title: 'User 모델 정의',
    order: 2,
    category: 'schema',
    content: {
      mission: '사용자를 관리하기 위한 User 모델을 설계하세요.',
      theory: `
        **Prisma 모델**은 데이터베이스 테이블의 구조를 정의합니다.
        
        기본 구조:
        \`\`\`prisma
        model ModelName {
          fieldName FieldType @attribute
        }
        \`\`\`
        
        주요 필드 속성:
        - \`@id\`: 기본 키 지정
        - \`@unique\`: 고유 제약 조건
        - \`@default(autoincrement())\`: 자동 증가
        - \`?\`: 선택적 필드 (nullable)
      `,
      objectives: [
        'Prisma 모델 정의 문법 이해',
        '기본 키와 유니크 제약 조건 설정',
        '필드 타입과 속성 사용'
      ],
      expectedOutput: `User 모델이 다음 필드를 포함해야 합니다:
- id: 정수형, 기본키, 자동 증가
- email: 문자열, 유니크
- name: 문자열, 선택 사항(Optional)`
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
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 여기에 User 모델을 작성하세요
model User {
  // id: 정수형, 기본키, 자동 증가
  // email: 문자열, 유니크
  // name: 문자열, 선택 사항
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
  console.log('User 모델 정의 확인')
  
  // Prisma Client의 user 속성이 존재하는지 확인
  if (prisma.user) {
    console.log('✓ User 모델이 정상적으로 정의되었습니다!')
  } else {
    console.log('✗ User 모델을 찾을 수 없습니다.')
  }
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
          pattern: 'model User',
          message: 'User 모델을 정의해야 합니다.'
        },
        {
          type: 'regex',
          target: 'prisma/schema.prisma',
          pattern: /id\s+Int\s+@id\s+@default\(autoincrement\(\)\)/,
          message: 'id 필드는 "Int @id @default(autoincrement())" 형식이어야 합니다.'
        },
        {
          type: 'regex',
          target: 'prisma/schema.prisma',
          pattern: /email\s+String\s+@unique/,
          message: 'email 필드는 "String @unique" 형식이어야 합니다.'
        },
        {
          type: 'regex',
          target: 'prisma/schema.prisma',
          pattern: /name\s+String\?/,
          message: 'name 필드는 "String?" (선택적) 형식이어야 합니다.'
        }
      ],
      dynamicChecks: [
        {
          type: 'result',
          test: (result: any) => {
            return result.success && result.output.includes('User 모델이 정상적으로 정의되었습니다')
          },
          message: 'User 모델이 정상적으로 정의되어야 합니다.'
        }
      ]
    },
    hints: [
      {
        level: 1,
        content: 'id 필드는 Int 타입이며, @id와 @default(autoincrement()) 속성이 필요합니다.'
      },
      {
        level: 2,
        content: 'email은 String 타입이며, @unique 속성을 추가해야 합니다.'
      },
      {
        level: 3,
        content: 'name은 선택적 필드이므로 String? (물음표 추가)로 정의합니다.',
        codeSnippet: `model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}`
      }
    ]
  },
  {
    id: 'step-3',
    title: 'Create - 사용자 생성',
    order: 3,
    category: 'create',
    content: {
      mission: 'Prisma Client를 사용하여 새로운 사용자를 데이터베이스에 생성하세요.',
      theory: `
        **Prisma Client**를 사용하면 타입 안전한 방식으로 데이터를 생성할 수 있습니다.
        
        기본 문법:
        \`\`\`javascript
        await prisma.modelName.create({
          data: {
            field1: value1,
            field2: value2
          }
        })
        \`\`\`
        
        \`create\` 메서드는:
        - 새로운 레코드를 생성합니다
        - 생성된 레코드를 반환합니다
        - 유효성 검증을 자동으로 수행합니다
      `,
      objectives: [
        'prisma.user.create() 메서드 사용법 학습',
        '데이터 객체 구조 이해',
        '생성된 결과 확인'
      ],
      expectedOutput: `{
  id: 1,
  email: "alice@example.com",
  name: "Alice"
}`
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
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
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
  // prisma.user.create()를 사용하여 새로운 사용자를 생성하세요
  // email: "alice@example.com"
  // name: "Alice"
  
  const newUser = // 여기에 코드를 작성하세요
  
  console.log('생성된 사용자:', newUser)
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
          target: 'app.js',
          pattern: 'prisma.user.create',
          message: 'prisma.user.create() 메서드를 사용해야 합니다.'
        },
        {
          type: 'includes',
          target: 'app.js',
          pattern: 'data:',
          message: 'create 메서드에 data 객체를 전달해야 합니다.'
        },
        {
          type: 'includes',
          target: 'app.js',
          pattern: 'alice@example.com',
          message: 'email은 "alice@example.com"이어야 합니다.'
        }
      ],
      dynamicChecks: [
        {
          type: 'result',
          test: (result: any) => {
            return result.success && 
                   result.output.includes('alice@example.com') &&
                   result.output.includes('Alice')
          },
          message: '사용자가 올바르게 생성되어야 합니다.'
        }
      ]
    },
    hints: [
      {
        level: 1,
        content: 'prisma.user.create() 메서드를 사용하고, data 객체를 전달하세요.'
      },
      {
        level: 2,
        content: 'await 키워드를 사용하여 비동기 작업을 기다려야 합니다.',
        codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

const newUser = await prisma.user.create({
  data: {
    email: "alice@example.com",
    name: "Alice"
  }
})`
      }
    ]
  },
  {
    id: 'step-4',
    title: 'Read - 사용자 조회',
    order: 4,
    category: 'read',
    content: {
      mission: 'findMany()와 findUnique()를 사용하여 사용자를 조회하세요.',
      theory: `
        **Prisma 쿼리 메서드**:
        
        1. \`findMany()\`: 여러 레코드 조회
        \`\`\`javascript
        await prisma.user.findMany({
          where: { name: "Alice" },
          orderBy: { id: 'asc' }
        })
        \`\`\`
        
        2. \`findUnique()\`: 고유한 하나의 레코드 조회
        \`\`\`javascript
        await prisma.user.findUnique({
          where: { email: "alice@example.com" }
        })
        \`\`\`
      `,
      objectives: [
        'findMany()로 여러 레코드 조회',
        'findUnique()로 특정 레코드 조회',
        'where 필터와 orderBy 사용'
      ]
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
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
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
  // 1. 모든 사용자 조회 (findMany 사용)
  const allUsers = // 여기에 코드를 작성하세요
  
  console.log('모든 사용자:', allUsers)
  
  // 2. 특정 이메일로 사용자 조회 (findUnique 사용)
  // email: "alice@example.com"
  const user = // 여기에 코드를 작성하세요
  
  console.log('특정 사용자:', user)
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
          target: 'app.js',
          pattern: 'findMany',
          message: 'findMany() 메서드를 사용해야 합니다.'
        },
        {
          type: 'includes',
          target: 'app.js',
          pattern: 'findUnique',
          message: 'findUnique() 메서드를 사용해야 합니다.'
        }
      ],
      dynamicChecks: [
        {
          type: 'result',
          test: (result: any) => {
            return result.success && 
                   result.output.includes('모든 사용자') &&
                   result.output.includes('특정 사용자')
          },
          message: '쿼리가 올바르게 실행되어야 합니다.'
        }
      ]
    },
    hints: [
      {
        level: 1,
        content: 'findMany()는 인자 없이 호출하면 모든 레코드를 반환합니다.'
      },
      {
        level: 2,
        content: 'findUnique()는 where 절에 유니크 필드(email)를 사용해야 합니다.',
        codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

const allUsers = await prisma.user.findMany()
const user = await prisma.user.findUnique({
  where: { email: "alice@example.com" }
})`
      }
    ]
  }
]
