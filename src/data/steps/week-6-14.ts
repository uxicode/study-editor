import type { CurriculumStep } from '@/types/curriculum'

export const week_6_14: CurriculumStep = {
  id: 'week-6-14',
  title: '6주차 · [DP] 도둑질 — House Robber (원형 배열 응용)',
  order: 44,
  category: 'advanced',
  content: {
    mission: '인접한 집을 연속으로 털지 않는다는 가정하에, 원형으로 둘러싸인 집들의 돈 정보 배열 `nums`가 주어질 때 훔칠 수 있는 최대 금액을 리턴하는 `rob(nums: number[]): number` 함수를 작성하세요.',
    theory: `
      ## 점화식 설계
      i번째 집을 털 경우: \`dp[i-2] + 현재집값\`
      i번째 집을 건너뛸 경우: \`dp[i-1]\`
      
      ## 원형 배열 응용
      첫 번째 집과 마지막 집은 인접해 있으므로 둘 다 동시에 털 수 없습니다.
      - **선택 1:** 첫 번째 집을 포함하고 마지막 집을 제외 (\`nums.slice(0, -1)\`)
      - **선택 2:** 첫 번째 집을 제외하고 마지막 집을 포함 (\`nums.slice(1)\`)
      이 두 조건의 독립 계산 최대치 중 최종 최댓값을 뽑습니다.
    `,
    objectives: [
      '일렬 배열에서 훔칠 수 있는 최대 금액을 연산하는 rowRob 헬퍼 함수를 구현할 것',
      '첫 집 털고 마지막 패스 vs 첫 집 패스하고 마지막 털기 중 더 큰 금액을 리턴할 것'
    ],
    exercise: "1. `nums` 배열의 길이가 1 또는 2일 때의 기저 처리를 먼저 선언하세요.\n2. `nums.slice`를 통해 두 가지 배열 범위 조건에 대한 결과를 연산해 최댓값을 반환하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function rob(nums: number[]): number {
  // 원형 구조를 고려하여 도둑질할 수 있는 최대 금액을 반환하세요.
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
        pattern: 'rob',
        message: 'rob 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /nums\.slice/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '집이 하나뿐이면 `nums[0]`을, 두 집뿐이면 `Math.max(nums[0], nums[1])`을 조기 리턴하세요.'
    },
    {
      level: 2,
      content: '`dp[i] = Math.max(dp[i-1], dp[i-2] + houses[i])` 구조식을 헬퍼 함수에 작성하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function rob(nums: number[]): number {
  if (nums.length === 1) return nums[0];
  if (nums.length === 2) return Math.max(nums[0], nums[1]);

  function rowRob(houses: number[]): number {
    const dp = new Array(houses.length).fill(0);
    dp[0] = houses[0];
    dp[1] = Math.max(houses[0], houses[1]);

    for (let i = 2; i < houses.length; i++) {
      dp[i] = Math.max(dp[i - 1], dp[i - 2] + houses[i]);
    }
    return dp[houses.length - 1];
  }

  return Math.max(rowRob(nums.slice(0, -1)), rowRob(nums.slice(1)));
}`
    }
  ]
}
