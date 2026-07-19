import type { CurriculumStep } from '@/types/curriculum'

export const week_5_3: CurriculumStep = {
  id: 'week-5-3',
  title: '5주차 · Array 변환 메서드 (map, filter, reduce)',
  order: 27,
  category: 'advanced',
  content: {
    mission:
      '사용자 정보 배열(`users`)이 주어질 때, 활성 사용자(`isActive: true`)만 필터링한 후, 그들의 나이(`age`) 평균을 계산하는 `calculateAverageAgeOfActiveUsers(users: Array<{ name: string; age: number; isActive: boolean }>): number` 함수를 작성하세요. `filter`와 `reduce` (또는 `map`) 메서드를 조합해 구현하세요.',
    theory: `
      JavaScript의 배열(Array)은 함수형 프로그래밍 스타일로 데이터를 선언적으로 제어할 수 있는 고차 함수 메서드들을 지원합니다.

      ## 1. Array.prototype.map()
      배열 내의 모든 요소 각각에 대하여 제공된 함수를 호출한 결과를 모아 **새로운 배열**을 생성합니다.
      \`\`\`ts
      const doubled = [1, 2, 3].map(x => x * 2); // [2, 4, 6]
      \`\`\`

      ## 2. Array.prototype.filter()
      제공된 함수의 테스트를 통과하는 모든 요소를 모아 **새로운 배열**을 반환합니다.
      \`\`\`ts
      const evens = [1, 2, 3, 4].filter(x => x % 2 === 0); // [2, 4]
      \`\`\`

      ## 3. Array.prototype.reduce()
      배열의 각 요소에 대해 주어진 리듀서(reducer) 함수를 실행하고, 하나의 결과값을 반환합니다.
      \`\`\`ts
      // sum 계산 예시
      const sum = [1, 2, 3, 4].reduce((accumulator, currentValue) => accumulator + currentValue, 0); // 10
      \`\`\`
    `,
    objectives: [
      'Array.prototype.filter() 메서드를 사용하여 활성 사용자를 먼저 필터링할 것',
      'Array.prototype.reduce() 또는 map + reduce를 사용하여 나이의 누적 합을 계산하고 평균을 산출할 것'
    ],
    exercise: "1. `extractIds` 함수 내부에 `#`로 시작하고 영문 대소문자/숫자가 반복되는 해시태그 패턴 정규식을 선언하세요.\n2. 문자열의 `match()` 메서드와 글로벌 플래그(`g`)를 결합하여 매칭 결과를 배열로 리턴하세요. 매칭 결과가 없을 경우 빈 배열을 리턴하도록 예외 처리하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export interface User {
  name: string;
  age: number;
  isActive: boolean;
}

export function calculateAverageAgeOfActiveUsers(users: User[]): number {
  // 활성 사용자만 필터링하고 평균 나이를 리턴하세요.
  const activeUsers = users.filter(u => u.isActive);
  if (activeUsers.length === 0) return 0;
  
  return 0;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.filter(',
        message: 'filter() 메서드를 사용하여 활성 사용자를 추려내야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.reduce(',
        message: 'reduce() 메서드를 사용하여 나이 합계를 계산해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '활성 사용자 배열 `activeUsers`에 대해 `reduce((sum, u) => sum + u.age, 0)`를 사용하면 총 나이의 합계를 구할 수 있습니다.'
    },
    {
      level: 2,
      content: '구한 총 합계를 활성 사용자 수(`activeUsers.length`)로 나누어 평균값을 구해 반환하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function extractIds(text: string): string[] {
  const idRegex = /#[a-zA-Z0-9]+/g;
  return text.match(idRegex) || [];
}`
    }
  ]
}