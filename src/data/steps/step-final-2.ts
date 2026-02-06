import type { CurriculumStep } from '@/types/curriculum'

export const step_final_2: CurriculumStep = {
  id: 'step-final-2',
  title: '레벨 2 최종 연습문제',
  order: 16,
  category: 'advanced',
  content: {
    mission: '레벨 2에서 배운 모든 내용을 종합하여 완전한 CRUD와 관계 설정을 구현하세요. User와 Document 모델을 사용하여 사용자 관리 및 문서 관리 시스템을 만드세요.',
    theory: `
      ## 레벨 2 종합 연습문제
      
      이 문제는 레벨 2에서 배운 모든 내용을 종합적으로 활용하는 실전 문제입니다.
      
      ### 요구사항
      
      1. **Prisma 스키마 정의**
         - User 모델:
           - id, email, name, createdAt, updatedAt
           - documents 관계 (1:N)
         - Document 모델:
           - id, title, content, userId, createdAt, updatedAt
           - user 관계 (N:1)
      
      2. **CRUD 작업**
         - Create: 사용자와 문서 생성
         - Read: 사용자와 문서 조회 (include/select 활용)
         - Update: 사용자 정보 수정, 문서 내용 수정
         - Delete: 문서 삭제
      
      3. **관계 데이터 조회**
         - include로 사용자와 문서 함께 조회
         - select로 특정 필드만 선택 조회
      
      4. **에러 처리**
         - null 체크
         - 존재하지 않는 레코드 처리
      
      ### 평가 기준
      
      - ✅ Prisma 스키마가 1:N 관계를 올바르게 정의하는가?
      - ✅ CRUD 작업이 모두 올바르게 구현되는가?
      - ✅ include/select를 적절히 활용하는가?
      - ✅ 에러 처리가 올바르게 구현되는가?
      
      ### 실전 팁
      
      1. **스키마 작성 순서**
         - generator client
         - datasource db
         - User 모델 정의
         - Document 모델 정의 (관계 포함)
      
      2. **CRUD 작업 순서**
         - Create: 데이터 생성
         - Read: 데이터 조회 및 확인
         - Update: 데이터 수정
         - Delete: 데이터 삭제
      
      3. **관계 조회**
         - include: 모든 필드 필요 시
         - select: 특정 필드만 필요 시
      
      4. **에러 처리**
         - findUnique는 null 반환 가능
         - delete/update는 에러 발생 가능
    `,
    objectives: [
      '레벨 2의 모든 개념을 종합적으로 활용',
      '1:N 관계 설정 및 활용',
      'CRUD 작업 완전 구현',
      'include/select로 관계 데이터 조회',
      '에러 처리 및 null 체크',
      '실전 프로젝트 수준의 코드 작성'
    ],
    expectedOutput: '완전한 CRUD와 관계 설정이 구현되어야 합니다.'
  },
  initialFiles: [
    {
      name: 'schema.prisma',
      path: 'prisma/schema.prisma',
      language: 'prisma',
      content: `// 레벨 2 최종 연습문제
// User와 Document 모델을 정의하고 1:N 관계를 설정하세요

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 여기에 User와 Document 모델을 정의하세요
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
  // 1. Create: 사용자와 문서 생성
  // 사용자 1명과 문서 2개를 함께 생성하세요
  
  // 2. Read: include로 사용자와 문서 함께 조회
  // include를 사용하여 사용자와 문서를 함께 조회하세요
  
  // 3. Read: select로 특정 필드만 선택 조회
  // select를 사용하여 사용자의 id, name과 문서의 id, title만 조회하세요
  
  // 4. Update: 사용자 정보 수정
  // update()로 사용자의 name을 수정하세요
  
  // 5. Update: 문서 내용 수정
  // update()로 문서의 content를 수정하세요
  
  // 6. Delete: 문서 삭제
  // delete()로 문서 하나를 삭제하세요
  
  // 7. Read: 삭제 후 확인
  // include로 사용자와 남은 문서들을 조회하여 삭제가 잘 되었는지 확인하세요
  
  console.log('✅ 레벨 2 최종 연습문제 완료!')
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
        message: 'User 모델이 정의되어야 합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: 'model Document',
        message: 'Document 모델이 정의되어야 합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: 'documents Document[]',
        message: 'User 모델에 documents Document[] 관계 필드가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: '@relation',
        message: '@relation으로 관계를 정의해야 합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'create',
        message: 'Create 작업이 필요합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'include',
        message: 'include를 사용해야 합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'select',
        message: 'select를 사용해야 합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'update',
        message: 'Update 작업이 필요합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'delete',
        message: 'Delete 작업이 필요합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success && 
                 result.output.includes('레벨 2 최종 연습문제 완료')
        },
        message: '코드가 성공적으로 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '먼저 스키마를 작성하세요. User 모델과 Document 모델을 정의하고, 1:N 관계를 설정하세요.'
    },
    {
      level: 2,
      content: 'User 모델에 documents Document[] 필드를 추가하고, Document 모델에 userId Int와 user User @relation(...) 필드를 추가하세요.'
    },
    {
      level: 3,
      content: 'CRUD 작업을 순서대로 구현하세요. Create → Read → Update → Delete 순서로 진행하세요.',
      codeSnippet: `// 1. Create
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "Test User",
    documents: {
      create: [
        { title: "문서 1", content: "내용 1" },
        { title: "문서 2", content: "내용 2" }
      ]
    }
  }
})

// 2. Read with include
const userWithDocs = await prisma.user.findUnique({
  where: { id: user.id },
  include: { documents: true }
})

// 3. Read with select
const userSelected = await prisma.user.findUnique({
  where: { id: user.id },
  select: {
    id: true,
    name: true,
    documents: {
      select: {
        id: true,
        title: true
      }
    }
  }
})`
    },
    {
      level: 4,
      content: 'Update와 Delete 작업을 구현하세요. update()와 delete() 메서드를 사용하세요.',
      codeSnippet: `// 4. Update user
const updatedUser = await prisma.user.update({
  where: { id: user.id },
  data: { name: "Updated Name" }
})

// 5. Update document
const updatedDoc = await prisma.document.update({
  where: { id: userWithDocs.documents[0].id },
  data: { content: "수정된 내용" }
})

// 6. Delete document
const deletedDoc = await prisma.document.delete({
  where: { id: userWithDocs.documents[0].id }
})`
    },
    {
      level: 5,
      content: '완전한 정답입니다. 모든 요구사항을 만족하는 코드입니다.',
      codeSnippet: `// schema.prisma
generator client {
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
}

// app.js
// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  // 1. Create
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "Test User",
      documents: {
        create: [
          { title: "문서 1", content: "내용 1" },
          { title: "문서 2", content: "내용 2" }
        ]
      }
    }
  })
  console.log('사용자 생성:', user.email)
  
  // 2. Read with include
  const userWithDocs = await prisma.user.findUnique({
    where: { id: user.id },
    include: { documents: true }
  })
  console.log('\\n문서 개수:', userWithDocs.documents.length)
  
  // 3. Read with select
  const userSelected = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      documents: {
        select: {
          id: true,
          title: true
        }
      }
    }
  })
  console.log('\\n선택된 필드:', Object.keys(userSelected))
  
  // 4. Update user
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name: "Updated Name" }
  })
  console.log('\\n사용자 수정:', updatedUser.name)
  
  // 5. Update document
  if (userWithDocs.documents.length > 0) {
    const updatedDoc = await prisma.document.update({
      where: { id: userWithDocs.documents[0].id },
      data: { content: "수정된 내용" }
    })
    console.log('문서 수정:', updatedDoc.title)
    
    // 6. Delete document
    const deletedDoc = await prisma.document.delete({
      where: { id: userWithDocs.documents[0].id }
    })
    console.log('문서 삭제:', deletedDoc.title)
  }
  
  // 7. Read after delete
  const finalUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { documents: true }
  })
  console.log('\\n삭제 후 문서 개수:', finalUser.documents.length)
  
  console.log('\\n✅ 레벨 2 최종 연습문제 완료!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
