import type { CurriculumStep } from '@/types/curriculum'

export const week_6_13: CurriculumStep = {
  id: 'week-6-13',
  title: '6주차 · [DP] 계단 오르기 (기본)',
  order: 43,
  category: 'advanced',
  content: {
    mission: '정상까지 총 `n`개의 계단이 있습니다. 한 번에 1계단 또는 2계단씩만 오를 수 있을 때, 정상에 도달할 수 있는 서로 다른 방법의 가짓수를 반환하는 `climbStairs(n: number): number` 함수를 작성하세요.',
    theory: `
      ## 동적 계획법 (Dynamic Programming)
      큰 문제를 작은 하위 문제들로 쪼개어 풀되, 이미 계산한 결과(Memoization)를 어딘가에 저장해 두었다가 다시 활용하여 연산 속도를 O(N)으로 비약적으로 올리는 기법입니다.

      ## 계단 오르기 점화식 도출
      - N번째 계단에 서는 방법은 "N-1번째 계단에서 1칸 뛰어오르기" 또는 "N-2번째 계단에서 2칸 뛰어오르기" 둘뿐입니다.
      - 점화식: \`dp[n] = dp[n - 1] + dp[n - 2]\`
    `,
    objectives: [
      '동적 계획법 누적을 위한 dp 메모이제이션 배열을 생성할 것',
      '초기 기저 사례(dp[1]=1, dp[2]=2)를 정의하고 3번째 계단부터 점화식을 구현할 것'
    ],
    exercise: "1. 계단 n개까지의 연산 데이터를 누적 보관할 `dp` 배열을 생성하세요.\n2. 피보나치 형태의 점화식 루프를 3번 칸부터 수행하여 그 결과를 반환하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function climbStairs(n: number): number {
  // 계단을 오르는 모든 경우의 수를 점화식을 활용해 구하세요.
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
        pattern: 'climbStairs',
        message: 'climbStairs 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /dp\[i\s*-\s*1\]\s*\+\s*dp\[i\s*-\s*2\]/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '계단 수가 2개 이하인 경우 (`n <= 2`) 예외 분기로 바로 `n`을 그대로 반환하게 돕는 것이 빠릅니다.'
    },
    {
      level: 2,
      content: '`dp[i] = dp[i-1] + dp[i-2]` 관계식이 핵심입니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function climbStairs(n: number): number {
  if (n <= 2) return n;
  const dp = new Array(n + 1).fill(0);
  
  dp[1] = 1;
  dp[2] = 2;

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}`
    }
  ]
}
