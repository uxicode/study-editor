import type { CurriculumStep } from '@/types/curriculum'

export const step_7_1: CurriculumStep = {
  id: 'step-7-1',
  title: '1:N 관계 설정 (User ↔ Document)',
  order: 14,
  category: 'relations',
  content: {
    mission: 'User 모델과 Document 모델 간의 1:N 관계를 설정하세요. 한 사용자는 여러 문서를 가질 수 있습니다.',
    theory: `
      **관계(Relation)**는 데이터베이스에서 여러 테이블을 연결하는 핵심 개념입니다.
      
      ## 1:N 관계란?
      
      **1:N (One-to-Many)** 관계는 한 레코드가 여러 레코드를 가질 수 있는 관계입니다.
      
      **예시:**
      - 한 사용자(User)는 여러 문서(Document)를 작성할 수 있음
      - 한 블로그(Post)는 여러 댓글(Comment)을 가질 수 있음
      - 한 주문(Order)은 여러 주문 항목(OrderItem)을 가질 수 있음
      
      ## Prisma에서 1:N 관계 정의
      
      ### 기본 구조
      
      \`\`\`prisma
      model User {
        id        Int        @id @default(autoincrement())
        email     String     @unique
        documents Document[]  // 1:N 관계 (한 사용자가 여러 문서)
      }
      
      model Document {
        id     Int    @id @default(autoincrement())
        title  String
        userId Int    // 외래 키 (Foreign Key)
        user   User   @relation(fields: [userId], references: [id])
      }
      \`\`\`
      
      ### 관계 필드 설명
      
      **User 모델:**
      - \`documents Document[]\`: 한 사용자가 가진 여러 문서들
      - 배열 타입(\`[]\`)으로 여러 개를 표현
      
      **Document 모델:**
      - \`userId Int\`: 외래 키 (Foreign Key) - User의 id를 참조
      - \`user User @relation(...)\`: 관계 필드 - User 모델과의 관계 정의
      
      ### @relation 속성
      
      \`\`\`prisma
      user User @relation(fields: [userId], references: [id])
      \`\`\`
      
      - \`fields: [userId]\`: 현재 모델의 외래 키 필드
      - \`references: [id]\`: 참조하는 모델의 기본 키 필드
      
      ## 외래 키 (Foreign Key)
      
      **외래 키**는 다른 테이블의 기본 키를 참조하는 필드입니다.
      
      \`\`\`prisma
      model Document {
        id     Int    @id @default(autoincrement())
        userId Int    // 외래 키: User의 id를 참조
        user   User   @relation(fields: [userId], references: [id])
      }
      \`\`\`
      
      **특징:**
      - 외래 키는 참조하는 테이블의 기본 키와 타입이 같아야 함
      - 외래 키로 연결된 레코드는 참조 무결성을 보장
      
      ## 관계 필드 네이밍
      
      **관계 필드 이름 규칙:**
      - **1쪽 (User)**: 복수형 사용 (\`documents\`, \`posts\`, \`comments\`)
      - **N쪽 (Document)**: 단수형 사용 (\`user\`, \`author\`, \`owner\`)
      
      \`\`\`prisma
      model User {
        documents Document[]  // 복수형
      }
      
      model Document {
        user User  // 단수형
      }
      \`\`\`
      
      ## 관계 이름 지정 (선택사항)
      
      여러 관계가 있을 때 이름을 지정할 수 있습니다.
      
      \`\`\`prisma
      model User {
        id        Int        @id @default(autoincrement())
        documents Document[] @relation("UserDocuments")
        comments  Comment[]  @relation("UserComments")
      }
      
      model Document {
        id     Int    @id @default(autoincrement())
        userId Int
        user   User   @relation("UserDocuments", fields: [userId], references: [id])
      }
      \`\`\`
      
      ## 실무 예시: 웹 에디터 구조
      
      \`\`\`prisma
      model User {
        id        Int        @id @default(autoincrement())
        email     String     @unique
        name      String?
        documents Document[]  // 사용자가 작성한 문서들
        createdAt DateTime   @default(now())
        updatedAt DateTime   @updatedAt
      }
      
      model Document {
        id        Int      @id @default(autoincrement())
        title     String
        content   String?
        userId    Int      // 작성자 ID
        user      User     @relation(fields: [userId], references: [id])
        createdAt DateTime @default(now())
        updatedAt DateTime @updatedAt
      }
      \`\`\`
      
      **이 구조의 의미:**
      - 한 사용자는 여러 문서를 작성할 수 있음
      - 각 문서는 한 명의 사용자에 속함
      - \`userId\`로 문서의 작성자를 식별
      
      ## 관계 데이터 사용
      
      관계가 설정되면 Prisma Client에서 관계 데이터를 쉽게 조회할 수 있습니다.
      
      \`\`\`javascript
      // 사용자와 함께 문서 조회
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        include: {
          documents: true  // 관계 데이터 포함
        }
      })
      
      // 문서와 함께 작성자 조회
      const document = await prisma.document.findUnique({
        where: { id: 1 },
        include: {
          user: true  // 관계 데이터 포함
        }
      })
      \`\`\`
      
      ## 관계 생성
      
      \`\`\`javascript
      // 사용자와 문서를 함께 생성
      const user = await prisma.user.create({
        data: {
          email: "user@example.com",
          name: "Alice",
          documents: {
            create: [
              { title: "첫 번째 문서", content: "내용..." },
              { title: "두 번째 문서", content: "내용..." }
            ]
          }
        }
      })
      \`\`\`
      
      ## 주의사항
      
      1. **외래 키 타입 일치**: \`userId\`는 \`User.id\`와 같은 타입이어야 함
      2. **필수 필드**: 외래 키는 일반적으로 필수 (nullable이면 선택적 관계)
      3. **참조 무결성**: 존재하지 않는 User를 참조할 수 없음
      4. **삭제 옵션**: \`onDelete\` 옵션으로 삭제 동작 제어 가능 (레벨 3에서 학습)
    `,
    objectives: [
      '1:N 관계의 개념 이해',
      'Prisma에서 1:N 관계 정의 방법',
      '@relation 속성 사용법',
      '외래 키(Foreign Key) 개념 이해',
      '관계 필드 네이밍 규칙',
      'User ↔ Document 관계 설정'
    ],
    expectedOutput: 'User와 Document 모델 간의 1:N 관계가 설정되어야 합니다.'
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
  updatedAt DateTime @updatedAt
  
  // documents 필드 추가: Document[] 타입으로 여러 문서를 가질 수 있음
  // documents Document[]
}

model Document {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // userId 필드 추가: 외래 키로 User의 id를 참조
  // userId Int
  
  // user 관계 필드 추가: @relation으로 User와의 관계 정의
  // user User @relation(fields: [userId], references: [id])
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
  console.log('1:N 관계 테스트\\n')
  
  // 1. 사용자와 문서를 함께 생성
  const user = await prisma.user.create({
    data: {
      email: "author@example.com",
      name: "Document Author",
      documents: {
        create: [
          { title: "첫 번째 문서", content: "문서 내용 1" },
          { title: "두 번째 문서", content: "문서 내용 2" }
        ]
      }
    }
  })
  
  console.log('사용자 생성:', user.email)
  console.log('문서 개수:', user.documents?.length || 0)
  
  // 2. 사용자와 함께 문서 조회
  const userWithDocs = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      documents: true
    }
  })
  
  console.log('\\n사용자의 문서들:')
  userWithDocs?.documents.forEach(doc => {
    console.log(\`  - \${doc.title}\`)
  })
  
  // 3. 문서와 함께 작성자 조회
  const document = await prisma.document.findFirst({
    include: {
      user: true
    }
  })
  
  console.log('\\n문서 작성자:')
  console.log(\`  문서: \${document?.title}\`)
  console.log(\`  작성자: \${document?.user?.name} (\${document?.user?.email})\`)
  
  console.log('\\n✓ 1:N 관계가 정상적으로 동작합니다!')
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
        pattern: 'documents Document[]',
        message: 'User 모델에 documents Document[] 관계 필드가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: 'userId Int',
        message: 'Document 모델에 userId Int 외래 키 필드가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: '@relation',
        message: '@relation 속성을 사용하여 관계를 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /user\s+User\s+@relation\(fields:\s*\[userId\],\s*references:\s*\[id\]\)/,
        message: 'user 관계 필드는 "User @relation(fields: [userId], references: [id])" 형식이어야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success && 
                 result.output.includes('1:N 관계가 정상적으로 동작합니다')
        },
        message: '1:N 관계가 올바르게 설정되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'User 모델에 documents Document[] 필드를 추가하세요. 이 필드는 한 사용자가 가진 여러 문서를 나타냅니다.'
    },
    {
      level: 2,
      content: 'Document 모델에 userId Int 필드를 추가하세요. 이 필드는 외래 키로 User의 id를 참조합니다.',
      codeSnippet: `model Document {
  id     Int    @id @default(autoincrement())
  title  String
  userId Int    // 외래 키
}`
    },
    {
      level: 3,
      content: 'Document 모델에 user User @relation(...) 필드를 추가하여 관계를 정의하세요.',
      codeSnippet: `model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  documents Document[]  // 1:N 관계
}

model Document {
  id     Int    @id @default(autoincrement())
  title  String
  userId Int    // 외래 키
  user   User   @relation(fields: [userId], references: [id])
}`
    },
    {
      level: 4,
      content: '완전한 관계 설정입니다. @relation의 fields는 외래 키 필드, references는 참조하는 기본 키 필드입니다.',
      codeSnippet: `model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  name      String?
  documents Document[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Document {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`
    },
    {
      level: 5,
      content: '완전한 정답입니다. 1:N 관계의 모든 요소가 포함된 코드입니다.',
      codeSnippet: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  name      String?
  documents Document[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Document {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`
    }
  ]
}
