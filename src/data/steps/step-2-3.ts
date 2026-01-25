import type { CurriculumStep } from '@/types/curriculum'

export const step_2_3: CurriculumStep = {

    id: 'step-2-3',
    title: 'User 모델 정의 (실무 기능)',
    order: 4,
    category: 'schema',
    content: {
      mission: 'enum과 @@map을 활용하여 실무에서 사용하는 User 모델을 완성하세요.',
      theory: `
        실무 프로젝트에서 자주 사용되는 Prisma 기능들을 배워봅시다.
        
        ## enum - 정해진 선택지
        
        **enum**은 정해진 값들 중 하나만 선택할 수 있도록 제한하는 타입입니다.
        
        ### 문법
        
        \`\`\`prisma
        enum Role {
          USER
          ADMIN
          MODERATOR
        }
        
        model User {
          role Role @default(USER)
        }
        \`\`\`
        
        ### 왜 사용하나요?
        
        - **타입 안전성**: 오타나 잘못된 값 입력 방지
        - **명확한 선택지**: 가능한 값들을 코드로 명시
        - **유지보수 용이**: 역할 추가/삭제가 한 곳에서 관리됨
        
        ### 실무 활용 예시
        
        **1. 사용자 역할 (Role)**
        \`\`\`prisma
        enum Role {
          USER      // 일반 사용자
          ADMIN     // 관리자
          MODERATOR // 중재자
        }
        \`\`\`
        
        **2. 계정 상태 (Status)**
        \`\`\`prisma
        enum Status {
          ACTIVE    // 활성
          INACTIVE  // 비활성
          SUSPENDED // 정지
          DELETED   // 삭제됨
        }
        \`\`\`
        
        **3. 주문 상태 (OrderStatus)**
        \`\`\`prisma
        enum OrderStatus {
          PENDING   // 대기중
          PAID      // 결제완료
          SHIPPED   // 배송중
          DELIVERED // 배송완료
          CANCELLED // 취소됨
        }
        \`\`\`
        
        ## @@map - 테이블 이름 매핑
        
        **@@map**은 모델 이름과 실제 DB 테이블 이름을 다르게 만들 때 사용합니다.
        
        ### 문법
        
        \`\`\`prisma
        model User {
          id Int @id
          
          @@map("users")  // 테이블 이름은 users (복수형)
        }
        \`\`\`
        
        ### 왜 사용하나요?
        
        - **DB 명명 규칙 대응**: 많은 DB는 테이블 이름을 복수형으로 사용 (users, posts, orders)
        - **레거시 DB 연동**: 기존 DB의 테이블 이름을 그대로 사용
        - **Snake_case 변환**: camelCase 모델을 snake_case 테이블로 매핑
        
        ### 실무 예시
        
        \`\`\`prisma
        model User {
          id Int @id
          @@map("users")  // Prisma: User, DB: users
        }
        
        model BlogPost {
          id Int @id
          @@map("blog_posts")  // Prisma: BlogPost, DB: blog_posts
        }
        \`\`\`
        
        ## @default와 enum 함께 사용
        
        \`\`\`prisma
        enum Role {
          USER
          ADMIN
        }
        
        model User {
          role Role @default(USER)  // 기본값은 USER
        }
        \`\`\`
        
        - 사용자 생성 시 role을 지정하지 않으면 자동으로 USER가 설정됨
        - 회원가입 시 일반 사용자로 시작하는 것이 일반적
        
        ## 완성된 실무 User 모델 예시
        
        \`\`\`prisma
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
          
          @@map("users")
        }
        \`\`\`
        
        ### 이 모델의 특징
        
        1. **기본 정보**: id, email, name
        2. **권한 관리**: role (USER/ADMIN)
        3. **계정 상태**: status (ACTIVE/INACTIVE)
        4. **이력 추적**: createdAt, updatedAt
        5. **DB 테이블명**: users (복수형 관례)
      `,
      objectives: [
        'enum으로 고정된 선택지 정의',
        '@@map으로 테이블 이름 매핑',
        '실무 수준의 User 모델 설계'
      ],
      expectedOutput: `User 모델이 다음을 포함해야 합니다:
- Role enum (USER, ADMIN)
- Status enum (ACTIVE, INACTIVE)
- role 필드 (기본값 USER)
- status 필드 (기본값 ACTIVE)
- @@map("users")로 테이블 이름 매핑`
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

// 1. Role enum 정의 (USER, ADMIN)
// enum Role {
//   USER
//   ADMIN
// }

// 2. Status enum 정의 (ACTIVE, INACTIVE)
// enum Status {
//   ACTIVE
//   INACTIVE
// }

// 3. User 모델에 enum 필드와 @@map 추가
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  // role      Role     @default(USER)
  // status    Status   @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // @@map("users")
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
  console.log('실무 User 모델 테스트\\n')
  
  // 1. 일반 사용자 생성 (기본값 자동 적용)
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "Regular User"
    }
  })
  
  console.log('일반 사용자 생성:')
  console.log('  Role:', user.role, '(기본값)')
  console.log('  Status:', user.status, '(기본값)')
  
  // 2. 관리자 생성 (role 명시)
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN"
    }
  })
  
  console.log('\\n관리자 생성:')
  console.log('  Role:', admin.role)
  console.log('  Status:', admin.status, '(기본값)')
  
  // 3. 모든 사용자 조회
  const allUsers = await prisma.user.findMany()
  console.log('\\n총', allUsers.length, '명의 사용자')
  
  console.log('\\n✓ enum과 @@map이 정상적으로 동작합니다!')
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
          pattern: 'enum Role',
          message: 'Role enum을 정의해야 합니다.'
        },
        {
          type: 'includes',
          target: 'prisma/schema.prisma',
          pattern: 'enum Status',
          message: 'Status enum을 정의해야 합니다.'
        },
        {
          type: 'regex',
          target: 'prisma/schema.prisma',
          pattern: /role\s+Role\s+@default\(USER\)/,
          message: 'role 필드는 "Role @default(USER)" 형식이어야 합니다.'
        },
        {
          type: 'regex',
          target: 'prisma/schema.prisma',
          pattern: /status\s+Status\s+@default\(ACTIVE\)/,
          message: 'status 필드는 "Status @default(ACTIVE)" 형식이어야 합니다.'
        },
        {
          type: 'includes',
          target: 'prisma/schema.prisma',
          pattern: '@@map("users")',
          message: '@@map("users")로 테이블 이름을 매핑해야 합니다.'
        }
      ],
      dynamicChecks: [
        {
          type: 'result',
          test: (result: any) => {
            return result.success && 
                   result.output.includes('Role:') &&
                   result.output.includes('Status:')
          },
          message: 'enum 필드가 올바르게 동작해야 합니다.'
        }
      ]
    },
    hints: [
      {
        level: 1,
        content: 'enum은 model 밖에서 정의합니다. enum Role { USER ADMIN } 형식으로 작성하세요.'
      },
      {
        level: 2,
        content: 'role과 status 필드는 각각 Role, Status 타입이며, @default로 기본값을 지정합니다.'
      },
      {
        level: 3,
        content: '@@map은 model 블록 안의 마지막에 작성하며, 이중 @@ 기호를 사용합니다.',
        codeSnippet: `enum Role {
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
  
  @@map("users")
}`
      }
    ]
}
