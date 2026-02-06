import type { CurriculumStep } from '@/types/curriculum'

export const step_10_1: CurriculumStep = {
  id: 'step-10-1',
  title: '유니크 제약 고도화 (복합 유니크)',
  order: 21,
  category: 'schema',
  content: {
    mission: '@@unique를 사용하여 복합 유니크 제약 조건을 설정하세요.',
    theory: `
      **복합 유니크**는 여러 필드를 조합하여 고유성을 보장합니다.
      
      ## 복합 유니크 (@@unique)
      
      \`\`\`prisma
      model User {
        id    Int    @id @default(autoincrement())
        email String
        team  String
        
        @@unique([email, team])  // email과 team 조합이 고유해야 함
      }
      \`\`\`
      
      **의미:**
      - 같은 이메일이 다른 팀에서는 가능
      - 같은 팀에서 같은 이메일은 불가능
      
      ## 실무 활용
      
      \`\`\`prisma
      model DocumentShare {
        userId     Int
        documentId Int
        
        @@unique([userId, documentId])  // 같은 사용자가 같은 문서를 중복 공유 불가
      }
      \`\`\`
    `,
    objectives: [
      '복합 유니크 제약 조건 이해',
      '@@unique 사용법',
      '실무 활용 예시'
    ],
    expectedOutput: '복합 유니크 제약이 설정되어야 합니다.'
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
  email String
  team  String
  
  // @@unique([email, team]) 추가
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
  // 같은 이메일, 다른 팀은 가능
  await prisma.user.create({ data: { email: "test@example.com", team: "Team A" } })
  await prisma.user.create({ data: { email: "test@example.com", team: "Team B" } })
  
  // 같은 이메일, 같은 팀은 불가능 (에러 발생)
  try {
    await prisma.user.create({ data: { email: "test@example.com", team: "Team A" } })
  } catch (error) {
    console.log('중복 방지됨:', error.code)
  }
  
  console.log('\\n✓ 복합 유니크가 정상적으로 동작합니다!')
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
        pattern: '@@unique',
        message: '@@unique로 복합 유니크를 설정해야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success
        },
        message: '복합 유니크가 올바르게 설정되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '@@unique([field1, field2]) 형식으로 복합 유니크를 설정하세요.'
    },
    {
      level: 2,
      content: '완전한 정답입니다.',
      codeSnippet: `model User {
  id    Int    @id @default(autoincrement())
  email String
  team  String
  
  @@unique([email, team])
}`
    }
  ]
}
