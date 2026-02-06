import type { CurriculumStep } from '@/types/curriculum'

export const step_9_1: CurriculumStep = {
  id: 'step-9-1',
  title: 'N:M 관계 설정 (협업 기능)',
  order: 19,
  category: 'relations',
  content: {
    mission: 'User와 Document 간의 N:M 관계를 설정하여 여러 사용자가 하나의 문서를 공유할 수 있도록 하세요.',
    theory: `
      **N:M (Many-to-Many)** 관계는 여러 레코드가 여러 레코드와 연결될 수 있는 관계입니다.
      
      ## N:M 관계란?
      
      **N:M 관계**는 양쪽 모두 여러 개의 관계를 가질 수 있는 관계입니다.
      
      **예시:**
      - 여러 사용자가 여러 문서를 공유 (협업)
      - 여러 학생이 여러 과목을 수강
      - 여러 태그가 여러 게시글에 연결
      
      ## Prisma에서 N:M 관계 정의
      
      Prisma는 N:M 관계를 **중간 테이블(Join Table)**을 통해 구현합니다.
      
      ### 방법 1: 명시적 중간 모델 (권장)
      
      \`\`\`prisma
      model User {
        id        Int              @id @default(autoincrement())
        email     String           @unique
        documents DocumentShare[]  // 중간 모델을 통한 관계
      }
      
      model Document {
        id      Int              @id @default(autoincrement())
        title   String
        shares  DocumentShare[]  // 중간 모델을 통한 관계
      }
      
      model DocumentShare {
        id         Int      @id @default(autoincrement())
        userId     Int
        documentId Int
        role       String   @default("VIEWER")  // 추가 필드 가능
        user       User     @relation(fields: [userId], references: [id])
        document   Document @relation(fields: [documentId], references: [id])
        
        @@unique([userId, documentId])  // 중복 방지
      }
      \`\`\`
      
      **특징:**
      - 중간 모델에 추가 필드 저장 가능 (role, createdAt 등)
      - 더 유연하고 확장 가능
      - 실무에서 권장하는 방법
      
      ### 방법 2: 암시적 중간 테이블 (간단한 경우)
      
      \`\`\`prisma
      model User {
        id        Int        @id @default(autoincrement())
        email     String     @unique
        documents Document[] @relation("DocumentShares")
      }
      
      model Document {
        id      Int      @id @default(autoincrement())
        title   String
        users   User[]   @relation("DocumentShares")
      }
      \`\`\`
      
      **특징:**
      - Prisma가 자동으로 중간 테이블 생성
      - 추가 필드 저장 불가
      - 간단한 관계에만 적합
      
      ## 실무 예시: 문서 공유 시스템
      
      \`\`\`prisma
      model User {
        id        Int              @id @default(autoincrement())
        email     String           @unique
        name      String?
        documents DocumentShare[]  // 공유된 문서들
        createdAt DateTime         @default(now())
      }
      
      model Document {
        id      Int              @id @default(autoincrement())
        title   String
        content String?
        shares  DocumentShare[]  // 공유 정보
        createdAt DateTime       @default(now())
      }
      
      model DocumentShare {
        id         Int      @id @default(autoincrement())
        userId     Int
        documentId Int
        role       String   @default("VIEWER")  // VIEWER, EDITOR, OWNER
        user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
        document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
        
        @@unique([userId, documentId])  // 같은 사용자가 같은 문서를 중복 공유 불가
      }
      \`\`\`
      
      ## @@unique로 중복 방지
      
      \`\`\`prisma
      @@unique([userId, documentId])
      \`\`\`
      
      **의미:**
      - 같은 사용자가 같은 문서를 여러 번 공유받을 수 없음
      - 데이터 무결성 보장
      - 복합 유니크 제약 조건
      
      ## 관계 생성
      
      ### 문서에 사용자 추가
      
      \`\`\`javascript
      // 문서에 사용자를 공유자로 추가
      await prisma.documentShare.create({
        data: {
          userId: 1,
          documentId: 1,
          role: "EDITOR"
        }
      })
      \`\`\`
      
      ### connect 사용
      
      \`\`\`javascript
      // 문서 생성 시 공유자 추가
      const document = await prisma.document.create({
        data: {
          title: "공유 문서",
          content: "내용",
          shares: {
            create: [
              { userId: 1, role: "OWNER" },
              { userId: 2, role: "EDITOR" },
              { userId: 3, role: "VIEWER" }
            ]
          }
        }
      })
      \`\`\`
      
      ## 관계 조회
      
      \`\`\`javascript
      // 사용자가 공유받은 문서들 조회
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
      
      // 문서의 공유자들 조회
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
      
      ## 실무 활용
      
      ### 협업 권한 관리
      
      \`\`\`javascript
      // 사용자의 문서 접근 권한 확인
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
      
      ### 공유자 목록 조회
      
      \`\`\`javascript
      // 문서의 모든 공유자 조회
      const document = await prisma.document.findUnique({
        where: { id: 1 },
        include: {
          shares: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })
      
      const collaborators = document.shares.map(share => ({
        user: share.user,
        role: share.role
      }))
      \`\`\`
      
      ## 주의사항
      
      1. **중간 모델 필요**: 추가 필드가 필요하면 명시적 중간 모델 사용
      2. **복합 유니크**: 중복 방지를 위해 @@unique 사용
      3. **삭제 옵션**: onDelete로 관련 데이터 처리 방식 결정
      4. **성능**: N:M 관계는 쿼리가 복잡해질 수 있으므로 인덱스 고려
    `,
    objectives: [
      'N:M 관계의 개념 이해',
      '명시적 중간 모델로 N:M 관계 정의',
      '@@unique로 중복 방지',
      'N:M 관계 생성 및 조회',
      '실무 협업 기능 구현'
    ],
    expectedOutput: 'User와 Document 간의 N:M 관계가 설정되어야 합니다.'
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
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  
  // DocumentShare 관계 필드 추가
  // documents DocumentShare[]
}

model Document {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  createdAt DateTime @default(now())
  
  // DocumentShare 관계 필드 추가
  // shares DocumentShare[]
}

// 중간 모델 DocumentShare 정의
// model DocumentShare {
//   id         Int      @id @default(autoincrement())
//   userId     Int
//   documentId Int
//   role       String   @default("VIEWER")
//   user       User     @relation(fields: [userId], references: [id])
//   document   Document @relation(fields: [documentId], references: [id])
//   
//   @@unique([userId, documentId])
// }
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
  console.log('N:M 관계 테스트\\n')
  
  // 1. 사용자들 생성
  const user1 = await prisma.user.create({
    data: { email: "user1@example.com", name: "User 1" }
  })
  const user2 = await prisma.user.create({
    data: { email: "user2@example.com", name: "User 2" }
  })
  
  // 2. 문서 생성 및 공유
  const document = await prisma.document.create({
    data: {
      title: "공유 문서",
      content: "내용",
      shares: {
        create: [
          { userId: user1.id, role: "OWNER" },
          { userId: user2.id, role: "EDITOR" }
        ]
      }
    }
  })
  
  console.log('문서 생성 및 공유 완료\\n')
  
  // 3. 사용자가 공유받은 문서들 조회
  const userWithDocs = await prisma.user.findUnique({
    where: { id: user1.id },
    include: {
      documents: {
        include: {
          document: true
        }
      }
    }
  })
  
  console.log(\`\${userWithDocs.name}이 공유받은 문서:\`)
  userWithDocs.documents.forEach(share => {
    console.log(\`  - \${share.document.title} (역할: \${share.role})\`)
  })
  
  // 4. 문서의 공유자들 조회
  const docWithShares = await prisma.document.findUnique({
    where: { id: document.id },
    include: {
      shares: {
        include: {
          user: true
        }
      }
    }
  })
  
  console.log(\`\\n\${docWithShares.title}의 공유자:\`)
  docWithShares.shares.forEach(share => {
    console.log(\`  - \${share.user.name} (역할: \${share.role})\`)
  })
  
  console.log('\\n✓ N:M 관계가 정상적으로 동작합니다!')
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
        pattern: 'model DocumentShare',
        message: 'DocumentShare 중간 모델이 정의되어야 합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: 'documents DocumentShare[]',
        message: 'User 모델에 documents DocumentShare[] 관계 필드가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: 'shares DocumentShare[]',
        message: 'Document 모델에 shares DocumentShare[] 관계 필드가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: '@@unique([userId, documentId])',
        message: '@@unique로 중복 방지가 필요합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success && 
                 result.output.includes('N:M 관계가 정상적으로 동작합니다')
        },
        message: 'N:M 관계가 올바르게 설정되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'DocumentShare 중간 모델을 정의하세요. userId, documentId, role 필드가 필요합니다.'
    },
    {
      level: 2,
      content: 'User와 Document 모델에 각각 DocumentShare[] 관계 필드를 추가하세요.',
      codeSnippet: `model User {
  id        Int              @id @default(autoincrement())
  email     String           @unique
  documents DocumentShare[]
}

model Document {
  id      Int              @id @default(autoincrement())
  title   String
  shares  DocumentShare[]
}`
    },
    {
      level: 3,
      content: 'DocumentShare 모델에 @relation으로 User와 Document와의 관계를 정의하고, @@unique로 중복을 방지하세요.',
      codeSnippet: `model DocumentShare {
  id         Int      @id @default(autoincrement())
  userId     Int
  documentId Int
  role       String   @default("VIEWER")
  user       User     @relation(fields: [userId], references: [id])
  document   Document @relation(fields: [documentId], references: [id])
  
  @@unique([userId, documentId])
}`
    },
    {
      level: 4,
      content: '완전한 N:M 관계 설정입니다. 중간 모델을 통해 추가 필드(role)도 저장할 수 있습니다.',
      codeSnippet: `model User {
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
}`
    },
    {
      level: 5,
      content: '완전한 정답입니다. N:M 관계의 모든 요소가 포함된 코드입니다.',
      codeSnippet: `generator client {
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
}`
    }
  ]
}
