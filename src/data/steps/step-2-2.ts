import type { CurriculumStep } from '@/types/curriculum'

export const step_2_2: CurriculumStep = {

    id: 'step-2-2',
    title: 'User 모델 정의 (타임스탬프)',
    order: 3,
    category: 'schema',
    content: {
      mission: 'User 모델에 생성일과 수정일을 추가하여 데이터 변경 이력을 추적할 수 있도록 만드세요.',
      theory: `
        실무에서는 데이터가 **언제 생성되었는지, 언제 수정되었는지** 추적하는 것이 매우 중요합니다.
        
        ## 타임스탬프 필드
        
        ### @default(now()) - 생성일 자동 저장
        
        \`\`\`prisma
        createdAt DateTime @default(now())
        \`\`\`
        
        - **DateTime**: 날짜와 시간을 저장하는 타입
        - **@default(now())**: 레코드가 처음 생성될 때의 시간을 자동으로 저장
        - **왜 사용?**: 회원가입 시간, 게시글 작성 시간 등을 자동으로 기록
        
        **실무 활용 예시:**
        - 사용자가 언제 가입했는지 확인
        - 게시글이 언제 작성되었는지 표시
        - 데이터 감사(audit) 및 로그 추적
        
        ### @updatedAt - 수정일 자동 갱신
        
        \`\`\`prisma
        updatedAt DateTime @updatedAt
        \`\`\`
        
        - **@updatedAt**: Prisma의 특수 속성
        - 데이터가 수정될 때마다 **자동으로 현재 서버 시간으로 갱신**
        - 개발자가 직접 시간을 업데이트할 필요 없음
        
        **실무 활용 예시:**
        - 사용자 정보가 마지막으로 수정된 시간 추적
        - "수정됨" 표시 (예: 게시글 수정 시간 표시)
        - 최근 업데이트된 데이터 정렬
        
        ## @default(now())와 @updatedAt의 차이
        
        | 속성 | 설정 시점 | 업데이트 여부 | 용도 |
        |------|----------|--------------|------|
        | @default(now()) | 생성 시 한 번만 | ❌ 변경 안 됨 | 생성일 |
        | @updatedAt | 생성 시 + 수정 시마다 | ✅ 자동 갱신 | 수정일 |
        
        ## 실습 예시
        
        \`\`\`prisma
        model User {
          id        Int      @id @default(autoincrement())
          email     String   @unique
          name      String?
          createdAt DateTime @default(now())
          updatedAt DateTime @updatedAt
        }
        \`\`\`
        
        ### 동작 예시
        
        1. **사용자 생성 시:**
           \`\`\`
           createdAt: 2024-01-01 10:00:00
           updatedAt: 2024-01-01 10:00:00
           \`\`\`
        
        2. **사용자 정보 수정 시 (name 변경):**
           \`\`\`
           createdAt: 2024-01-01 10:00:00  (변경 없음)
           updatedAt: 2024-01-05 15:30:00  (자동 갱신!)
           \`\`\`
        
        ## 네이밍 컨벤션
        
        - **createdAt / updatedAt**: camelCase 사용 (Prisma 권장)
        - **created_at / updated_at**: snake_case 사용 (일부 프로젝트)
        
        실무에서는 **camelCase가 더 일반적**입니다.
      `,
      objectives: [
        '@default(now())로 생성일 자동 저장',
        '@updatedAt으로 수정일 자동 갱신',
        '타임스탬프의 실무 활용 이해'
      ],
      expectedOutput: `User 모델이 다음 필드를 포함해야 합니다:
- id: 정수형, 기본키, 자동 증가
- email: 문자열, 유니크
- name: 문자열, 선택 사항
- createdAt: 날짜시간, 기본값 now()
- updatedAt: 날짜시간, 자동 갱신`
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

// User 모델에 타임스탬프 필드를 추가하세요
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  // createdAt: DateTime 타입, 기본값 now()
  // updatedAt: DateTime 타입, @updatedAt 속성
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
  console.log('타임스탬프 필드 테스트')
  
  // 새 사용자 생성 (타임스탬프 자동 설정)
  const user = await prisma.user.create({
    data: {
      email: "timestamp@test.com",
      name: "Timestamp User"
    }
  })
  
  console.log('생성된 사용자:', user)
  console.log('생성 시간:', user.createdAt)
  console.log('수정 시간:', user.updatedAt)
  
  // 잠시 대기 후 사용자 정보 수정
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: "Updated Name" }
  })
  
  console.log('\\n수정 후:')
  console.log('생성 시간:', updated.createdAt, '(변경 없음)')
  console.log('수정 시간:', updated.updatedAt, '(자동 갱신됨)')
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
          type: 'regex',
          target: 'prisma/schema.prisma',
          pattern: /createdAt\s+DateTime\s+@default\(now\(\)\)/,
          message: 'createdAt 필드는 "DateTime @default(now())" 형식이어야 합니다.'
        },
        {
          type: 'regex',
          target: 'prisma/schema.prisma',
          pattern: /updatedAt\s+DateTime\s+@updatedAt/,
          message: 'updatedAt 필드는 "DateTime @updatedAt" 형식이어야 합니다.'
        }
      ],
      dynamicChecks: [
        {
          type: 'result',
          test: (result: any) => {
            return result.success && 
                   result.output.includes('생성 시간') &&
                   result.output.includes('수정 시간')
          },
          message: '타임스탬프가 올바르게 동작해야 합니다.'
        }
      ]
    },
    hints: [
      {
        level: 1,
        content: 'createdAt 필드는 DateTime 타입이며, @default(now()) 속성으로 생성 시간을 자동 저장합니다.'
      },
      {
        level: 2,
        content: 'updatedAt 필드는 DateTime 타입이며, @updatedAt 속성으로 수정 시마다 자동 갱신됩니다.'
      },
      {
        level: 3,
        content: '두 필드를 함께 사용하면 데이터의 생성/수정 이력을 완벽하게 추적할 수 있습니다.',
        codeSnippet: `model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`
      }
    ]
}
