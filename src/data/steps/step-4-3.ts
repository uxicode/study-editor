import type { CurriculumStep } from '@/types/curriculum'

export const step_4_3: CurriculumStep = {

    id: 'step-4-3',
    title: 'Read - 페이징과 복합 쿼리',
    order: 8,
    category: 'read',
    content: {
      mission: 'skip과 take를 사용하여 페이징을 구현하고, 여러 조회 옵션을 조합한 복합 쿼리를 작성하세요.',
      theory: `
        ## 페이징과 복합 쿼리
        
        실무에서는 대량의 데이터를 다루므로 페이징과 복합 조건이 필수적입니다.
        
        ## 1. skip & take: 페이징 (Pagination)
        
        게시판의 페이지를 나눌 때 필수적인 기능입니다.
        
        ### 기본 사용법
        
        \`\`\`javascript
        // 1페이지 (1~10번 게시글)
        const page1 = await prisma.post.findMany({
          take: 10
        })
        
        // 2페이지 (11~20번 게시글)
        const page2 = await prisma.post.findMany({
          skip: 10,  // 앞의 10개 건너뛰고
          take: 10   // 10개만 가져오기
        })
        
        // 3페이지 (21~30번 게시글)
        const page3 = await prisma.post.findMany({
          skip: 20,
          take: 10
        })
        \`\`\`
        
        **옵션 설명:**
        - \`skip\`: 건너뛸 레코드 개수
        - \`take\`: 가져올 레코드 개수
        
        ### 페이지 계산 공식
        
        \`\`\`javascript
        const page = 2        // 보고 싶은 페이지 (1부터 시작)
        const pageSize = 10   // 페이지당 개수
        
        const posts = await prisma.post.findMany({
          skip: (page - 1) * pageSize,  // (2-1) * 10 = 10
          take: pageSize                // 10개
        })
        \`\`\`
        
        **계산 예시:**
        - 1페이지: \`skip: 0, take: 10\` → 1~10번
        - 2페이지: \`skip: 10, take: 10\` → 11~20번
        - 3페이지: \`skip: 20, take: 10\` → 21~30번
        
        ### 페이징 함수 만들기
        
        \`\`\`javascript
        function getPaginatedUsers(page, pageSize = 10) {
          return prisma.user.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' }
          })
        }
        
        // 사용
        const page1 = await getPaginatedUsers(1)
        const page2 = await getPaginatedUsers(2)
        \`\`\`
        
        ## 2. 복합 쿼리 조합
        
        실무에서는 여러 옵션을 함께 사용하여 복잡한 쿼리를 작성합니다.
        
        ### 예시 1: 게시판 목록
        
        \`\`\`javascript
        // 공개 상태 게시글을 최신순으로 정렬하여 2페이지 조회
        const posts = await prisma.post.findMany({
          where: { status: 'PUBLISHED' },   // 공개된 글만
          orderBy: { createdAt: 'desc' },   // 최신순
          skip: 10,                          // 2페이지
          take: 10,
          select: {                          // 필요한 필드만
            id: true,
            title: true,
            createdAt: true,
            author: {
              select: { name: true }
            }
          }
        })
        \`\`\`
        
        ### 예시 2: 사용자 검색
        
        \`\`\`javascript
        // 활성 상태 사용자를 이름순으로 정렬하여 3페이지 조회
        const users = await prisma.user.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { name: 'asc' },
          skip: 20,
          take: 10,
          select: {
            id: true,
            name: true,
            email: true
          }
        })
        \`\`\`
        
        ### 예시 3: 관리자 대시보드
        
        \`\`\`javascript
        // 최근 가입한 관리자 5명 조회
        const recentAdmins = await prisma.user.findMany({
          where: { 
            role: 'ADMIN',
            status: 'ACTIVE'
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        })
        \`\`\`
        
        ## 3. 전체 개수 조회 (count)
        
        페이징을 구현할 때 전체 페이지 수를 계산하려면 전체 개수가 필요합니다.
        
        \`\`\`javascript
        // 전체 사용자 수
        const totalUsers = await prisma.user.count()
        
        // 조건에 맞는 사용자 수
        const activeUsersCount = await prisma.user.count({
          where: { status: 'ACTIVE' }
        })
        
        // 전체 페이지 수 계산
        const pageSize = 10
        const totalPages = Math.ceil(totalUsers / pageSize)
        \`\`\`
        
        ## 4. 실무 페이징 패턴
        
        \`\`\`javascript
        async function getUsers(page = 1, pageSize = 10) {
          const skip = (page - 1) * pageSize
          
          // 병렬로 데이터와 전체 개수 조회
          const [users, total] = await Promise.all([
            prisma.user.findMany({
              skip,
              take: pageSize,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                name: true,
                email: true
              }
            }),
            prisma.user.count()
          ])
          
          return {
            data: users,
            pagination: {
              page,
              pageSize,
              total,
              totalPages: Math.ceil(total / pageSize),
              hasNext: page < Math.ceil(total / pageSize),
              hasPrev: page > 1
            }
          }
        }
        
        // 사용
        const result = await getUsers(2, 10)
        console.log(result)
        // {
        //   data: [...],
        //   pagination: {
        //     page: 2,
        //     pageSize: 10,
        //     total: 50,
        //     totalPages: 5,
        //     hasNext: true,
        //     hasPrev: true
        //   }
        // }
        \`\`\`
        
        ## 실무 팁
        
        1. **페이지 번호는 1부터 시작**: 사용자 친화적
        2. **기본값 설정**: \`page = 1, pageSize = 10\`
        3. **최대 제한 설정**: \`take\`는 최대 100으로 제한 (성능)
        4. **전체 개수 캐싱**: count 쿼리는 비용이 크므로 캐싱 고려
        5. **정렬 필수**: 페이징 시 정렬하지 않으면 순서 보장 안 됨
        6. **인덱스 활용**: orderBy에 사용되는 필드는 인덱스 생성
        
        ## 쿼리 옵션 조합 가이드
        
        | 목적 | 옵션 조합 |
        |------|----------|
        | 게시판 목록 | where + orderBy + skip/take + select |
        | 검색 결과 | where + orderBy + select |
        | 상세 페이지 | findUnique + select |
        | 대시보드 | where + orderBy + take + select |
        | API 목록 | where + orderBy + skip/take + select |
      `,
      objectives: [
        'skip과 take를 활용한 페이징 구현',
        '페이지 계산 공식 이해 및 적용',
        'where + orderBy + skip/take + select 복합 쿼리 작성',
        'count()로 전체 개수 조회 및 페이지 수 계산',
        '실무 페이징 패턴 구현'
      ],
      expectedOutput: '페이징 및 복합 쿼리 성공'
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
  // 1. 기본 페이징: 2페이지 조회 (11~20번)
  // 힌트: skip: 10, take: 10
  const page2 = // 여기에 코드를 작성하세요
  console.log('2페이지:', page2)
  
  // 2. 전체 사용자 수 조회
  // 힌트: count() 메서드 사용
  const totalUsers = // 여기에 코드를 작성하세요
  console.log('전체 사용자 수:', totalUsers)
  
  // 3. 복합 쿼리: 활성 사용자를 최신순으로 정렬하여 1페이지 조회
  // where + orderBy + skip/take + select 조합
  const activeUsers = // 여기에 코드를 작성하세요
  console.log('활성 사용자 1페이지:', activeUsers)
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
          pattern: 'skip',
          message: 'skip을 사용하여 페이징해야 합니다.'
        },
        {
          type: 'includes',
          target: 'app.js',
          pattern: 'take',
          message: 'take를 사용하여 페이징해야 합니다.'
        },
        {
          type: 'includes',
          target: 'app.js',
          pattern: 'count',
          message: 'count()를 사용하여 전체 개수를 조회해야 합니다.'
        }
      ],
      dynamicChecks: [
        {
          type: 'result',
          test: (result: any) => {
            return result.success && 
                   result.output.includes('2페이지') &&
                   result.output.includes('전체 사용자 수') &&
                   result.output.includes('활성 사용자')
          },
          message: '페이징과 복합 쿼리가 올바르게 실행되어야 합니다.'
        }
      ]
    },
    hints: [
      {
        level: 1,
        content: 'skip은 건너뛸 개수, take는 가져올 개수입니다. 2페이지(11~20번)는 skip: 10, take: 10입니다.'
      },
      {
        level: 2,
        content: 'count()는 findMany()와 달리 개수만 반환합니다. where 조건과 함께 사용할 수 있습니다.'
      },
      {
        level: 3,
        content: '페이징 기본 사용법입니다.',
        codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  // 1. 2페이지 조회 (skip: 10, take: 10)
  const page2 = await prisma.user.findMany({
    skip: 10,
    take: 10
  })
  console.log('2페이지:', page2)
  
  // 2. 전체 사용자 수
  const totalUsers = await prisma.user.count()
  console.log('전체 사용자 수:', totalUsers)
  
  // 3. 복합 쿼리
  const activeUsers = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    skip: 0,
    take: 10,
    select: {
      id: true,
      name: true,
      email: true
    }
  })
  console.log('활성 사용자 1페이지:', activeUsers)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
      },
      {
        level: 4,
        content: '실무 페이징 패턴: 페이지 번호로 skip 계산하기',
        codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function getPaginatedUsers(page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    }),
    prisma.user.count({
      where: { status: 'ACTIVE' }
    })
  ])
  
  return {
    data: users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  }
}

async function main() {
  // 1페이지 조회
  const page1 = await getPaginatedUsers(1, 10)
  console.log('1페이지:', page1)
  
  // 2페이지 조회
  const page2 = await getPaginatedUsers(2, 10)
  console.log('2페이지:', page2)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
      }
    ]
}
