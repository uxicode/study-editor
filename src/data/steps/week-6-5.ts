import type { CurriculumStep } from '@/types/curriculum'

export const week_6_5: CurriculumStep = {
  id: 'week-6-5',
  title: '6주차 · 동적 계획법 (DP) 기초',
  order: 35,
  category: 'advanced',
  content: {
    mission:
      '동전 권종 배열 `coins`와 목표 금액 `amount`가 주어집니다 (예: `coins: [1, 2, 5]`, `amount: 11`). 목표 금액을 만들기 위해 필요한 최소 동전 개수를 구하는 `coinChange(coins: number[], amount: number): number` 함수를 작성하세요. 단, 조합이 불가능할 경우 `-1`을 반환하세요. DP 메모 테이블(배열)을 생성하여 구현하세요.',
    theory: `
      ## 1. 동적 계획법 (DP, Dynamic Programming)
      큰 문제를 작은 하위 문제들로 나누어 푸는 방법으로, 한 번 계산한 하위 문제의 결과는 배열 등에 저장(메모이제이션)하여 중복 계산을 방지합니다.

      ## 2. 최소 동전 문제 점화식
      배열 \`dp\`를 정의하고, \`dp[i]\`를 \`i\`원을 만드는 데 필요한 최소 동전 수로 둡니다:
      \`\`\`ts
      dp[0] = 0;
      // i원을 만들기 위한 전처리
      dp[i] = min(dp[i], dp[i - coin] + 1)
      \`\`\`
    `,
    objectives: [
      'amount + 1 크기의 dp 배열을 생성하고 Infinity 등으로 초기화할 것',
      'dp[0] = 0으로 설정한 뒤 이중 루프를 통해 값을 갱신하여 최적의 동전 개수를 계산할 것'
    ],
    exercise: "1. 동적 계획법(DP)을 사용해 피보나치 수열의 N번째 값을 리턴하는 `fibonacci` 함수를 작성하세요.\n2. N번째 연산 시 중복 계산을 막기 위해 메모이제이션(Memoization) 테이블을 선언하고 활용하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function coinChange(coins: number[], amount: number): number {
  // DP 테이블을 생성하고 최소 동전 개수를 리턴하세요.
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.fill(',
        message: 'DP 테이블 초기화를 위해 배열 fill() 메서드를 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /Math\.min\(/,
        message: 'Math.min()을 사용해 최소 값을 비교 및 갱신해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '1원부터 `amount`원까지 순회하는 바깥 루프와, 각 `coin`을 순회하는 안쪽 루프를 설계하세요.'
    },
    {
      level: 2,
      content: '안쪽 루프에서 `if (i - coin >= 0)` 조건을 충족할 때 `dp[i] = Math.min(dp[i], dp[i - coin] + 1)` 공식을 적용해 누계 최솟값을 구하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function fibonacci(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 0;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}`
    }
  ]
}