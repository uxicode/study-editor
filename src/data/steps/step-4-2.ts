import type { CurriculumStep } from '@/types/curriculum'

export const step_4_2: CurriculumStep = {

    id: 'step-4-2',
    title: 'Read - 정렬과 필드 선택',
    order: 7,
    category: 'read',
    content: {
      mission: 'orderBy로 데이터를 정렬하고, select로 필요한 필드만 선택하여 조회하세요.',
      theory: `
        ## 조회 옵션: 정렬과 필드 선택
        
        기본 조회 메서드에 옵션을 추가하여 더 정교한 쿼리를 작성할 수 있습니다.
        
        ## 1. orderBy: 데이터 정렬
        
        데이터를 가나다순, 최신순 등으로 정렬합니다.
        
        ### 단일 필드 정렬
        
        \`\`\`javascript
        // 가입일(createdAt) 기준 최신순(내림차순) 정렬
        const users = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' }
        })
        
        // 이름 기준 가나다순(오름차순)
        const users = await prisma.user.findMany({
          orderBy: { name: 'asc' }
        })
        \`\`\`
        
        **정렬 옵션:**
        - \`'asc'\`: 오름차순 (Ascending)
          - 숫자: 1, 2, 3...
          - 문자: A, B, C... / 가, 나, 다...
          - 날짜: 과거 → 현재
        - \`'desc'\`: 내림차순 (Descending)
          - 숫자: 3, 2, 1...
          - 문자: Z, Y, X... / 하, 파, 타...
          - 날짜: 현재 → 과거
        
        ### 다중 정렬
        
        여러 기준으로 순차적으로 정렬할 수 있습니다.
        
        \`\`\`javascript
        const users = await prisma.user.findMany({
          orderBy: [
            { role: 'desc' },     // 1순위: 역할 (관리자 먼저)
            { createdAt: 'desc' } // 2순위: 가입일 (최신순)
          ]
        })
        \`\`\`
        
        **실무 활용 예시:**
        - 게시판: 최신 글 위로 (\`createdAt: 'desc'\`)
        - 검색 결과: 관련도 순 (\`relevance: 'desc'\`)
        - 사용자 목록: 이름순 (\`name: 'asc'\`)
        
        ## 2. select: 특정 필드만 선택
        
        DB에서 모든 컬럼을 가져오지 않고 필요한 데이터만 골라 가져옵니다.
        
        ### 기본 사용법
        
        \`\`\`javascript
        const userNames = await prisma.user.findMany({
          select: {
            id: true,
            name: true
            // email, createdAt 등은 가져오지 않음
          }
        })
        
        // 결과: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
        \`\`\`
        
        **기본 동작:**
        - select 없이 조회하면: 모든 필드 반환
        - select 사용하면: 지정한 필드만 반환
        
        ### 왜 select를 사용하나요?
        
        **1. 성능 최적화**
        \`\`\`javascript
        // ❌ 비효율적 - 모든 데이터 가져오기
        const users = await prisma.user.findMany()
        // { id, email, name, password, bio, avatar, createdAt, updatedAt, ... }
        
        // ✅ 효율적 - 필요한 것만
        const users = await prisma.user.findMany({
          select: { id: true, name: true }
        })
        // { id, name }
        \`\`\`
        
        **2. 보안**
        \`\`\`javascript
        // 비밀번호 같은 민감 정보 제외
        const publicUsers = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            avatar: true
            // password는 선택하지 않음 (보안)
          }
        })
        \`\`\`
        
        **3. 네트워크 비용 절감**
        - API 응답 크기 감소
        - 클라이언트로 전송되는 데이터 최소화
        
        ## 3. orderBy와 select 조합
        
        두 옵션을 함께 사용하여 더 정교한 쿼리를 작성할 수 있습니다.
        
        \`\`\`javascript
        // 최신 가입자 10명의 이름과 이메일만 조회
        const recentUsers = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          select: {
            name: true,
            email: true,
            createdAt: true
          },
          take: 10
        })
        \`\`\`
        
        ## 4. where + orderBy + select 조합
        
        \`\`\`javascript
        // 활성 상태인 사용자를 이름순으로 정렬하여 ID와 이름만 조회
        const activeUsers = await prisma.user.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true
          }
        })
        \`\`\`
        
        ## 실무 팁
        
        1. **항상 select 사용 고려**: API 응답에 불필요한 데이터 제외
        2. **민감 정보 보호**: password, apiKey 등은 select에서 제외
        3. **정렬 기본값**: 게시판은 \`createdAt: 'desc'\`가 일반적
        4. **성능**: select로 필드 수를 줄이면 쿼리 속도 향상
        5. **가독성**: 복잡한 쿼리는 변수로 분리하여 작성
      `,
      objectives: [
        'orderBy로 데이터 정렬 (오름차순/내림차순)',
        '다중 정렬을 활용한 우선순위 정렬',
        'select로 특정 필드만 선택하여 조회',
        'select의 성능 최적화 및 보안 효과 이해',
        'where, orderBy, select를 조합한 복잡한 쿼리 작성'
      ]
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
  // 1. 최신 가입자 순으로 정렬 (orderBy 사용)
  // 힌트: createdAt 필드를 desc(내림차순)로 정렬
  const latestUsers = // 여기에 코드를 작성하세요
  console.log('최신 가입자:', latestUsers)
  
  // 2. ID와 이름만 선택하여 조회 (select 사용)
  // 힌트: select에서 id와 name을 true로 설정
  const userNames = // 여기에 코드를 작성하세요
  console.log('ID와 이름만:', userNames)
  
  // 3. 정렬 + 선택 조합
  // 가입일 최신순으로 정렬하고, 이름과 이메일만 조회
  const sortedSelected = // 여기에 코드를 작성하세요
  console.log('정렬+선택:', sortedSelected)
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
          pattern: 'orderBy',
          message: 'orderBy를 사용하여 정렬해야 합니다.'
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
                   result.output.includes('최신 가입자') &&
                   result.output.includes('ID와 이름만') &&
                   result.output.includes('정렬+선택')
          },
          message: 'orderBy와 select가 올바르게 실행되어야 합니다.'
        }
      ]
    },
    hints: [
      {
        level: 1,
        content: 'orderBy는 { 필드명: "asc" 또는 "desc" } 형식입니다. createdAt을 내림차순(desc)하면 최신순입니다.'
      },
      {
        level: 2,
        content: 'select는 { 필드명: true } 형식으로 원하는 필드만 지정합니다. true로 설정한 필드만 결과에 포함됩니다.'
      },
      {
        level: 3,
        content: 'orderBy와 select를 함께 사용하는 방법입니다.',
        codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  // 1. 최신순 정렬
  const latestUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
  console.log('최신 가입자:', latestUsers)
  
  // 2. 특정 필드만 선택
  const userNames = await prisma.user.findMany({
    select: {
      id: true,
      name: true
    }
  })
  console.log('ID와 이름만:', userNames)
  
  // 3. 정렬 + 선택 조합
  const sortedSelected = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      email: true
    }
  })
  console.log('정렬+선택:', sortedSelected)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
      }
    ]
}
