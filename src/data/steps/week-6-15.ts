import type { CurriculumStep } from '@/types/curriculum'

export const week_6_15: CurriculumStep = {
  id: 'week-6-15',
  title: '6주차 · [DP] 최소 동전 개수 바꾸기 — Coin Change (중급)',
  order: 45,
  category: 'advanced',
  content: {
    mission: '동전 단위를 품은 `coins` 배열과 목표 금액 `amount`가 주어집니다. `amount`를 만드는 데 필요한 동전 개수의 최솟값을 리턴하는 `coinChange(coins: number[], amount: number): number` 함수를 구현하세요. (조합 불가시 -1)',
    theory: `
      ## 최소 개수 갱신 점화식
      금액 \`i\`를 맞추기 위한 최솟값은 각 동전 \`coin\`에 대해:
      \`dp[i] = Math.min(dp[i], dp[i - coin] + 1)\`
      
      ## 초기화 팁
      최솟값을 매칭해야 하므로 dp 배열을 무한값(\`Infinity\`)으로 다 채운 뒤, \`dp[0] = 0\`(0원을 만드는 개수는 0개) 기저 처리를 하고 루프를 돌립니다.
    `,
    objectives: [
      'amount 크기 + 1 길이 of dp 배열을 생성하고 Infinity로 초기값을 가득 채울 것',
      '각 동전(coin) 단위를 순회하며 누적 금액 i에 대한 최소 필요 개수를 갱신해 나갈 것'
    ],
    exercise: "1. `dp[0] = 0`으로 채우고 루프를 돌며 동전 조합 누적 최소 카운트를 누적해 가세요.\n2. 최종 결과 index에 들어 있는 값이 Infinity면 조합할 수 없으므로 -1을 내보내세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function coinChange(coins: number[], amount: number): number {
  // 동전들의 조합으로 amount를 채우는 동전의 최소 개수를 리턴하세요.
  return -1;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'coinChange',
        message: 'coinChange 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /Infinity/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '금액 루프 도중 `i`는 현재 동전 단위인 `coin`부터 시작하여 `amount`까지 상향식(Bottom-up)으로 전진합니다.'
    },
    {
      level: 2,
      content: '`dp[i - coin] + 1`은 i-coin 금액을 만든 뒤 해당 동전 한 개를 얹었다는 가상의 경우입니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`
    }
  ]
}
