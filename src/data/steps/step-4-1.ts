import type { CurriculumStep } from '@/types/curriculum'

export const step_4_1: CurriculumStep = {

    id: 'step-4-1',
    title: 'Read - 기본 조회 메서드',
    order: 6,
    category: 'read',
    content: {
      mission: 'findMany(), findUnique(), findFirst()를 사용하여 다양한 방법으로 데이터를 조회하세요.',
      theory: `
        ## Prisma 기본 조회 메서드
        
        Prisma Client를 사용하면 SQL을 직접 쓰지 않고도 데이터를 안전하고 쉽게 조회할 수 있습니다.
        
        ## 1. 세 가지 기본 조회 메서드
        
        | 메서드 | 용도 | 특징 |
        |--------|------|------|
        | **findMany()** | 여러 레코드 조회 | 조건이 없으면 전체 조회, 조건에 맞는 모든 리스트 반환 |
        | **findUnique()** | 고유한 단일 레코드 조회 | @unique 또는 @id 필드로만 검색 가능 (속도 매우 빠름) |
        | **findFirst()** | 조건에 맞는 첫 번째 레코드 | unique 필드가 아닌 일반 필드(예: 이름)로 단건 조회 시 사용 |
        
        ## 2. findMany() - 여러 레코드 조회
        
        \`\`\`javascript
        // 모든 사용자 조회
        const allUsers = await prisma.user.findMany()
        
        // 조건에 맞는 사용자들 조회
        const aliceUsers = await prisma.user.findMany({
          where: { name: 'Alice' }
        })
        \`\`\`
        
        **특징:**
        - 배열 \`[]\` 반환 (결과가 없으면 빈 배열)
        - 조건 없이 호출하면 테이블의 모든 데이터 반환
        - 게시판 목록, 검색 결과 등에 활용
        
        **반환 예시:**
        \`\`\`javascript
        [
          { id: 1, email: "alice@example.com", name: "Alice" },
          { id: 2, email: "bob@example.com", name: "Bob" }
        ]
        \`\`\`
        
        ## 3. findUnique() - 고유한 단일 레코드 조회
        
        \`\`\`javascript
        // ID로 조회 (@id 필드)
        const user = await prisma.user.findUnique({
          where: { id: 1 }
        })
        
        // 이메일로 조회 (@unique 필드)
        const user = await prisma.user.findUnique({
          where: { email: "alice@example.com" }
        })
        \`\`\`
        
        **특징:**
        - 단일 객체 또는 \`null\` 반환
        - **@unique 또는 @id 필드로만 검색 가능**
        - 인덱스를 사용하므로 속도가 매우 빠름
        - 회원 정보 조회, 상세 페이지 등에 활용
        
        **왜 @unique 필드만?**
        - 고유 필드는 DB에 인덱스가 생성되어 검색 속도가 매우 빠름
        - 중복이 없으므로 항상 0개 또는 1개의 결과만 반환
        
        ## 4. findFirst() - 첫 번째 레코드 조회
        
        \`\`\`javascript
        // 이름이 'Alice'인 첫 번째 사용자
        const user = await prisma.user.findFirst({
          where: { name: 'Alice' }
        })
        \`\`\`
        
        **특징:**
        - 단일 객체 또는 \`null\` 반환
        - unique 필드가 아닌 일반 필드로도 검색 가능
        - 여러 결과 중 첫 번째만 반환
        
        **findUnique vs findFirst 차이:**
        
        | 특징 | findUnique | findFirst |
        |------|-----------|-----------|
        | 검색 필드 | @unique, @id만 | 모든 필드 가능 |
        | 속도 | 매우 빠름 (인덱스) | 상대적으로 느림 |
        | 사용 예 | ID/이메일 조회 | 이름으로 조회 |
        
        ## 5. where 조건으로 필터링
        
        \`\`\`javascript
        // 이름이 'Alice'인 사용자들 찾기
        const users = await prisma.user.findMany({
          where: { name: 'Alice' }
        })
        
        // 복합 조건 (AND) - 관리자이면서 활성 상태
        const activeAdmins = await prisma.user.findMany({
          where: {
            role: 'ADMIN',
            status: 'ACTIVE'
          }
        })
        \`\`\`
        
        **where 조건 특징:**
        - 조건에 맞는 데이터만 필터링
        - 여러 필드를 조합하여 복합 조건 가능
        - findMany, findFirst, findUnique 모두 사용 가능
        
        ## 실무 팁
        
        1. **속도가 중요하면**: findUnique 사용 (@unique/@id 필드)
        2. **일반 필드 검색**: findFirst 사용 (이름, 상태 등)
        3. **목록 조회**: findMany 사용 (게시판, 검색 결과)
        4. **null 체크**: findUnique, findFirst는 결과가 없으면 null 반환
      `,
      objectives: [
        'findMany(), findUnique(), findFirst() 세 가지 조회 메서드의 차이점 이해',
        'findMany()로 여러 레코드 조회 및 배열 반환 이해',
        'findUnique()로 @unique/@id 필드를 사용한 단건 조회',
        'findFirst()로 일반 필드를 사용한 첫 번째 레코드 조회',
        'where 조건으로 단일 및 복합 필터링'
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
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
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
  // 1. findMany()로 모든 사용자 조회
  const allUsers = // 여기에 코드를 작성하세요
  console.log('모든 사용자:', allUsers)
  console.log('총', allUsers.length, '명')
  
  // 2. findUnique()로 이메일로 특정 사용자 조회
  // 힌트: where 절에 email 필드 사용
  const userByEmail = // 여기에 코드를 작성하세요
  console.log('이메일로 조회:', userByEmail)
  
  // 3. findFirst()로 이름으로 첫 번째 사용자 조회
  // 힌트: where 절에 name 필드 사용
  const userByName = // 여기에 코드를 작성하세요
  console.log('이름으로 조회:', userByName)
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
          pattern: 'findMany',
          message: 'findMany() 메서드를 사용해야 합니다.'
        },
        {
          type: 'includes',
          target: 'app.js',
          pattern: 'findUnique',
          message: 'findUnique() 메서드를 사용해야 합니다.'
        },
        {
          type: 'includes',
          target: 'app.js',
          pattern: 'findFirst',
          message: 'findFirst() 메서드를 사용해야 합니다.'
        }
      ],
      dynamicChecks: [
        {
          type: 'result',
          test: (result: any) => {
            return result.success && 
                   result.output.includes('모든 사용자') &&
                   result.output.includes('이메일로 조회') &&
                   result.output.includes('이름으로 조회')
          },
          message: '세 가지 조회 메서드가 올바르게 실행되어야 합니다.'
        }
      ]
    },
    hints: [
      {
        level: 1,
        content: 'findMany()는 인자 없이 호출하면 모든 레코드를 배열로 반환합니다.'
      },
      {
        level: 2,
        content: 'findUnique()는 where 절에 @unique 필드(email 또는 id)를 사용해야 합니다. findFirst()는 where 절에 일반 필드(name)를 사용할 수 있습니다.'
      },
      {
        level: 3,
        content: '세 가지 메서드의 기본 사용법입니다.',
        codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  // 1. findMany() - 배열 반환
  const allUsers = await prisma.user.findMany()
  console.log('모든 사용자:', allUsers)
  console.log('총', allUsers.length, '명')
  
  // 2. findUnique() - 객체 또는 null 반환
  const userByEmail = await prisma.user.findUnique({
    where: { email: "user@example.com" }
  })
  console.log('이메일로 조회:', userByEmail)
  
  // 3. findFirst() - 객체 또는 null 반환
  const userByName = await prisma.user.findFirst({
    where: { name: "Alice" }
  })
  console.log('이름으로 조회:', userByName)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
      }
    ]
}
