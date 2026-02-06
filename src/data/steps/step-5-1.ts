import type { CurriculumStep } from '@/types/curriculum'

export const step_5_1: CurriculumStep = {
  id: 'step-5-1',
  title: 'Update - 단일 레코드 수정',
  order: 10,
  category: 'update',
  content: {
    mission: 'update() 메서드를 사용하여 특정 사용자의 정보를 수정하세요.',
    theory: `
      **Prisma의 update()** 메서드는 데이터베이스의 기존 레코드를 수정하는 데 사용됩니다.
      
      ## update() 기본 사용법
      
      \`\`\`javascript
      const updatedUser = await prisma.user.update({
        where: { id: 1 },
        data: {
          name: "새로운 이름",
          email: "new@example.com"
        }
      })
      \`\`\`
      
      **구조:**
      - \`where\`: 수정할 레코드를 찾는 조건 (필수)
      - \`data\`: 수정할 필드와 값 (필수)
      
      ## where 조건
      
      \`update()\`는 **@unique 또는 @id 필드**로만 검색할 수 있습니다.
      
      \`\`\`javascript
      // ✅ 가능: @id 필드 사용
      await prisma.user.update({
        where: { id: 1 },
        data: { name: "Alice" }
      })
      
      // ✅ 가능: @unique 필드 사용
      await prisma.user.update({
        where: { email: "user@example.com" },
        data: { name: "Bob" }
      })
      
      // ❌ 불가능: 일반 필드 사용
      await prisma.user.update({
        where: { name: "Alice" },  // 에러 발생!
        data: { email: "new@example.com" }
      })
      \`\`\`
      
      **왜 @unique/@id만?**
      - 고유 필드는 항상 0개 또는 1개의 결과만 반환
      - 여러 레코드가 수정되는 것을 방지 (데이터 무결성)
      
      ## 반환값
      
      \`update()\`는 **수정된 레코드 전체**를 반환합니다.
      
      \`\`\`javascript
      const updated = await prisma.user.update({
        where: { id: 1 },
        data: { name: "Updated Name" }
      })
      
      console.log(updated)
      // {
      //   id: 1,
      //   email: "user@example.com",
      //   name: "Updated Name",
      //   createdAt: "2024-01-01T10:00:00Z",
      //   updatedAt: "2024-01-05T15:30:00Z"  // 자동 갱신됨!
      // }
      \`\`\`
      
      ## 에러 처리
      
      레코드가 존재하지 않으면 에러가 발생합니다.
      
      \`\`\`javascript
      try {
        const updated = await prisma.user.update({
          where: { id: 999 },  // 존재하지 않는 ID
          data: { name: "Test" }
        })
      } catch (error) {
        if (error.code === 'P2025') {
          console.log('레코드를 찾을 수 없습니다.')
        }
      }
      \`\`\`
      
      **에러 코드:**
      - \`P2025\`: 레코드를 찾을 수 없음
      
      ## 실무 활용 예시
      
      ### 1. 사용자 프로필 수정
      
      \`\`\`javascript
      // 사용자 이름 변경
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name: "새로운 이름",
          updatedAt: new Date()  // 수동 설정 (일반적으로는 @updatedAt이 자동 처리)
        }
      })
      \`\`\`
      
      ### 2. 계정 상태 변경
      
      \`\`\`javascript
      // 사용자를 비활성 상태로 변경
      const deactivated = await prisma.user.update({
        where: { email: "user@example.com" },
        data: {
          status: "INACTIVE"
        }
      })
      \`\`\`
      
      ### 3. 조건부 업데이트
      
      \`\`\`javascript
      // 사용자가 존재하는지 확인 후 업데이트
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (user) {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { name: "New Name" }
        })
      } else {
        console.log('사용자를 찾을 수 없습니다.')
      }
      \`\`\`
      
      ## update() vs updateMany() 차이
      
      | 특징 | update() | updateMany() |
      |------|----------|--------------|
      | where 조건 | @unique/@id만 | 모든 필드 가능 |
      | 반환값 | 수정된 레코드 객체 | 수정된 개수 (count) |
      | 여러 레코드 | ❌ 불가능 | ✅ 가능 |
      | 사용 예 | 프로필 수정 | 대량 업데이트 |
      
      ## 주의사항
      
      1. **@unique/@id 필드만 사용**: where 조건은 고유 필드만 가능
      2. **에러 처리 필수**: 레코드가 없으면 에러 발생
      3. **updatedAt 자동 갱신**: @updatedAt 필드가 있으면 자동으로 갱신됨
      4. **타입 안전성**: TypeScript에서 잘못된 필드명은 컴파일 에러
    `,
    objectives: [
      'update() 메서드 기본 사용법 이해',
      'where 조건으로 특정 레코드 찾아 수정',
      'update()의 반환값 이해 (수정된 레코드)',
      '에러 처리 방법 학습 (레코드가 없을 때)',
      'update() vs updateMany() 차이점 이해'
    ],
    expectedOutput: '사용자 정보가 성공적으로 수정되어야 합니다.'
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
  // 먼저 테스트용 사용자 생성
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Original Name"
    }
  })
  console.log('생성된 사용자:', user)
  
  // 1. update()로 사용자 이름 수정
  // 힌트: where에 id 사용, data에 name 변경
  const updated = // 여기에 코드를 작성하세요
  
  console.log('\\n수정된 사용자:', updated)
  console.log('수정 시간:', updated.updatedAt, '(자동 갱신됨)')
  
  // 2. 이메일로 사용자 찾아서 수정
  // 힌트: where에 email 사용
  const updatedByEmail = // 여기에 코드를 작성하세요
  
  console.log('\\n이메일로 수정:', updatedByEmail)
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
        pattern: 'update',
        message: 'update() 메서드를 사용해야 합니다.'
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
                 result.output.includes('수정된 사용자') &&
                 result.output.includes('이메일로 수정')
        },
        message: 'update()가 올바르게 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'update() 메서드는 where 조건과 data 객체를 필요로 합니다. where에는 @id 또는 @unique 필드를 사용하세요.'
    },
    {
      level: 2,
      content: 'where 조건으로 id를 사용하여 특정 사용자를 찾고, data에 수정할 필드와 값을 지정하세요.',
      codeSnippet: `const updated = await prisma.user.update({
  where: { id: user.id },
  data: {
    name: "Updated Name"
  }
})`
    },
    {
      level: 3,
      content: '이메일로도 수정할 수 있습니다. email은 @unique 필드이므로 where 조건에 사용 가능합니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Original Name"
    }
  })
  console.log('생성된 사용자:', user)
  
  // ID로 수정
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: "Updated Name"
    }
  })
  console.log('\\n수정된 사용자:', updated)
  console.log('수정 시간:', updated.updatedAt)
  
  // 이메일로 수정
  const updatedByEmail = await prisma.user.update({
    where: { email: "test@example.com" },
    data: {
      name: "Updated By Email"
    }
  })
  console.log('\\n이메일로 수정:', updatedByEmail)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    },
    {
      level: 4,
      content: 'update()는 수정된 레코드 전체를 반환합니다. updatedAt 필드가 있으면 자동으로 갱신됩니다.',
      codeSnippet: `const updated = await prisma.user.update({
  where: { id: user.id },
  data: {
    name: "New Name"
  }
})
// 반환값: { id, email, name, createdAt, updatedAt }`
    },
    {
      level: 5,
      content: '완전한 정답입니다. update() 메서드의 모든 기능을 활용한 코드입니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Original Name"
    }
  })
  console.log('생성된 사용자:', user)
  
  // ID로 수정
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: "Updated Name"
    }
  })
  console.log('\\n수정된 사용자:', updated)
  console.log('수정 시간:', updated.updatedAt, '(자동 갱신됨)')
  
  // 이메일로 수정
  const updatedByEmail = await prisma.user.update({
    where: { email: "test@example.com" },
    data: {
      name: "Updated By Email"
    }
  })
  console.log('\\n이메일로 수정:', updatedByEmail)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
