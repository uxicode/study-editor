import type { CurriculumStep } from '@/types/curriculum'

export const step_8_2: CurriculumStep = {
  id: 'step-8-2',
  title: '텍스트 검색 (contains, startsWith, endsWith)',
  order: 18,
  category: 'read',
  content: {
    mission: 'contains, startsWith, endsWith를 사용하여 텍스트 검색 기능을 구현하세요.',
    theory: `
      실무에서는 사용자가 입력한 키워드로 데이터를 검색하는 기능이 필수적입니다.
      
      ## 텍스트 검색 연산자
      
      Prisma는 문자열 필드에서 텍스트 검색을 위한 여러 연산자를 제공합니다.
      
      | 연산자 | 설명 | 예시 |
      |--------|------|------|
      | **contains** | 부분 일치 (포함) | "Alice" → "Alice", "Alice Smith" |
      | **startsWith** | 시작 문자열 일치 | "Ali" → "Alice", "Alice Smith" |
      | **endsWith** | 끝 문자열 일치 | "ice" → "Alice", "Alice" |
      
      ## contains - 부분 일치 검색
      
      **contains**는 문자열이 특정 텍스트를 **포함**하는지 확인합니다.
      
      ### 기본 사용법
      
      \`\`\`javascript
      // 이름에 "Alice"가 포함된 사용자
      const users = await prisma.user.findMany({
        where: {
          name: {
            contains: "Alice"
          }
        }
      })
      \`\`\`
      
      **특징:**
      - 대소문자 구분 (기본값)
      - 부분 문자열 검색
      - 가장 일반적으로 사용되는 검색 방법
      
      ### 대소문자 구분 없이 검색
      
      \`\`\`javascript
      // mode: 'insensitive'로 대소문자 구분 없이 검색
      const users = await prisma.user.findMany({
        where: {
          name: {
            contains: "alice",
            mode: 'insensitive'  // 대소문자 무시
          }
        }
      })
      \`\`\`
      
      **mode 옵션:**
      - \`default\`: 대소문자 구분 (기본값)
      - \`insensitive\`: 대소문자 구분 없음
      
      ## startsWith - 시작 문자열 검색
      
      **startsWith**는 문자열이 특정 텍스트로 **시작**하는지 확인합니다.
      
      ### 기본 사용법
      
      \`\`\`javascript
      // 이름이 "Ali"로 시작하는 사용자
      const users = await prisma.user.findMany({
        where: {
          name: {
            startsWith: "Ali"
          }
        }
      })
      \`\`\`
      
      **특징:**
      - 자동완성, 접두사 검색에 유용
      - 성능이 contains보다 좋음 (인덱스 활용 가능)
      
      ### 실무 예시: 자동완성
      
      \`\`\`javascript
      // 사용자 이름 자동완성
      const suggestions = await prisma.user.findMany({
        where: {
          name: {
            startsWith: "Ali",
            mode: 'insensitive'
          }
        },
        take: 10
      })
      \`\`\`
      
      ## endsWith - 끝 문자열 검색
      
      **endsWith**는 문자열이 특정 텍스트로 **끝나는**지 확인합니다.
      
      ### 기본 사용법
      
      \`\`\`javascript
      // 이메일이 ".com"으로 끝나는 사용자
      const users = await prisma.user.findMany({
        where: {
          email: {
            endsWith: ".com"
          }
        }
      })
      \`\`\`
      
      **특징:**
      - 파일 확장자 검색 등에 유용
      - 상대적으로 덜 사용됨
      
      ## 실무 활용 예시
      
      ### 1. 문서 제목 검색
      
      \`\`\`javascript
      // 제목에 "프로젝트"가 포함된 문서
      const documents = await prisma.document.findMany({
        where: {
          title: {
            contains: "프로젝트",
            mode: 'insensitive'
          }
        }
      })
      \`\`\`
      
      ### 2. 사용자 이름 자동완성
      
      \`\`\`javascript
      // 이름이 "김"으로 시작하는 사용자
      const users = await prisma.user.findMany({
        where: {
          name: {
            startsWith: "김",
            mode: 'insensitive'
          }
        },
        take: 10,
        orderBy: { name: 'asc' }
      })
      \`\`\`
      
      ### 3. 복합 검색
      
      \`\`\`javascript
      // 제목이나 내용에 키워드가 포함된 문서
      const documents = await prisma.document.findMany({
        where: {
          OR: [
            {
              title: {
                contains: "프로젝트",
                mode: 'insensitive'
              }
            },
            {
              content: {
                contains: "프로젝트",
                mode: 'insensitive'
              }
            }
          ]
        }
      })
      \`\`\`
      
      ### 4. 검색 API 구현
      
      \`\`\`javascript
      async function searchDocuments(keyword) {
        return await prisma.document.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: keyword,
                  mode: 'insensitive'
                }
              },
              {
                content: {
                  contains: keyword,
                  mode: 'insensitive'
                }
              }
            ]
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        })
      }
      \`\`\`
      
      ## 성능 최적화
      
      ### 인덱스 활용
      
      \`startsWith\`는 인덱스를 활용할 수 있어 성능이 좋습니다.
      
      \`\`\`prisma
      model User {
        id   Int    @id @default(autoincrement())
        name String
        
        @@index([name])  // 인덱스 추가로 검색 성능 향상
      }
      \`\`\`
      
      ### 검색 결과 제한
      
      \`\`\`javascript
      // 검색 결과를 제한하여 성능 향상
      const results = await prisma.user.findMany({
        where: {
          name: {
            contains: "Alice",
            mode: 'insensitive'
          }
        },
        take: 50,  // 최대 50개만 반환
        orderBy: { createdAt: 'desc' }
      })
      \`\`\`
      
      ## 주의사항
      
      1. **대소문자**: 기본적으로 대소문자를 구분하므로 \`mode: 'insensitive'\` 고려
      2. **성능**: \`contains\`는 전체 텍스트 스캔이 필요하므로 느릴 수 있음
      3. **인덱스**: \`startsWith\`는 인덱스를 활용할 수 있어 빠름
      4. **특수문자**: 검색어에 특수문자가 있으면 이스케이프 필요
      5. **빈 문자열**: 빈 문자열로 검색하면 모든 레코드 반환
    `,
    objectives: [
      'contains로 부분 일치 검색',
      'startsWith로 시작 문자열 검색',
      'endsWith로 끝 문자열 검색',
      'mode: insensitive로 대소문자 구분 없이 검색',
      '복합 검색 조건 구현',
      '실무 검색 기능 구현'
    ],
    expectedOutput: '텍스트 검색 기능이 정상적으로 동작해야 합니다.'
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

model Document {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
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
  await prisma.document.createMany({
    data: [
      { title: "프로젝트 계획서", content: "프로젝트를 시작합니다" },
      { title: "회의록", content: "프로젝트 회의 내용" },
      { title: "프로젝트 보고서", content: "프로젝트 진행 상황" },
      { title: "일정표", content: "프로젝트 일정" }
    ]
  })
  
  console.log('테스트 데이터 생성 완료\\n')
  
  // 1. contains: 제목에 "프로젝트"가 포함된 문서
  // 힌트: title에 contains 사용, mode: 'insensitive' 추가
  const containsResults = // 여기에 코드를 작성하세요
  
  console.log('contains 검색 결과:', containsResults.length, '개')
  containsResults.forEach(doc => {
    console.log(\`  - \${doc.title}\`)
  })
  
  // 2. startsWith: 제목이 "프로젝트"로 시작하는 문서
  // 힌트: title에 startsWith 사용
  const startsWithResults = // 여기에 코드를 작성하세요
  
  console.log('\\nstartsWith 검색 결과:', startsWithResults.length, '개')
  startsWithResults.forEach(doc => {
    console.log(\`  - \${doc.title}\`)
  })
  
  // 3. 복합 검색: 제목이나 내용에 "프로젝트"가 포함된 문서
  // 힌트: OR 조건과 contains 조합
  const complexSearch = // 여기에 코드를 작성하세요
  
  console.log('\\n복합 검색 결과:', complexSearch.length, '개')
  complexSearch.forEach(doc => {
    console.log(\`  - \${doc.title}\`)
  })
  
  console.log('\\n✓ 텍스트 검색이 정상적으로 동작합니다!')
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
        pattern: 'contains',
        message: 'contains를 사용하여 부분 일치 검색해야 합니다.'
      },
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'startsWith',
        message: 'startsWith를 사용하여 시작 문자열 검색해야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success && 
                 result.output.includes('텍스트 검색이 정상적으로 동작합니다')
        },
        message: '텍스트 검색이 올바르게 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'contains는 객체 형식으로 사용합니다: { contains: "검색어", mode: "insensitive" }'
    },
    {
      level: 2,
      content: 'startsWith도 객체 형식으로 사용합니다: { startsWith: "검색어" }',
      codeSnippet: `const containsResults = await prisma.document.findMany({
  where: {
    title: {
      contains: "프로젝트",
      mode: 'insensitive'
    }
  }
})

const startsWithResults = await prisma.document.findMany({
  where: {
    title: {
      startsWith: "프로젝트"
    }
  }
})`
    },
    {
      level: 3,
      content: '복합 검색은 OR 조건과 함께 사용합니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  await prisma.document.createMany({
    data: [
      { title: "프로젝트 계획서", content: "프로젝트를 시작합니다" },
      { title: "회의록", content: "프로젝트 회의 내용" },
      { title: "프로젝트 보고서", content: "프로젝트 진행 상황" },
      { title: "일정표", content: "프로젝트 일정" }
    ]
  })
  
  console.log('테스트 데이터 생성 완료\\n')
  
  const containsResults = await prisma.document.findMany({
    where: {
      title: {
        contains: "프로젝트",
        mode: 'insensitive'
      }
    }
  })
  console.log('contains 검색 결과:', containsResults.length, '개')
  containsResults.forEach(doc => {
    console.log(\`  - \${doc.title}\`)
  })
  
  const startsWithResults = await prisma.document.findMany({
    where: {
      title: {
        startsWith: "프로젝트"
      }
    }
  })
  console.log('\\nstartsWith 검색 결과:', startsWithResults.length, '개')
  startsWithResults.forEach(doc => {
    console.log(\`  - \${doc.title}\`)
  })
  
  const complexSearch = await prisma.document.findMany({
    where: {
      OR: [
        {
          title: {
            contains: "프로젝트",
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: "프로젝트",
            mode: 'insensitive'
          }
        }
      ]
    }
  })
  console.log('\\n복합 검색 결과:', complexSearch.length, '개')
  complexSearch.forEach(doc => {
    console.log(\`  - \${doc.title}\`)
  })
  
  console.log('\\n✓ 텍스트 검색이 정상적으로 동작합니다!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    },
    {
      level: 4,
      content: 'mode: insensitive를 사용하면 대소문자 구분 없이 검색할 수 있습니다. contains, startsWith, endsWith 모두 사용 가능합니다.',
      codeSnippet: `// 대소문자 구분 없이 검색
const results = await prisma.document.findMany({
  where: {
    title: {
      contains: "프로젝트",
      mode: 'insensitive'  // 대소문자 무시
    }
  }
})`
    },
    {
      level: 5,
      content: '완전한 정답입니다. 모든 텍스트 검색 연산자를 활용한 코드입니다.',
      codeSnippet: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  await prisma.document.createMany({
    data: [
      { title: "프로젝트 계획서", content: "프로젝트를 시작합니다" },
      { title: "회의록", content: "프로젝트 회의 내용" },
      { title: "프로젝트 보고서", content: "프로젝트 진행 상황" },
      { title: "일정표", content: "프로젝트 일정" }
    ]
  })
  
  console.log('테스트 데이터 생성 완료\\n')
  
  const containsResults = await prisma.document.findMany({
    where: {
      title: {
        contains: "프로젝트",
        mode: 'insensitive'
      }
    }
  })
  console.log('contains 검색 결과:', containsResults.length, '개')
  containsResults.forEach(doc => {
    console.log(\`  - \${doc.title}\`)
  })
  
  const startsWithResults = await prisma.document.findMany({
    where: {
      title: {
        startsWith: "프로젝트"
      }
    }
  })
  console.log('\\nstartsWith 검색 결과:', startsWithResults.length, '개')
  startsWithResults.forEach(doc => {
    console.log(\`  - \${doc.title}\`)
  })
  
  const complexSearch = await prisma.document.findMany({
    where: {
      OR: [
        {
          title: {
            contains: "프로젝트",
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: "프로젝트",
            mode: 'insensitive'
          }
        }
      ]
    }
  })
  console.log('\\n복합 검색 결과:', complexSearch.length, '개')
  complexSearch.forEach(doc => {
    console.log(\`  - \${doc.title}\`)
  })
  
  console.log('\\n✓ 텍스트 검색이 정상적으로 동작합니다!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
