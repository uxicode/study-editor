import type { CurriculumStep } from '@/types/curriculum'

export const step_final_1: CurriculumStep = {
  id: 'step-final-1',
  title: '레벨 1 최종 연습문제',
  order: 9,
  category: 'advanced',
  content: {
    mission: '레벨 1에서 배운 모든 내용을 종합하여 완전한 사용자 관리 시스템을 구현하세요. Prisma 스키마 정의부터 데이터 생성, 조회, 페이징까지 모든 기능을 포함해야 합니다.',
    theory: `
      ## 레벨 1 종합 연습문제
      
      이 문제는 레벨 1에서 배운 모든 내용을 종합적으로 활용하는 실전 문제입니다.
      
      ### 요구사항
      
      1. **Prisma 스키마 정의**
         - User 모델에 다음 필드가 포함되어야 합니다:
           - id: Int (자동 증가, 기본키)
           - email: String (고유값)
           - name: String (선택적)
           - role: enum ROLE (USER, ADMIN)
           - status: enum STATUS (ACTIVE, INACTIVE)
           - createdAt: DateTime (자동 생성)
           - updatedAt: DateTime (자동 갱신)
         - 테이블 이름은 users로 매핑 (@@map 사용)
      
      2. **데이터 생성**
         - 최소 3명의 사용자를 생성하세요
         - 다양한 role과 status를 포함하세요
      
      3. **데이터 조회**
         - 활성 상태(ACTIVE)인 사용자만 조회
         - 생성일 기준 최신순으로 정렬
         - id, name, email, role만 선택하여 조회
         - 페이징 적용 (1페이지, 10개씩)
      
      4. **전체 개수 조회**
         - 활성 사용자 수를 count()로 조회
      
      ### 평가 기준
      
      - ✅ Prisma 스키마가 모든 요구사항을 만족하는가?
      - ✅ enum이 올바르게 정의되었는가?
      - ✅ 타임스탬프가 자동으로 관리되는가?
      - ✅ 데이터 생성이 올바르게 이루어지는가?
      - ✅ 복합 쿼리가 올바르게 작성되었는가?
      - ✅ 페이징이 올바르게 구현되었는가?
      
      ### 실전 팁
      
      1. **스키마 작성 순서**
         - generator client
         - datasource db
         - enum 정의
         - model 정의
      
      2. **쿼리 작성 순서**
         - where로 필터링
         - orderBy로 정렬
         - select로 필드 선택
         - skip/take로 페이징
      
      3. **에러 처리**
         - try-catch로 에러 처리
         - finally에서 prisma.$disconnect() 호출
    `,
    objectives: [
      'Prisma 스키마의 모든 기능을 종합적으로 활용',
      'enum, 타임스탬프, @@map을 포함한 완전한 모델 정의',
      '복합 쿼리 작성 (where + orderBy + select + skip/take)',
      '실전 프로젝트 수준의 코드 작성',
      '레벨 1 학습 내용의 완전한 이해 확인'
    ],
    expectedOutput: '완전한 사용자 관리 시스템 구현 완료'
  },
  initialFiles: [
    {
      name: 'schema.prisma',
      path: 'prisma/schema.prisma',
      language: 'prisma',
      content: `// 레벨 1 최종 연습문제
// 완전한 User 모델을 정의하세요

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 여기에 enum과 model을 정의하세요
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
  // 1. 사용자 생성 (최소 3명)
  // 다양한 role과 status를 포함하세요
  
  // 2. 활성 사용자 조회
  // - where: status가 ACTIVE
  // - orderBy: createdAt 내림차순
  // - select: id, name, email, role만
  // - skip: 0, take: 10
  
  // 3. 활성 사용자 수 조회
  // count() 사용
  
  console.log('✅ 레벨 1 최종 연습문제 완료!')
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
        pattern: 'enum ROLE',
        message: 'ROLE enum이 정의되어야 합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: 'enum STATUS',
        message: 'STATUS enum이 정의되어야 합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: '@@map',
        message: '테이블 이름을 users로 매핑해야 합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: '@default(now())',
        message: 'createdAt에 @default(now())가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'prisma/schema.prisma',
        pattern: '@updatedAt',
        message: 'updatedAt 필드가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'create',
        message: '사용자 생성 코드가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'where',
        message: 'where 조건이 필요합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'orderBy',
        message: 'orderBy가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'select',
        message: 'select가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'skip',
        message: 'skip이 필요합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'take',
        message: 'take가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'count',
        message: 'count()가 필요합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success && 
                 result.output.includes('레벨 1 최종 연습문제 완료')
        },
        message: '코드가 성공적으로 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '스키마부터 작성하세요. enum ROLE과 enum STATUS를 먼저 정의하고, 그 다음 User 모델을 정의하세요.'
    },
    {
      level: 2,
      content: 'User 모델에는 id, email, name, role, status, createdAt, updatedAt 필드가 필요합니다. createdAt은 @default(now()), updatedAt은 @updatedAt을 사용하세요.'
    },
    {
      level: 3,
      content: '테이블 이름 매핑은 model User { ... } 블록 안에서 @@map("users")를 사용하세요.'
    },
    {
      level: 4,
      content: '복합 쿼리는 여러 옵션을 함께 사용합니다: where로 필터링, orderBy로 정렬, select로 필드 선택, skip/take로 페이징.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  // 1. 사용자 생성
  await prisma.user.createMany({
    data: [
      { email: 'alice@example.com', name: 'Alice', role: 'ADMIN', status: 'ACTIVE' },
      { email: 'bob@example.com', name: 'Bob', role: 'USER', status: 'ACTIVE' },
      { email: 'charlie@example.com', name: 'Charlie', role: 'USER', status: 'INACTIVE' }
    ]
  })
  
  // 2. 활성 사용자 조회 (복합 쿼리)
  const activeUsers = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    },
    skip: 0,
    take: 10
  })
  console.log('활성 사용자:', activeUsers)
  
  // 3. 활성 사용자 수
  const activeCount = await prisma.user.count({
    where: { status: 'ACTIVE' }
  })
  console.log('활성 사용자 수:', activeCount)
  
  console.log('✅ 레벨 1 최종 연습문제 완료!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
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

enum ROLE {
  USER
  ADMIN
}

enum STATUS {
  ACTIVE
  INACTIVE
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      ROLE     @default(USER)
  status    STATUS   @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// app.js
// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  // 1. 사용자 생성
  await prisma.user.createMany({
    data: [
      { email: 'alice@example.com', name: 'Alice', role: 'ADMIN', status: 'ACTIVE' },
      { email: 'bob@example.com', name: 'Bob', role: 'USER', status: 'ACTIVE' },
      { email: 'charlie@example.com', name: 'Charlie', role: 'USER', status: 'INACTIVE' },
      { email: 'diana@example.com', name: 'Diana', role: 'ADMIN', status: 'ACTIVE' }
    ]
  })
  console.log('사용자 생성 완료')
  
  // 2. 활성 사용자 조회 (복합 쿼리)
  const activeUsers = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    },
    skip: 0,
    take: 10
  })
  console.log('활성 사용자:', activeUsers)
  
  // 3. 활성 사용자 수
  const activeCount = await prisma.user.count({
    where: { status: 'ACTIVE' }
  })
  console.log('활성 사용자 수:', activeCount)
  
  console.log('✅ 레벨 1 최종 연습문제 완료!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
