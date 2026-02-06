import type { CurriculumStep } from '@/types/curriculum'

export const step_6_2: CurriculumStep = {
  id: 'step-6-2',
  title: 'Delete - 조건부 삭제 (deleteMany)',
  order: 13,
  category: 'delete',
  content: {
    mission: 'deleteMany() 메서드를 사용하여 조건에 맞는 여러 레코드를 한 번에 삭제하세요.',
    theory: `
      **deleteMany()**는 조건에 맞는 여러 레코드를 한 번에 삭제하는 메서드입니다.
      
      ## deleteMany() 기본 사용법
      
      \`\`\`javascript
      const result = await prisma.user.deleteMany({
        where: {
          status: "INACTIVE"
        }
      })
      
      console.log(result.count)  // 삭제된 레코드 개수
      \`\`\`
      
      **구조:**
      - \`where\`: 삭제할 레코드를 찾는 조건 (필수, 모든 필드 사용 가능)
      
      ## where 조건의 차이
      
      \`deleteMany()\`는 **모든 필드**를 where 조건에 사용할 수 있습니다.
      
      \`\`\`javascript
      // ✅ 가능: 일반 필드 사용
      await prisma.user.deleteMany({
        where: { status: "INACTIVE" }
      })
      
      // ✅ 가능: 복합 조건
      await prisma.user.deleteMany({
        where: {
          role: "USER",
          status: "INACTIVE",
          createdAt: {
            lt: new Date('2024-01-01')  // 2024년 이전 가입자
          }
        }
      })
      
      // ✅ 가능: @unique 필드도 사용 가능
      await prisma.user.deleteMany({
        where: { email: "user@example.com" }
      })
      \`\`\`
      
      **delete() vs deleteMany() where 조건:**
      - \`delete()\`: @unique/@id 필드만 가능
      - \`deleteMany()\`: 모든 필드 가능
      
      ## 반환값
      
      \`deleteMany()\`는 **삭제된 레코드 개수**를 반환합니다.
      
      \`\`\`javascript
      const result = await prisma.user.deleteMany({
        where: { status: "INACTIVE" }
      })
      
      console.log(result)
      // { count: 5 }  // 5개의 레코드가 삭제됨
      
      console.log(\`\${result.count}명의 사용자가 삭제되었습니다.\`)
      \`\`\`
      
      **반환값 구조:**
      - \`count\`: 삭제된 레코드 개수 (number)
      
      ## delete() vs deleteMany() 비교
      
      | 특징 | delete() | deleteMany() |
      |------|----------|--------------|
      | where 조건 | @unique/@id만 | 모든 필드 가능 |
      | 반환값 | 삭제된 레코드 객체 | { count: number } |
      | 여러 레코드 | ❌ 불가능 (1개만) | ✅ 가능 (여러 개) |
      | 사용 예 | 계정 삭제 | 대량 삭제 |
      
      ## 실무 활용 예시
      
      ### 1. 대량 삭제
      
      \`\`\`javascript
      // 모든 비활성 사용자 삭제
      const result = await prisma.user.deleteMany({
        where: { status: "INACTIVE" }
      })
      
      console.log(\`\${result.count}명의 사용자가 삭제되었습니다.\`)
      \`\`\`
      
      ### 2. 조건부 삭제
      
      \`\`\`javascript
      // 특정 기간 이전 가입자 삭제
      const result = await prisma.user.deleteMany({
        where: {
          createdAt: {
            lt: new Date('2020-01-01')  // 2020년 이전
          },
          status: "INACTIVE"
        }
      })
      \`\`\`
      
      ### 3. 전체 삭제 (주의!)
      
      \`\`\`javascript
      // where 조건 없이 사용하면 모든 레코드 삭제 (매우 위험!)
      const result = await prisma.user.deleteMany({
        where: {}  // 빈 객체 = 모든 레코드
      })
      
      console.log(\`모든 사용자(\${result.count}명)가 삭제되었습니다.\`)
      \`\`\`
      
      **주의:** where 조건을 빈 객체로 두면 **모든 레코드**가 삭제됩니다!
      
      ## 에러 처리
      
      \`deleteMany()\`는 조건에 맞는 레코드가 없어도 에러를 발생시키지 않습니다.
      
      \`\`\`javascript
      const result = await prisma.user.deleteMany({
        where: { id: 99999 }  // 존재하지 않는 ID
      })
      
      console.log(result.count)  // 0 (에러 없음)
      \`\`\`
      
      **delete() vs deleteMany() 에러 처리:**
      - \`delete()\`: 레코드가 없으면 에러 발생 (P2025)
      - \`deleteMany()\`: 레코드가 없어도 에러 없음 (count: 0)
      
      ## 실무 팁
      
      1. **대량 삭제**: 여러 레코드를 한 번에 삭제할 때 사용
      2. **조건부 삭제**: 특정 조건을 만족하는 레코드만 삭제
      3. **성능**: delete()를 여러 번 호출하는 것보다 효율적
      4. **주의**: where 조건을 빈 객체로 두면 모든 레코드가 삭제됨
      5. **백업**: 대량 삭제 전 데이터 백업 고려
      6. **반환값**: 삭제된 레코드 개수만 반환 (레코드 자체는 반환 안 됨)
      
      ## 언제 사용하나요?
      
      **delete() 사용:**
      - 특정 사용자 계정 삭제
      - 단일 레코드 삭제
      - 삭제된 레코드 데이터가 필요할 때
      
      **deleteMany() 사용:**
      - 여러 사용자의 일괄 삭제
      - 조건에 맞는 레코드 대량 삭제
      - 삭제된 개수만 필요할 때
      
      ## 안전한 삭제 패턴
      
      ### 1. 삭제 전 확인
      
      \`\`\`javascript
      // 먼저 삭제할 레코드 개수 확인
      const count = await prisma.user.count({
        where: { status: "INACTIVE" }
      })
      
      if (count > 0) {
        console.log(\`\${count}명의 사용자를 삭제합니다.\`)
        const result = await prisma.user.deleteMany({
          where: { status: "INACTIVE" }
        })
        console.log(\`\${result.count}명이 삭제되었습니다.\`)
      }
      \`\`\`
      
      ### 2. 트랜잭션으로 안전하게
      
      \`\`\`javascript
      // 트랜잭션으로 삭제 (레벨 3에서 학습)
      await prisma.$transaction(async (tx) => {
        // 삭제 전 백업
        const users = await tx.user.findMany({
          where: { status: "INACTIVE" }
        })
        
        // 백업 로직 실행
        
        // 삭제 실행
        await tx.user.deleteMany({
          where: { status: "INACTIVE" }
        })
      })
      \`\`\`
    `,
    objectives: [
      'deleteMany() 메서드 기본 사용법 이해',
      'where 조건으로 여러 레코드 찾아 삭제',
      'deleteMany()의 반환값 이해 (삭제된 개수)',
      'delete() vs deleteMany() 차이점 이해',
      '대량 삭제 실무 활용',
      '안전한 삭제 패턴 학습'
    ],
    expectedOutput: '여러 레코드가 성공적으로 삭제되어야 합니다.'
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
  status    String   @default("ACTIVE")
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
  // 테스트용 사용자들 생성
  await prisma.user.createMany({
    data: [
      { email: "user1@example.com", name: "User 1", status: "INACTIVE" },
      { email: "user2@example.com", name: "User 2", status: "INACTIVE" },
      { email: "user3@example.com", name: "User 3", status: "ACTIVE" },
      { email: "user4@example.com", name: "User 4", status: "INACTIVE" }
    ]
  })
  
  console.log('초기 사용자 생성 완료\\n')
  
  // 1. deleteMany()로 모든 비활성 사용자 삭제
  // 힌트: where에 status: "INACTIVE"
  const result = // 여기에 코드를 작성하세요
  
  console.log(\`\${result.count}명의 사용자가 삭제되었습니다.\`)
  
  // 2. 삭제 후 남은 사용자 확인
  const remainingUsers = await prisma.user.findMany()
  console.log('\\n남은 사용자:', remainingUsers.length, '명')
  remainingUsers.forEach(user => {
    console.log(\`  \${user.name}: \${user.status}\`)
  })
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
        pattern: 'deleteMany',
        message: 'deleteMany() 메서드를 사용해야 합니다.'
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
                 result.output.includes('명의 사용자가 삭제되었습니다')
        },
        message: 'deleteMany()가 올바르게 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'deleteMany()는 where 조건만 필요합니다. where에는 일반 필드도 사용할 수 있습니다.'
    },
    {
      level: 2,
      content: 'where 조건으로 status가 "INACTIVE"인 사용자들을 찾아 삭제하세요.',
      codeSnippet: `const result = await prisma.user.deleteMany({
  where: { status: "INACTIVE" }
})`
    },
    {
      level: 3,
      content: 'deleteMany()는 삭제된 레코드 개수를 반환합니다. result.count로 확인할 수 있습니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      { email: "user1@example.com", name: "User 1", status: "INACTIVE" },
      { email: "user2@example.com", name: "User 2", status: "INACTIVE" },
      { email: "user3@example.com", name: "User 3", status: "ACTIVE" },
      { email: "user4@example.com", name: "User 4", status: "INACTIVE" }
    ]
  })
  
  console.log('초기 사용자 생성 완료\\n')
  
  const result = await prisma.user.deleteMany({
    where: { status: "INACTIVE" }
  })
  
  console.log(\`\${result.count}명의 사용자가 삭제되었습니다.\`)
  
  const remainingUsers = await prisma.user.findMany()
  console.log('\\n남은 사용자:', remainingUsers.length, '명')
  remainingUsers.forEach(user => {
    console.log(\`  \${user.name}: \${user.status}\`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    },
    {
      level: 4,
      content: 'deleteMany()는 delete()와 달리 일반 필드를 where 조건에 사용할 수 있고, 여러 레코드를 한 번에 삭제할 수 있습니다.',
      codeSnippet: `// deleteMany()는 모든 필드를 where 조건에 사용 가능
const result = await prisma.user.deleteMany({
  where: {
    status: "INACTIVE",  // 일반 필드 사용 가능
    createdAt: {
      lt: new Date('2024-01-01')  // 복합 조건도 가능
    }
  }
})`
    },
    {
      level: 5,
      content: '완전한 정답입니다. deleteMany()의 모든 기능을 활용한 코드입니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      { email: "user1@example.com", name: "User 1", status: "INACTIVE" },
      { email: "user2@example.com", name: "User 2", status: "INACTIVE" },
      { email: "user3@example.com", name: "User 3", status: "ACTIVE" },
      { email: "user4@example.com", name: "User 4", status: "INACTIVE" }
    ]
  })
  
  console.log('초기 사용자 생성 완료\\n')
  
  const result = await prisma.user.deleteMany({
    where: { status: "INACTIVE" }
  })
  
  console.log(\`\${result.count}명의 사용자가 삭제되었습니다.\`)
  
  const remainingUsers = await prisma.user.findMany()
  console.log('\\n남은 사용자:', remainingUsers.length, '명')
  remainingUsers.forEach(user => {
    console.log(\`  \${user.name}: \${user.status}\`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
