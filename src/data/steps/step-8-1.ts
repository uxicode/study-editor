import type { CurriculumStep } from '@/types/curriculum'

export const step_8_1: CurriculumStep = {
  id: 'step-8-1',
  title: '복합 where 조건 (AND, OR, NOT)',
  order: 17,
  category: 'read',
  content: {
    mission: 'AND, OR, NOT 연산자를 사용하여 복잡한 조건으로 데이터를 조회하세요.',
    theory: `
      실무에서는 단순한 조건만으로는 부족합니다. **복합 조건**을 사용하여 더 정교한 쿼리를 작성할 수 있습니다.
      
      ## AND - 모든 조건 만족
      
      **AND**는 여러 조건을 **모두** 만족하는 레코드를 찾습니다.
      
      ### 기본 사용법
      
      \`\`\`javascript
      // role이 "ADMIN"이면서 status가 "ACTIVE"인 사용자
      const admins = await prisma.user.findMany({
        where: {
          role: "ADMIN",
          status: "ACTIVE"
        }
      })
      \`\`\`
      
      **특징:**
      - 여러 필드를 나열하면 자동으로 AND 조건
      - 모든 조건을 만족해야 함
      
      ### 명시적 AND
      
      \`\`\`javascript
      // 명시적으로 AND 사용
      const users = await prisma.user.findMany({
        where: {
          AND: [
            { role: "ADMIN" },
            { status: "ACTIVE" },
            { createdAt: { gte: new Date('2024-01-01') } }
          ]
        }
      })
      \`\`\`
      
      ## OR - 하나라도 만족
      
      **OR**는 여러 조건 중 **하나라도** 만족하는 레코드를 찾습니다.
      
      ### 기본 사용법
      
      \`\`\`javascript
      // role이 "ADMIN"이거나 status가 "ACTIVE"인 사용자
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { role: "ADMIN" },
            { status: "ACTIVE" }
          ]
        }
      })
      \`\`\`
      
      **특징:**
      - OR 배열의 조건 중 하나라도 만족하면 됨
      - 여러 조건을 조합할 때 유용
      
      ### 실무 예시
      
      \`\`\`javascript
      // 관리자이거나 최근 가입한 사용자
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { role: "ADMIN" },
            { createdAt: { gte: new Date('2024-01-01') } }
          ]
        }
      })
      \`\`\`
      
      ## NOT - 조건 부정
      
      **NOT**는 조건을 **부정**하여 해당하지 않는 레코드를 찾습니다.
      
      ### 기본 사용법
      
      \`\`\`javascript
      // role이 "ADMIN"이 아닌 사용자
      const users = await prisma.user.findMany({
        where: {
          NOT: {
            role: "ADMIN"
          }
        }
      })
      \`\`\`
      
      ### 복합 NOT
      
      \`\`\`javascript
      // role이 "ADMIN"이 아니고 status가 "INACTIVE"가 아닌 사용자
      const users = await prisma.user.findMany({
        where: {
          NOT: [
            { role: "ADMIN" },
            { status: "INACTIVE" }
          ]
        }
      })
      \`\`\`
      
      ## 복합 조건 조합
      
      AND, OR, NOT를 함께 사용하여 복잡한 조건을 만들 수 있습니다.
      
      ### 예시 1: 관리자이거나 활성 사용자
      
      \`\`\`javascript
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { role: "ADMIN" },
            { status: "ACTIVE" }
          ]
        }
      })
      \`\`\`
      
      ### 예시 2: 관리자가 아니면서 활성 상태
      
      \`\`\`javascript
      const users = await prisma.user.findMany({
        where: {
          NOT: {
            role: "ADMIN"
          },
          status: "ACTIVE"
        }
      })
      \`\`\`
      
      ### 예시 3: 복잡한 조건
      
      \`\`\`javascript
      // (관리자이거나 활성 상태)이면서 최근 가입한 사용자
      const users = await prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { role: "ADMIN" },
                { status: "ACTIVE" }
              ]
            },
            {
              createdAt: { gte: new Date('2024-01-01') }
            }
          ]
        }
      })
      \`\`\`
      
      ## 조건 우선순위
      
      **AND가 OR보다 우선순위가 높습니다.**
      
      \`\`\`javascript
      // 이 쿼리는:
      // (role: "ADMIN" AND status: "ACTIVE") OR (role: "USER" AND status: "INACTIVE")
      // 로 해석됩니다
      const users = await prisma.user.findMany({
        where: {
          OR: [
            {
              role: "ADMIN",
              status: "ACTIVE"
            },
            {
              role: "USER",
              status: "INACTIVE"
            }
          ]
        }
      })
      \`\`\`
      
      ## 실무 활용 예시
      
      ### 1. 관리자 대시보드
      
      \`\`\`javascript
      // 활성 관리자 또는 최근 가입한 사용자
      const dashboardUsers = await prisma.user.findMany({
        where: {
          OR: [
            {
              role: "ADMIN",
              status: "ACTIVE"
            },
            {
              createdAt: { gte: new Date('2024-01-01') }
            }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
      \`\`\`
      
      ### 2. 검색 필터
      
      \`\`\`javascript
      // 활성 상태이면서 (관리자이거나 일반 사용자)
      const filteredUsers = await prisma.user.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { role: "ADMIN" },
            { role: "USER" }
          ]
        }
      })
      \`\`\`
      
      ### 3. 제외 조건
      
      \`\`\`javascript
      // 관리자가 아니고 비활성 상태가 아닌 사용자
      const activeNonAdmins = await prisma.user.findMany({
        where: {
          NOT: {
            OR: [
              { role: "ADMIN" },
              { status: "INACTIVE" }
            ]
          }
        }
      })
      \`\`\`
      
      ## 실무 팁
      
      1. **기본은 AND**: 여러 필드를 나열하면 자동으로 AND
      2. **OR는 명시적**: OR를 사용할 때는 배열로 명시
      3. **NOT은 제외**: 특정 조건을 제외할 때 사용
      4. **복합 조건**: AND, OR, NOT을 중첩하여 사용 가능
      5. **가독성**: 복잡한 조건은 변수로 분리하여 작성
    `,
    objectives: [
      'AND 연산자로 여러 조건 조합',
      'OR 연산자로 조건 중 하나 만족',
      'NOT 연산자로 조건 부정',
      'AND, OR, NOT을 복합적으로 사용',
      '실무에서 복합 조건 활용'
    ],
    expectedOutput: '복합 조건으로 데이터를 조회할 수 있어야 합니다.'
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

enum Role {
  USER
  ADMIN
}

enum Status {
  ACTIVE
  INACTIVE
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  status    Status   @default(ACTIVE)
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
  // 테스트 데이터 생성
  await prisma.user.createMany({
    data: [
      { email: "admin1@example.com", name: "Admin 1", role: "ADMIN", status: "ACTIVE" },
      { email: "admin2@example.com", name: "Admin 2", role: "ADMIN", status: "INACTIVE" },
      { email: "user1@example.com", name: "User 1", role: "USER", status: "ACTIVE" },
      { email: "user2@example.com", name: "User 2", role: "USER", status: "INACTIVE" }
    ]
  })
  
  console.log('테스트 데이터 생성 완료\\n')
  
  // 1. AND 조건: role이 "ADMIN"이면서 status가 "ACTIVE"인 사용자
  // 힌트: where에 role과 status를 함께 지정
  const activeAdmins = // 여기에 코드를 작성하세요
  
  console.log('활성 관리자:', activeAdmins.length, '명')
  
  // 2. OR 조건: role이 "ADMIN"이거나 status가 "ACTIVE"인 사용자
  // 힌트: OR 배열 사용
  const adminsOrActive = // 여기에 코드를 작성하세요
  
  console.log('관리자 또는 활성 사용자:', adminsOrActive.length, '명')
  
  // 3. NOT 조건: role이 "ADMIN"이 아닌 사용자
  // 힌트: NOT 객체 사용
  const nonAdmins = // 여기에 코드를 작성하세요
  
  console.log('일반 사용자:', nonAdmins.length, '명')
  
  // 4. 복합 조건: (관리자이거나 활성 상태)이면서 최근 가입한 사용자
  // 힌트: AND와 OR를 함께 사용
  const complexQuery = // 여기에 코드를 작성하세요
  
  console.log('복합 조건 결과:', complexQuery.length, '명')
  
  console.log('\\n✓ 복합 조건이 정상적으로 동작합니다!')
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
        pattern: 'OR',
        message: 'OR 연산자를 사용해야 합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'NOT',
        message: 'NOT 연산자를 사용해야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success && 
                 result.output.includes('복합 조건이 정상적으로 동작합니다')
        },
        message: '복합 조건이 올바르게 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'AND는 여러 필드를 나열하면 자동으로 적용됩니다. OR와 NOT은 명시적으로 사용해야 합니다.'
    },
    {
      level: 2,
      content: 'OR는 배열 형식으로 사용합니다: OR: [{ role: "ADMIN" }, { status: "ACTIVE" }]',
      codeSnippet: `const activeAdmins = await prisma.user.findMany({
  where: {
    role: "ADMIN",
    status: "ACTIVE"
  }
})

const adminsOrActive = await prisma.user.findMany({
  where: {
    OR: [
      { role: "ADMIN" },
      { status: "ACTIVE" }
    ]
  }
})`
    },
    {
      level: 3,
      content: 'NOT은 객체 형식으로 사용합니다: NOT: { role: "ADMIN" }',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      { email: "admin1@example.com", name: "Admin 1", role: "ADMIN", status: "ACTIVE" },
      { email: "admin2@example.com", name: "Admin 2", role: "ADMIN", status: "INACTIVE" },
      { email: "user1@example.com", name: "User 1", role: "USER", status: "ACTIVE" },
      { email: "user2@example.com", name: "User 2", role: "USER", status: "INACTIVE" }
    ]
  })
  
  console.log('테스트 데이터 생성 완료\\n')
  
  const activeAdmins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      status: "ACTIVE"
    }
  })
  console.log('활성 관리자:', activeAdmins.length, '명')
  
  const adminsOrActive = await prisma.user.findMany({
    where: {
      OR: [
        { role: "ADMIN" },
        { status: "ACTIVE" }
      ]
    }
  })
  console.log('관리자 또는 활성 사용자:', adminsOrActive.length, '명')
  
  const nonAdmins = await prisma.user.findMany({
    where: {
      NOT: {
        role: "ADMIN"
      }
    }
  })
  console.log('일반 사용자:', nonAdmins.length, '명')
  
  const complexQuery = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { role: "ADMIN" },
            { status: "ACTIVE" }
          ]
        }
      ]
    }
  })
  console.log('복합 조건 결과:', complexQuery.length, '명')
  
  console.log('\\n✓ 복합 조건이 정상적으로 동작합니다!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    },
    {
      level: 4,
      content: 'AND, OR, NOT을 중첩하여 복잡한 조건을 만들 수 있습니다. AND는 OR보다 우선순위가 높습니다.',
      codeSnippet: `// 복합 조건 예시
const users = await prisma.user.findMany({
  where: {
    AND: [
      {
        OR: [
          { role: "ADMIN" },
          { status: "ACTIVE" }
        ]
      },
      {
        createdAt: { gte: new Date('2024-01-01') }
      }
    ]
  }
})`
    },
    {
      level: 5,
      content: '완전한 정답입니다. 모든 복합 조건 연산자를 활용한 코드입니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  await prisma.user.createMany({
    data: [
      { email: "admin1@example.com", name: "Admin 1", role: "ADMIN", status: "ACTIVE" },
      { email: "admin2@example.com", name: "Admin 2", role: "ADMIN", status: "INACTIVE" },
      { email: "user1@example.com", name: "User 1", role: "USER", status: "ACTIVE" },
      { email: "user2@example.com", name: "User 2", role: "USER", status: "INACTIVE" }
    ]
  })
  
  console.log('테스트 데이터 생성 완료\\n')
  
  const activeAdmins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      status: "ACTIVE"
    }
  })
  console.log('활성 관리자:', activeAdmins.length, '명')
  
  const adminsOrActive = await prisma.user.findMany({
    where: {
      OR: [
        { role: "ADMIN" },
        { status: "ACTIVE" }
      ]
    }
  })
  console.log('관리자 또는 활성 사용자:', adminsOrActive.length, '명')
  
  const nonAdmins = await prisma.user.findMany({
    where: {
      NOT: {
        role: "ADMIN"
      }
    }
  })
  console.log('일반 사용자:', nonAdmins.length, '명')
  
  const complexQuery = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { role: "ADMIN" },
            { status: "ACTIVE" }
          ]
        }
      ]
    }
  })
  console.log('복합 조건 결과:', complexQuery.length, '명')
  
  console.log('\\n✓ 복합 조건이 정상적으로 동작합니다!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
