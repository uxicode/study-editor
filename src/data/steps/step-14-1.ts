import type { CurriculumStep } from '@/types/curriculum'

export const step_14_1: CurriculumStep = {
  id: 'step-14-1',
  title: 'TypeScript 제너레이트 타입 활용',
  order: 27,
  category: 'advanced',
  content: {
    mission: 'Prisma가 생성한 TypeScript 타입을 활용하여 타입 안전성을 보장하세요.',
    theory: `
      Prisma는 자동으로 TypeScript 타입을 생성합니다.
      
      ## 제너레이트 타입
      
      \`\`\`typescript
      import { Prisma } from '@prisma/client'
      
      // 생성 타입
      type UserCreateInput = Prisma.UserCreateInput
      
      // 업데이트 타입
      type UserUpdateInput = Prisma.UserUpdateInput
      \`\`\`
      
      ## 실무 활용
      
      \`\`\`typescript
      function createUser(data: Prisma.UserCreateInput) {
        return prisma.user.create({ data })
      }
      \`\`\`
    `,
    objectives: [
      '제너레이트 타입 이해',
      '타입 안전성 보장',
      '실무 활용'
    ],
    expectedOutput: 'TypeScript 타입을 활용해야 합니다.'
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
  id    Int    @id @default(autoincrement())
  email String @unique
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
  console.log('TypeScript 타입 활용 학습')
  console.log('\\n✓ 제너레이트 타입을 이해했습니다!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ],
  validator: {
    staticChecks: [],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success
        },
        message: '코드가 성공적으로 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'Prisma는 자동으로 TypeScript 타입을 생성합니다.'
    }
  ]
}
