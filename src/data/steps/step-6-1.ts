import type { CurriculumStep } from '@/types/curriculum'

export const step_6_1: CurriculumStep = {
  id: 'step-6-1',
  title: 'Delete - 단일 레코드 삭제',
  order: 12,
  category: 'delete',
  content: {
    mission: 'delete() 메서드를 사용하여 특정 사용자를 삭제하세요.',
    theory: `
      **Prisma의 delete()** 메서드는 데이터베이스에서 단일 레코드를 삭제하는 데 사용됩니다.
      
      ## delete() 기본 사용법
      
      \`\`\`javascript
      const deletedUser = await prisma.user.delete({
        where: { id: 1 }
      })
      \`\`\`
      
      **구조:**
      - \`where\`: 삭제할 레코드를 찾는 조건 (필수)
      - **@unique 또는 @id 필드**로만 검색 가능
      
      ## where 조건
      
      \`delete()\`는 **@unique 또는 @id 필드**로만 검색할 수 있습니다.
      
      \`\`\`javascript
      // ✅ 가능: @id 필드 사용
      await prisma.user.delete({
        where: { id: 1 }
      })
      
      // ✅ 가능: @unique 필드 사용
      await prisma.user.delete({
        where: { email: "user@example.com" }
      })
      
      // ❌ 불가능: 일반 필드 사용
      await prisma.user.delete({
        where: { name: "Alice" }  // 에러 발생!
      })
      \`\`\`
      
      **왜 @unique/@id만?**
      - 고유 필드는 항상 0개 또는 1개의 결과만 반환
      - 여러 레코드가 삭제되는 것을 방지 (데이터 무결성)
      - 실수로 대량 삭제되는 것을 방지
      
      ## 반환값
      
      \`delete()\`는 **삭제된 레코드 전체**를 반환합니다.
      
      \`\`\`javascript
      const deleted = await prisma.user.delete({
        where: { id: 1 }
      })
      
      console.log(deleted)
      // {
      //   id: 1,
      //   email: "user@example.com",
      //   name: "Alice",
      //   createdAt: "2024-01-01T10:00:00Z",
      //   updatedAt: "2024-01-05T15:30:00Z"
      // }
      \`\`\`
      
      **마지막 기회:**
      - 삭제된 레코드의 정보를 로그에 남기거나
      - 백업을 위해 데이터를 저장할 수 있음
      
      ## 에러 처리
      
      레코드가 존재하지 않으면 에러가 발생합니다.
      
      \`\`\`javascript
      try {
        const deleted = await prisma.user.delete({
          where: { id: 999 }  // 존재하지 않는 ID
        })
      } catch (error) {
        if (error.code === 'P2025') {
          console.log('레코드를 찾을 수 없습니다.')
        }
      }
      \`\`\`
      
      **에러 코드:**
      - \`P2025\`: 레코드를 찾을 수 없음
      
      ## 안전한 삭제 패턴
      
      ### 1. 존재 확인 후 삭제
      
      \`\`\`javascript
      // 먼저 레코드가 존재하는지 확인
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (user) {
        const deleted = await prisma.user.delete({
          where: { id: userId }
        })
        console.log('삭제 완료:', deleted)
      } else {
        console.log('사용자를 찾을 수 없습니다.')
      }
      \`\`\`
      
      ### 2. try-catch로 에러 처리
      
      \`\`\`javascript
      try {
        const deleted = await prisma.user.delete({
          where: { id: userId }
        })
        console.log('삭제 완료:', deleted)
      } catch (error) {
        if (error.code === 'P2025') {
          console.log('사용자를 찾을 수 없습니다.')
        } else {
          console.error('삭제 실패:', error)
        }
      }
      \`\`\`
      
      ## 실무 활용 예시
      
      ### 1. 사용자 계정 삭제
      
      \`\`\`javascript
      // 사용자 삭제
      const deletedUser = await prisma.user.delete({
        where: { id: userId }
      })
      
      console.log(\`사용자 \${deletedUser.email}가 삭제되었습니다.\`)
      \`\`\`
      
      ### 2. 이메일로 삭제
      
      \`\`\`javascript
      // 이메일로 사용자 찾아서 삭제
      const deleted = await prisma.user.delete({
        where: { email: "user@example.com" }
      })
      \`\`\`
      
      ### 3. 삭제 전 데이터 백업
      
      \`\`\`javascript
      // 삭제 전 데이터 저장
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (user) {
        // 백업 로직 (예: 다른 테이블에 저장)
        await backupUser(user)
        
        // 삭제 실행
        await prisma.user.delete({
          where: { id: userId }
        })
      }
      \`\`\`
      
      ## delete() vs deleteMany() 차이
      
      | 특징 | delete() | deleteMany() |
      |------|----------|--------------|
      | where 조건 | @unique/@id만 | 모든 필드 가능 |
      | 반환값 | 삭제된 레코드 객체 | 삭제된 개수 (count) |
      | 여러 레코드 | ❌ 불가능 (1개만) | ✅ 가능 (여러 개) |
      | 사용 예 | 계정 삭제 | 대량 삭제 |
      
      ## 주의사항
      
      1. **영구 삭제**: delete()는 데이터를 완전히 삭제합니다 (복구 불가)
      2. **관계 데이터**: 다른 테이블과 관계가 있으면 외래 키 제약으로 삭제 실패할 수 있음
      3. **CASCADE**: 관계 설정에 따라 관련 데이터도 함께 삭제될 수 있음
      4. **백업**: 중요한 데이터는 삭제 전 백업 고려
      5. **Soft Delete**: 완전 삭제 대신 deletedAt 필드로 표시하는 패턴도 있음 (레벨 4에서 학습)
      
      ## 관계가 있는 경우
      
      \`\`\`javascript
      // User가 Document를 가지고 있는 경우
      // User 삭제 시 Document도 함께 삭제하려면:
      
      model User {
        id        Int        @id @default(autoincrement())
        documents Document[]
      }
      
      model Document {
        id     Int  @id @default(autoincrement())
        userId Int
        user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
      }
      \`\`\`
      
      **onDelete 옵션:**
      - \`Cascade\`: User 삭제 시 Document도 함께 삭제
      - \`SetNull\`: User 삭제 시 Document의 userId를 NULL로 설정
      - \`Restrict\`: User가 Document를 가지고 있으면 삭제 불가 (기본값)
    `,
    objectives: [
      'delete() 메서드 기본 사용법 이해',
      'where 조건으로 특정 레코드 찾아 삭제',
      'delete()의 반환값 이해 (삭제된 레코드)',
      '에러 처리 방법 학습 (레코드가 없을 때)',
      '안전한 삭제 패턴 학습',
      'delete() vs deleteMany() 차이점 이해'
    ],
    expectedOutput: '사용자가 성공적으로 삭제되어야 합니다.'
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
  // 테스트용 사용자 생성
  const user = await prisma.user.create({
    data: {
      email: "delete@example.com",
      name: "Delete Me"
    }
  })
  console.log('생성된 사용자:', user)
  
  // 1. delete()로 사용자 삭제
  // 힌트: where에 id 사용
  const deleted = // 여기에 코드를 작성하세요
  
  console.log('\\n삭제된 사용자:', deleted)
  
  // 2. 삭제 확인 (조회 시 null 반환)
  const found = await prisma.user.findUnique({
    where: { id: user.id }
  })
  console.log('\\n삭제 후 조회:', found)  // null
  
  // 3. 이메일로 삭제 (에러 처리 포함)
  // 먼저 사용자 생성
  const user2 = await prisma.user.create({
    data: {
      email: "delete2@example.com",
      name: "Delete Me 2"
    }
  })
  
  // 이메일로 삭제
  const deletedByEmail = // 여기에 코드를 작성하세요
  
  console.log('\\n이메일로 삭제:', deletedByEmail)
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
        pattern: 'delete',
        message: 'delete() 메서드를 사용해야 합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'where',
        message: 'where 조건을 사용해야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success && 
                 result.output.includes('삭제된 사용자') &&
                 result.output.includes('삭제 후 조회')
        },
        message: 'delete()가 올바르게 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'delete() 메서드는 where 조건만 필요합니다. where에는 @id 또는 @unique 필드를 사용하세요.'
    },
    {
      level: 2,
      content: 'where 조건으로 id를 사용하여 특정 사용자를 삭제하세요.',
      codeSnippet: `const deleted = await prisma.user.delete({
  where: { id: user.id }
})`
    },
    {
      level: 3,
      content: '이메일로도 삭제할 수 있습니다. email은 @unique 필드이므로 where 조건에 사용 가능합니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "delete@example.com",
      name: "Delete Me"
    }
  })
  console.log('생성된 사용자:', user)
  
  const deleted = await prisma.user.delete({
    where: { id: user.id }
  })
  console.log('\\n삭제된 사용자:', deleted)
  
  const found = await prisma.user.findUnique({
    where: { id: user.id }
  })
  console.log('\\n삭제 후 조회:', found)
  
  const user2 = await prisma.user.create({
    data: {
      email: "delete2@example.com",
      name: "Delete Me 2"
    }
  })
  
  const deletedByEmail = await prisma.user.delete({
    where: { email: "delete2@example.com" }
  })
  console.log('\\n이메일로 삭제:', deletedByEmail)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    },
    {
      level: 4,
      content: 'delete()는 삭제된 레코드 전체를 반환합니다. 삭제 후 조회하면 null이 반환됩니다.',
      codeSnippet: `const deleted = await prisma.user.delete({
  where: { id: user.id }
})
// 반환값: { id, email, name, createdAt, updatedAt }

// 삭제 후 조회
const found = await prisma.user.findUnique({
  where: { id: user.id }
})
// 반환값: null`
    },
    {
      level: 5,
      content: '완전한 정답입니다. delete() 메서드의 모든 기능을 활용한 코드입니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "delete@example.com",
      name: "Delete Me"
    }
  })
  console.log('생성된 사용자:', user)
  
  const deleted = await prisma.user.delete({
    where: { id: user.id }
  })
  console.log('\\n삭제된 사용자:', deleted)
  
  const found = await prisma.user.findUnique({
    where: { id: user.id }
  })
  console.log('\\n삭제 후 조회:', found)
  
  const user2 = await prisma.user.create({
    data: {
      email: "delete2@example.com",
      name: "Delete Me 2"
    }
  })
  
  const deletedByEmail = await prisma.user.delete({
    where: { email: "delete2@example.com" }
  })
  console.log('\\n이메일로 삭제:', deletedByEmail)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
