import type { CurriculumStep } from '@/types/curriculum'

export const step_5_2: CurriculumStep = {
  id: 'step-5-2',
  title: 'Update - 조건부 업데이트 (updateMany)',
  order: 11,
  category: 'update',
  content: {
    mission: 'updateMany() 메서드를 사용하여 여러 레코드를 한 번에 수정하세요.',
    theory: `
      **updateMany()**는 조건에 맞는 여러 레코드를 한 번에 수정하는 메서드입니다.
      
      ## updateMany() 기본 사용법
      
      \`\`\`javascript
      const result = await prisma.user.updateMany({
        where: {
          status: "INACTIVE"
        },
        data: {
          status: "ACTIVE"
        }
      })
      
      console.log(result.count)  // 수정된 레코드 개수
      \`\`\`
      
      **구조:**
      - \`where\`: 수정할 레코드를 찾는 조건 (필수, 모든 필드 사용 가능)
      - \`data\`: 수정할 필드와 값 (필수)
      
      ## where 조건의 차이
      
      \`updateMany()\`는 **모든 필드**를 where 조건에 사용할 수 있습니다.
      
      \`\`\`javascript
      // ✅ 가능: 일반 필드 사용
      await prisma.user.updateMany({
        where: { status: "INACTIVE" },
        data: { status: "ACTIVE" }
      })
      
      // ✅ 가능: 복합 조건
      await prisma.user.updateMany({
        where: {
          role: "USER",
          status: "INACTIVE"
        },
        data: { status: "ACTIVE" }
      })
      
      // ✅ 가능: @unique 필드도 사용 가능
      await prisma.user.updateMany({
        where: { email: "user@example.com" },
        data: { name: "New Name" }
      })
      \`\`\`
      
      **update() vs updateMany() where 조건:**
      - \`update()\`: @unique/@id 필드만 가능
      - \`updateMany()\`: 모든 필드 가능
      
      ## 반환값
      
      \`updateMany()\`는 **수정된 레코드 개수**를 반환합니다.
      
      \`\`\`javascript
      const result = await prisma.user.updateMany({
        where: { status: "INACTIVE" },
        data: { status: "ACTIVE" }
      })
      
      console.log(result)
      // { count: 5 }  // 5개의 레코드가 수정됨
      
      console.log(\`\${result.count}개의 사용자가 활성화되었습니다.\`)
      \`\`\`
      
      **반환값 구조:**
      - \`count\`: 수정된 레코드 개수 (number)
      
      ## update() vs updateMany() 비교
      
      | 특징 | update() | updateMany() |
      |------|----------|--------------|
      | where 조건 | @unique/@id만 | 모든 필드 가능 |
      | 반환값 | 수정된 레코드 객체 | { count: number } |
      | 여러 레코드 | ❌ 불가능 (1개만) | ✅ 가능 (여러 개) |
      | 사용 예 | 프로필 수정 | 대량 상태 변경 |
      
      ## 실무 활용 예시
      
      ### 1. 대량 상태 변경
      
      \`\`\`javascript
      // 모든 비활성 사용자를 활성화
      const result = await prisma.user.updateMany({
        where: { status: "INACTIVE" },
        data: { status: "ACTIVE" }
      })
      
      console.log(\`\${result.count}명의 사용자가 활성화되었습니다.\`)
      \`\`\`
      
      ### 2. 조건부 업데이트
      
      \`\`\`javascript
      // 특정 역할의 사용자들만 업데이트
      const result = await prisma.user.updateMany({
        where: {
          role: "USER",
          createdAt: {
            lt: new Date('2024-01-01')  // 2024년 이전 가입자
          }
        },
        data: {
          status: "LEGACY"
        }
      })
      \`\`\`
      
      ### 3. 전체 업데이트 (주의!)
      
      \`\`\`javascript
      // where 조건 없이 사용하면 모든 레코드 수정 (위험!)
      const result = await prisma.user.updateMany({
        where: {},  // 빈 객체 = 모든 레코드
        data: {
          status: "ACTIVE"
        }
      })
      
      console.log(\`모든 사용자(\${result.count}명)가 활성화되었습니다.\`)
      \`\`\`
      
      **주의:** where 조건을 빈 객체로 두면 **모든 레코드**가 수정됩니다!
      
      ## 에러 처리
      
      \`updateMany()\`는 조건에 맞는 레코드가 없어도 에러를 발생시키지 않습니다.
      
      \`\`\`javascript
      const result = await prisma.user.updateMany({
        where: { id: 99999 },  // 존재하지 않는 ID
        data: { name: "Test" }
      })
      
      console.log(result.count)  // 0 (에러 없음)
      \`\`\`
      
      **update() vs updateMany() 에러 처리:**
      - \`update()\`: 레코드가 없으면 에러 발생 (P2025)
      - \`updateMany()\`: 레코드가 없어도 에러 없음 (count: 0)
      
      ## 실무 팁
      
      1. **대량 업데이트**: 여러 레코드를 한 번에 수정할 때 사용
      2. **조건부 업데이트**: 특정 조건을 만족하는 레코드만 수정
      3. **성능**: update()를 여러 번 호출하는 것보다 효율적
      4. **주의**: where 조건을 빈 객체로 두면 모든 레코드가 수정됨
      5. **반환값**: 수정된 레코드 개수만 반환 (레코드 자체는 반환 안 됨)
      
      ## 언제 사용하나요?
      
      **update() 사용:**
      - 특정 사용자의 프로필 수정
      - 단일 레코드 수정
      - 수정된 레코드 데이터가 필요할 때
      
      **updateMany() 사용:**
      - 여러 사용자의 상태 일괄 변경
      - 조건에 맞는 레코드 대량 수정
      - 수정된 개수만 필요할 때
    `,
    objectives: [
      'updateMany() 메서드 기본 사용법 이해',
      'where 조건으로 여러 레코드 찾아 수정',
      'updateMany()의 반환값 이해 (수정된 개수)',
      'update() vs updateMany() 차이점 이해',
      '대량 업데이트 실무 활용'
    ],
    expectedOutput: '여러 레코드가 성공적으로 수정되어야 합니다.'
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
      { email: "user3@example.com", name: "User 3", status: "ACTIVE" }
    ]
  })
  
  console.log('초기 사용자 생성 완료\\n')
  
  // 1. updateMany()로 모든 비활성 사용자를 활성화
  // 힌트: where에 status: "INACTIVE", data에 status: "ACTIVE"
  const result = // 여기에 코드를 작성하세요
  
  console.log(\`\${result.count}명의 사용자가 활성화되었습니다.\`)
  
  // 2. 모든 사용자 조회하여 확인
  const allUsers = await prisma.user.findMany()
  console.log('\\n모든 사용자 상태:')
  allUsers.forEach(user => {
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
        pattern: 'updateMany',
        message: 'updateMany() 메서드를 사용해야 합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'where',
        message: 'where 조건을 사용해야 합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'data',
        message: 'data 객체를 전달해야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success && 
                 result.output.includes('명의 사용자가 활성화되었습니다')
        },
        message: 'updateMany()가 올바르게 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'updateMany()는 where 조건과 data 객체를 필요로 합니다. where에는 일반 필드도 사용할 수 있습니다.'
    },
    {
      level: 2,
      content: 'where 조건으로 status가 "INACTIVE"인 사용자들을 찾고, data에 status: "ACTIVE"를 설정하세요.',
      codeSnippet: `const result = await prisma.user.updateMany({
  where: { status: "INACTIVE" },
  data: { status: "ACTIVE" }
})`
    },
    {
      level: 3,
      content: 'updateMany()는 수정된 레코드 개수를 반환합니다. result.count로 확인할 수 있습니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      { email: "user1@example.com", name: "User 1", status: "INACTIVE" },
      { email: "user2@example.com", name: "User 2", status: "INACTIVE" },
      { email: "user3@example.com", name: "User 3", status: "ACTIVE" }
    ]
  })
  
  const result = await prisma.user.updateMany({
    where: { status: "INACTIVE" },
    data: { status: "ACTIVE" }
  })
  
  console.log(\`\${result.count}명의 사용자가 활성화되었습니다.\`)
  
  const allUsers = await prisma.user.findMany()
  allUsers.forEach(user => {
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
      content: 'updateMany()는 update()와 달리 일반 필드를 where 조건에 사용할 수 있고, 여러 레코드를 한 번에 수정할 수 있습니다.',
      codeSnippet: `// updateMany()는 모든 필드를 where 조건에 사용 가능
const result = await prisma.user.updateMany({
  where: {
    status: "INACTIVE",  // 일반 필드 사용 가능
    name: { not: null }  // 복합 조건도 가능
  },
  data: {
    status: "ACTIVE"
  }
})`
    },
    {
      level: 5,
      content: '완전한 정답입니다. updateMany()의 모든 기능을 활용한 코드입니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      { email: "user1@example.com", name: "User 1", status: "INACTIVE" },
      { email: "user2@example.com", name: "User 2", status: "INACTIVE" },
      { email: "user3@example.com", name: "User 3", status: "ACTIVE" }
    ]
  })
  
  console.log('초기 사용자 생성 완료\\n')
  
  const result = await prisma.user.updateMany({
    where: { status: "INACTIVE" },
    data: { status: "ACTIVE" }
  })
  
  console.log(\`\${result.count}명의 사용자가 활성화되었습니다.\`)
  
  const allUsers = await prisma.user.findMany()
  console.log('\\n모든 사용자 상태:')
  allUsers.forEach(user => {
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
