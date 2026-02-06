import type { CurriculumStep } from '@/types/curriculum'

export const step_7_2: CurriculumStep = {
  id: 'step-7-2',
  title: 'Include vs Select로 관계 데이터 조회',
  order: 15,
  category: 'relations',
  content: {
    mission: 'include와 select를 사용하여 관계 데이터를 조회하고, 두 방법의 차이점을 이해하세요.',
    theory: `
      관계가 설정된 데이터를 조회할 때 **include**와 **select** 두 가지 방법을 사용할 수 있습니다.
      
      ## include - 관계 데이터 포함
      
      **include**는 기본 필드와 함께 관계 데이터를 포함하여 조회합니다.
      
      ### 기본 사용법
      
      \`\`\`javascript
      // 사용자와 함께 문서들 조회
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        include: {
          documents: true  // documents 관계 포함
        }
      })
      
      console.log(user)
      // {
      //   id: 1,
      //   email: "user@example.com",
      //   name: "Alice",
      //   documents: [  // 관계 데이터 포함
      //     { id: 1, title: "문서 1", userId: 1 },
      //     { id: 2, title: "문서 2", userId: 1 }
      //   ]
      // }
      \`\`\`
      
      **특징:**
      - 기본 필드 **모두** 포함
      - 관계 데이터도 함께 포함
      - 결과에 모든 필드가 포함됨
      
      ### 중첩 include
      
      \`\`\`javascript
      // 사용자 → 문서 → 댓글 (3단계 관계)
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        include: {
          documents: {
            include: {
              comments: true  // 문서의 댓글도 포함
            }
          }
        }
      })
      \`\`\`
      
      ### include로 필드 선택
      
      \`\`\`javascript
      // 관계 데이터의 특정 필드만 선택
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        include: {
          documents: {
            select: {
              id: true,
              title: true
              // content는 제외
            }
          }
        }
      })
      \`\`\`
      
      ## select - 특정 필드만 선택
      
      **select**는 지정한 필드만 조회합니다. 관계 데이터도 선택적으로 포함할 수 있습니다.
      
      ### 기본 사용법
      
      \`\`\`javascript
      // 사용자의 특정 필드와 문서들 조회
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          email: true,
          documents: true  // 관계 데이터 포함
        }
      })
      
      console.log(user)
      // {
      //   id: 1,
      //   name: "Alice",
      //   email: "user@example.com",
      //   documents: [  // 관계 데이터 포함
      //     { id: 1, title: "문서 1", content: "...", userId: 1 }
      //   ]
      //   // createdAt, updatedAt은 제외됨
      // }
      \`\`\`
      
      **특징:**
      - 지정한 필드만 포함
      - 관계 데이터도 선택적으로 포함 가능
      - 성능 최적화에 유리
      
      ### select로 관계 데이터 선택
      
      \`\`\`javascript
      // 사용자와 문서의 특정 필드만 조회
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          documents: {
            select: {
              id: true,
              title: true
              // content, userId는 제외
            }
          }
        }
      })
      \`\`\`
      
      ## include vs select 비교
      
      | 특징 | include | select |
      |------|---------|--------|
      | 기본 필드 | 모두 포함 | 지정한 필드만 |
      | 관계 데이터 | 포함 가능 | 포함 가능 |
      | 성능 | 상대적으로 느림 | 빠름 (필드 수 적음) |
      | 사용 예 | 모든 데이터 필요 | 특정 필드만 필요 |
      
      ### include 사용 시
      
      \`\`\`javascript
      // 모든 필드 + 관계 데이터
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        include: {
          documents: true
        }
      })
      // 결과: { id, email, name, createdAt, updatedAt, documents: [...] }
      \`\`\`
      
      ### select 사용 시
      
      \`\`\`javascript
      // 지정한 필드만 + 관계 데이터
      const user = await prisma.user.findUnique({
        where: { id: 1 },
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
      // 결과: { id, name, documents: [{ id, title }] }
      \`\`\`
      
      ## 실무 활용 가이드
      
      ### 1. 모든 데이터가 필요할 때 → include
      
      \`\`\`javascript
      // 사용자 프로필 페이지 (모든 정보 필요)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          documents: true
        }
      })
      \`\`\`
      
      ### 2. 특정 필드만 필요할 때 → select
      
      \`\`\`javascript
      // 사용자 목록 (이름과 이메일만)
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true
          // createdAt, updatedAt은 제외
        }
      })
      \`\`\`
      
      ### 3. 관계 데이터만 필요할 때 → select
      
      \`\`\`javascript
      // 사용자의 문서 제목만 필요
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          documents: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })
      \`\`\`
      
      ### 4. 성능 최적화 → select
      
      \`\`\`javascript
      // API 응답 최적화 (불필요한 필드 제외)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          documents: {
            select: {
              id: true,
              title: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })
      \`\`\`
      
      ## include와 select 함께 사용
      
      ### include 안에서 select 사용
      
      \`\`\`javascript
      // 기본 필드는 모두, 관계 데이터는 선택적으로
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        include: {
          documents: {
            select: {
              id: true,
              title: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      })
      \`\`\`
      
      ### select 안에서 관계 데이터 선택
      
      \`\`\`javascript
      // 특정 필드와 관계 데이터만
      const user = await prisma.user.findUnique({
        where: { id: 1 },
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
      \`\`\`
      
      ## 성능 비교
      
      ### include (모든 필드)
      
      \`\`\`javascript
      // 네트워크 전송량: 많음
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        include: { documents: true }
      })
      // 전송 데이터: { id, email, name, createdAt, updatedAt, documents: [...] }
      \`\`\`
      
      ### select (특정 필드만)
      
      \`\`\`javascript
      // 네트워크 전송량: 적음
      const user = await prisma.user.findUnique({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          documents: {
            select: { id: true, title: true }
          }
        }
      })
      // 전송 데이터: { id, name, documents: [{ id, title }] }
      \`\`\`
      
      ## 실무 팁
      
      1. **기본적으로 select 사용**: 필요한 필드만 조회하여 성능 최적화
      2. **include는 편의성**: 모든 필드가 필요할 때만 사용
      3. **API 응답 최적화**: select로 민감 정보 제외 (password 등)
      4. **중첩 관계**: include/select를 중첩하여 깊은 관계도 조회 가능
      5. **조합 사용**: include 안에서 select로 관계 데이터 필터링
    `,
    objectives: [
      'include로 관계 데이터 포함 조회',
      'select로 특정 필드만 선택 조회',
      'include vs select 차이점 이해',
      '중첩 include/select 사용법',
      '성능 최적화를 위한 select 활용',
      '실무에서 include/select 선택 기준'
    ],
    expectedOutput: 'include와 select를 사용하여 관계 데이터를 조회할 수 있어야 합니다.'
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
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      documents: {
        create: [
          { title: "문서 1", content: "내용 1" },
          { title: "문서 2", content: "내용 2" },
          { title: "문서 3", content: "내용 3" }
        ]
      }
    }
  })
  
  console.log('테스트 데이터 생성 완료\\n')
  
  // 1. include로 관계 데이터 포함 조회
  // 힌트: include에 documents: true 추가
  const userWithInclude = // 여기에 코드를 작성하세요
  
  console.log('include 사용:')
  console.log('  사용자 필드:', Object.keys(userWithInclude))
  console.log('  문서 개수:', userWithInclude.documents?.length || 0)
  
  // 2. select로 특정 필드만 선택 조회
  // 힌트: select에 id, name, documents 추가
  const userWithSelect = // 여기에 코드를 작성하세요
  
  console.log('\\nselect 사용:')
  console.log('  사용자 필드:', Object.keys(userWithSelect))
  console.log('  문서 개수:', userWithSelect.documents?.length || 0)
  
  // 3. select로 관계 데이터의 특정 필드만 선택
  // 힌트: documents 안에 select로 id, title만 선택
  const userWithSelectDocs = // 여기에 코드를 작성하세요
  
  console.log('\\nselect로 관계 데이터 필터링:')
  console.log('  문서 필드:', userWithSelectDocs.documents[0] ? Object.keys(userWithSelectDocs.documents[0]) : [])
  
  console.log('\\n✓ include와 select가 정상적으로 동작합니다!')
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
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'select',
        message: 'select를 사용하여 특정 필드만 선택해야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success && 
                 result.output.includes('include 사용') &&
                 result.output.includes('select 사용')
        },
        message: 'include와 select가 올바르게 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'include는 기본 필드와 함께 관계 데이터를 포함합니다. include: { documents: true } 형식으로 사용하세요.'
    },
    {
      level: 2,
      content: 'select는 지정한 필드만 조회합니다. select: { id: true, name: true, documents: true } 형식으로 사용하세요.',
      codeSnippet: `const userWithInclude = await prisma.user.findUnique({
  where: { id: user.id },
  include: {
    documents: true
  }
})

const userWithSelect = await prisma.user.findUnique({
  where: { id: user.id },
  select: {
    id: true,
    name: true,
    documents: true
  }
})`
    },
    {
      level: 3,
      content: 'select 안에서 관계 데이터의 특정 필드만 선택할 수 있습니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      documents: {
        create: [
          { title: "문서 1", content: "내용 1" },
          { title: "문서 2", content: "내용 2" },
          { title: "문서 3", content: "내용 3" }
        ]
      }
    }
  })
  
  const userWithInclude = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      documents: true
    }
  })
  
  console.log('include 사용:')
  console.log('  사용자 필드:', Object.keys(userWithInclude))
  console.log('  문서 개수:', userWithInclude.documents?.length || 0)
  
  const userWithSelect = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      documents: true
    }
  })
  
  console.log('\\nselect 사용:')
  console.log('  사용자 필드:', Object.keys(userWithSelect))
  console.log('  문서 개수:', userWithSelect.documents?.length || 0)
  
  const userWithSelectDocs = await prisma.user.findUnique({
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
  
  console.log('\\nselect로 관계 데이터 필터링:')
  console.log('  문서 필드:', userWithSelectDocs.documents[0] ? Object.keys(userWithSelectDocs.documents[0]) : [])
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    },
    {
      level: 4,
      content: 'include는 모든 기본 필드를 포함하고, select는 지정한 필드만 포함합니다. 성능 최적화를 위해 select를 선호합니다.',
      codeSnippet: `// include: 모든 필드 + 관계 데이터
const user1 = await prisma.user.findUnique({
  where: { id: 1 },
  include: { documents: true }
})
// 결과: { id, email, name, createdAt, updatedAt, documents: [...] }

// select: 지정한 필드만 + 관계 데이터
const user2 = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    name: true,
    documents: { select: { id: true, title: true } }
  }
})
// 결과: { id, name, documents: [{ id, title }] }`
    },
    {
      level: 5,
      content: '완전한 정답입니다. include와 select의 모든 기능을 활용한 코드입니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      documents: {
        create: [
          { title: "문서 1", content: "내용 1" },
          { title: "문서 2", content: "내용 2" },
          { title: "문서 3", content: "내용 3" }
        ]
      }
    }
  })
  
  console.log('테스트 데이터 생성 완료\\n')
  
  const userWithInclude = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      documents: true
    }
  })
  
  console.log('include 사용:')
  console.log('  사용자 필드:', Object.keys(userWithInclude))
  console.log('  문서 개수:', userWithInclude.documents?.length || 0)
  
  const userWithSelect = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      documents: true
    }
  })
  
  console.log('\\nselect 사용:')
  console.log('  사용자 필드:', Object.keys(userWithSelect))
  console.log('  문서 개수:', userWithSelect.documents?.length || 0)
  
  const userWithSelectDocs = await prisma.user.findUnique({
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
  
  console.log('\\nselect로 관계 데이터 필터링:')
  console.log('  문서 필드:', userWithSelectDocs.documents[0] ? Object.keys(userWithSelectDocs.documents[0]) : [])
  
  console.log('\\n✓ include와 select가 정상적으로 동작합니다!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
