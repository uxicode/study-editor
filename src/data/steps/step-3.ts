import type { CurriculumStep } from '@/types/curriculum'

export const step_3: CurriculumStep = {

    id: 'step-3',
    title: 'Create - 사용자 생성',
    order: 5,
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
  email: "your-email@example.com",
  name: "Your Name"
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
  // email: 원하는 이메일 주소 (예: "user@example.com")
  // name: 원하는 이름 (예: "John Doe")
  
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
          type: 'regex',
          target: 'app.js',
          pattern: /@[\w.-]+\.\w+/,
          message: '올바른 이메일 형식을 입력해야 합니다. (예: user@example.com)'
        }
      ],
      dynamicChecks: [
        {
          type: 'result',
          test: (result: any) => {
            return result.success && result.output.includes('생성된 사용자:')
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
        content: 'await 키워드를 사용하여 비동기 작업을 기다려야 합니다. email과 name은 원하는 값으로 지정할 수 있습니다.',
        codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

const newUser = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "John Doe"
  }
})`
      }
    ]
}
