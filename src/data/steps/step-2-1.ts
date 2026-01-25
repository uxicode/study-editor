import type { CurriculumStep } from '@/types/curriculum'

export const step_2_1: CurriculumStep = {

    id: 'step-2-1',
    title: 'User 모델 정의 (기본)',
    order: 2,
    category: 'schema',
    content: {
      mission: '사용자를 관리하기 위한 User 모델을 설계하세요.',
      theory: `
        **Prisma 모델**은 데이터베이스 테이블의 구조를 정의합니다.
        
        ## 기본 구조
        
        \`\`\`prisma
        model ModelName {
          fieldName FieldType @attribute1 @attribute2
        }
        \`\`\`
        
        ## 필드 타입 (FieldType)
        
        - **Int**: 정수 (예: 1, 2, 3, 100)
          - 주로 ID, 나이, 개수 등에 사용
        - **String**: 문자열 (예: "hello", "user@email.com")
          - 이메일, 이름, 설명 등에 사용
        - **Boolean**: 참/거짓 (true/false)
        - **DateTime**: 날짜와 시간
        - **Float**: 실수 (예: 3.14, 99.99)
        - **String?**: 선택적 문자열 (물음표 = nullable)
          - 값이 없어도 되는 필드
        
        ## 필드 속성 (Attributes)
        
        필드 속성은 \`@\` 기호로 시작하며, **여러 개를 공백으로 구분하여 연달아 사용 가능**합니다.
        
        ### 기본 키 관련
        
        - **@id**: 기본 키(Primary Key)로 지정
          - 테이블에서 각 행을 고유하게 식별하는 필드
          - 중복될 수 없으며, NULL이 될 수 없음
        
        - **@default(autoincrement())**: 자동 증가 값
          - 새 레코드 생성 시 자동으로 1씩 증가 (1, 2, 3...)
          - PostgreSQL의 SERIAL 타입과 동일
          - **왜 사용?** 개발자가 수동으로 ID를 할당하지 않아도 됨
        
        ### 제약 조건
        
        - **@unique**: 고유 제약 조건
          - 중복된 값을 허용하지 않음
          - 예: 이메일은 중복되면 안 되므로 \`@unique\` 사용
        
        - **@default(value)**: 기본값 지정
          - 값을 입력하지 않으면 자동으로 설정되는 값
          - \`@default(now())\`: 현재 시간
          - \`@default(true)\`: Boolean 기본값
          - \`@default("ACTIVE")\`: String 기본값
        
        ### 여러 속성 동시 사용
        
        \`\`\`prisma
        model User {
          id    Int     @id @default(autoincrement())  // ✅ 가능!
          email String  @unique @default("unknown")    // ✅ 가능!
        }
        \`\`\`
        
        - **@id와 @default를 함께 쓸 수 있나요?** → ✅ 예! 공백으로 구분하여 작성
        - **순서가 중요한가요?** → ❌ 아니요. 하지만 관례적으로 \`@id\`를 먼저 작성합니다
        - **왜 같이 사용하나요?** → ID는 기본 키이면서 동시에 자동 생성되어야 하므로
        
        ## 선택적 필드 (?)
        
        \`\`\`prisma
        name String?  // NULL 허용 (선택 사항)
        age  Int      // NULL 불허 (필수)
        \`\`\`
        
        - **?가 있으면**: 값을 입력하지 않아도 됨 (NULL 가능)
        - **?가 없으면**: 반드시 값을 입력해야 함 (필수 필드)
        
        ## 실습 예시 분석
        
        \`\`\`prisma
        model User {
          id    Int     @id @default(autoincrement())
          email String  @unique
          name  String?
        }
        \`\`\`
        
        ### id 필드 해부
        - **Int**: 정수 타입
        - **@id**: 기본 키로 지정
        - **@default(autoincrement())**: 자동 증가 (사용자가 ID를 지정하지 않아도 됨)
        - **두 속성을 함께 쓰는 이유**: ID는 기본 키이면서 자동 생성되어야 하므로
        
        ### email 필드 해부
        - **String**: 문자열 타입
        - **@unique**: 중복 방지 (같은 이메일로 두 번 가입 불가)
        - **?가 없음**: 필수 입력 필드
        
        ### name 필드 해부
        - **String?**: 선택적 문자열
        - **속성 없음**: 특별한 제약 조건 없음
        - **?의 의미**: 이름을 입력하지 않아도 사용자 생성 가능
      `,
      objectives: [
        'Prisma 모델 정의 문법 이해',
        '기본 키와 유니크 제약 조건 설정',
        '필드 타입과 속성 사용'
      ],
      expectedOutput: `User 모델이 다음 필드를 포함해야 합니다:
- id: 정수형, 기본키, 자동 증가
- email: 문자열, 유니크
- name: 문자열, 선택 사항(Optional)`
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

// 여기에 User 모델을 작성하세요
model User {
  // id: 정수형, 기본키, 자동 증가
  // email: 문자열, 유니크
  // name: 문자열, 선택 사항
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
  console.log('User 모델 정의 확인')
  
  // Prisma Client의 user 속성이 존재하는지 확인
  if (prisma.user) {
    console.log('✓ User 모델이 정상적으로 정의되었습니다!')
  } else {
    console.log('✗ User 모델을 찾을 수 없습니다.')
  }
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
          pattern: 'model User',
          message: 'User 모델을 정의해야 합니다.'
        },
        {
          type: 'regex',
          target: 'prisma/schema.prisma',
          pattern: /id\s+Int\s+@id\s+@default\(autoincrement\(\)\)/,
          message: 'id 필드는 "Int @id @default(autoincrement())" 형식이어야 합니다.'
        },
        {
          type: 'regex',
          target: 'prisma/schema.prisma',
          pattern: /email\s+String\s+@unique/,
          message: 'email 필드는 "String @unique" 형식이어야 합니다.'
        },
        {
          type: 'regex',
          target: 'prisma/schema.prisma',
          pattern: /name\s+String\?/,
          message: 'name 필드는 "String?" (선택적) 형식이어야 합니다.'
        }
      ],
      dynamicChecks: [
        {
          type: 'result',
          test: (result: any) => {
            return result.success && result.output.includes('User 모델이 정상적으로 정의되었습니다')
          },
          message: 'User 모델이 정상적으로 정의되어야 합니다.'
        }
      ]
    },
    hints: [
      {
        level: 1,
        content: 'id 필드는 Int 타입이며, @id와 @default(autoincrement()) 속성이 필요합니다. 두 속성은 공백으로 구분하여 연달아 작성합니다.'
      },
      {
        level: 2,
        content: 'email은 String 타입이며, @unique 속성을 추가해야 합니다. 이메일 중복을 방지하기 위한 제약 조건입니다.'
      },
      {
        level: 3,
        content: 'name은 선택적 필드이므로 String? (물음표 추가)로 정의합니다. 물음표는 NULL 값을 허용한다는 의미입니다.',
        codeSnippet: `model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}`
      },
      {
        level: 4,
        content: '완전한 해답입니다. 각 줄의 의미를 이해하고 작성해보세요.',
        codeSnippet: `model User {
  // id: 자동 증가하는 정수형 기본 키
  // @id와 @default(autoincrement())를 함께 사용하는 것이 일반적
  id    Int     @id @default(autoincrement())
  
  // email: 중복되지 않는 문자열 (회원가입 시 유용)
  email String  @unique
  
  // name: 선택적 문자열 (NULL 가능, ? 표시)
  name  String?
}`
      }
    ]
}
