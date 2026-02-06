import type { CurriculumStep } from '@/types/curriculum'

export const step_9_2: CurriculumStep = {
  id: 'step-9-2',
  title: 'N:M 관계 조회 및 관리',
  order: 20,
  category: 'relations',
  content: {
    mission: 'N:M 관계 데이터를 조회하고, connect/disconnect로 관계를 추가/제거하세요.',
    theory: `
      N:M 관계가 설정되면 관계 데이터를 조회하고 관리하는 방법을 배워야 합니다.
      
      ## 관계 조회
      
      ### 사용자가 공유받은 문서 조회
      
      \`\`\`javascript
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        include: {
          documents: {
            include: {
              document: true  // 중간 모델을 통해 문서 조회
            }
          }
        }
      })
      \`\`\`
      
      ### 문서의 공유자 조회
      
      \`\`\`javascript
      const document = await prisma.document.findUnique({
        where: { id: 1 },
        include: {
          shares: {
            include: {
              user: true  // 중간 모델을 통해 사용자 조회
            }
          }
        }
      })
      \`\`\`
      
      ## 관계 추가 (connect)
      
      \`\`\`javascript
      // 문서에 사용자 추가
      await prisma.documentShare.create({
        data: {
          userId: 1,
          documentId: 1,
          role: "EDITOR"
        }
      })
      \`\`\`
      
      ## 관계 제거 (disconnect/delete)
      
      \`\`\`javascript
      // 공유 관계 삭제
      await prisma.documentShare.delete({
        where: {
          userId_documentId: {
            userId: 1,
            documentId: 1
          }
        }
      })
      \`\`\`
      
      ## 실무 활용
      
      ### 권한 확인
      
      \`\`\`javascript
      const share = await prisma.documentShare.findUnique({
        where: {
          userId_documentId: {
            userId: 1,
            documentId: 1
          }
        }
      })
      
      if (share && share.role === "EDITOR") {
        // 편집 권한 있음
      }
      \`\`\`
    `,
    objectives: [
      'N:M 관계 데이터 조회',
      '중간 모델을 통한 관계 조회',
      '관계 추가 및 제거',
      '실무 협업 기능 구현'
    ],
    expectedOutput: 'N:M 관계 조회 및 관리가 정상적으로 동작해야 합니다.'
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
  id        Int              @id @default(autoincrement())
  email     String           @unique
  name      String?
  documents DocumentShare[]
  createdAt DateTime         @default(now())
}

model Document {
  id        Int              @id @default(autoincrement())
  title     String
  content   String?
  shares    DocumentShare[]
  createdAt DateTime         @default(now())
}

model DocumentShare {
  id         Int      @id @default(autoincrement())
  userId     Int
  documentId Int
  role       String   @default("VIEWER")
  user       User     @relation(fields: [userId], references: [id])
  document   Document @relation(fields: [documentId], references: [id])
  
  @@unique([userId, documentId])
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
  // 테스트 데이터 생성
  const user1 = await prisma.user.create({ data: { email: "user1@example.com", name: "User 1" } })
  const user2 = await prisma.user.create({ data: { email: "user2@example.com", name: "User 2" } })
  const doc = await prisma.document.create({ data: { title: "공유 문서", content: "내용" } })
  
  // 1. 관계 추가
  await prisma.documentShare.create({
    data: { userId: user1.id, documentId: doc.id, role: "OWNER" }
  })
  
  // 2. 사용자가 공유받은 문서 조회
  const userWithDocs = await prisma.user.findUnique({
    where: { id: user1.id },
    include: {
      documents: {
        include: { document: true }
      }
    }
  })
  
  console.log('공유받은 문서:', userWithDocs.documents.length, '개')
  
  // 3. 문서의 공유자 조회
  const docWithShares = await prisma.document.findUnique({
    where: { id: doc.id },
    include: {
      shares: {
        include: { user: true }
      }
    }
  })
  
  console.log('공유자:', docWithShares.shares.length, '명')
  
  console.log('\\n✓ N:M 관계 조회 및 관리가 정상적으로 동작합니다!')
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
        pattern: 'include',
        message: 'include를 사용하여 관계 데이터를 조회해야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success && result.output.includes('N:M 관계 조회 및 관리가 정상적으로 동작합니다')
        },
        message: 'N:M 관계 조회가 올바르게 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'include를 사용하여 중간 모델을 통해 관계 데이터를 조회하세요.'
    },
    {
      level: 2,
      content: '중첩 include를 사용하여 중간 모델을 통해 실제 모델을 조회하세요.',
      codeSnippet: `const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    documents: {
      include: {
        document: true
      }
    }
  }
})`
    },
    {
      level: 3,
      content: '완전한 정답입니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  const user1 = await prisma.user.create({ data: { email: "user1@example.com", name: "User 1" } })
  const user2 = await prisma.user.create({ data: { email: "user2@example.com", name: "User 2" } })
  const doc = await prisma.document.create({ data: { title: "공유 문서", content: "내용" } })
  
  await prisma.documentShare.create({
    data: { userId: user1.id, documentId: doc.id, role: "OWNER" }
  })
  
  const userWithDocs = await prisma.user.findUnique({
    where: { id: user1.id },
    include: {
      documents: {
        include: { document: true }
      }
    }
  })
  
  console.log('공유받은 문서:', userWithDocs.documents.length, '개')
  
  const docWithShares = await prisma.document.findUnique({
    where: { id: doc.id },
    include: {
      shares: {
        include: { user: true }
      }
    }
  })
  
  console.log('공유자:', docWithShares.shares.length, '명')
  
  console.log('\\n✓ N:M 관계 조회 및 관리가 정상적으로 동작합니다!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
