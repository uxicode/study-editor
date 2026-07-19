import type { CurriculumStep } from '@/types/curriculum'

export const week_6_final: CurriculumStep = {
  id: 'week-6-final',
  title: '6주차 · [DP] 가장 긴 증가하는 부분 수열 — LIS (고급)',
  order: 46,
  category: 'advanced',
  content: {
    mission: '정수 배열 `nums`가 주어질 때, 오름차순으로 엄격하게 증가하는 부분 수열의 가장 긴 길이를 리턴하는 `lengthOfLIS(nums: number[]): number` 함수를 구현하세요.',
    theory: `
      ## LIS (Longest Increasing Subsequence)
      배열 내 원소를 뽑아 정렬 순서를 바꾸지 않고 만들 수 있는 가장 긴 증가 부분 수열의 크기를 찾는 정형적인 DP 알고리즘입니다.

      ## LIS 설계
      - \`dp[i]\`는 \`i\`번째 원소를 끝으로 삼는 가장 긴 LIS의 길이입니다. (초기값은 전부 1)
      - 내 이전의 모든 원소 \`j\` (0 ~ i-1)를 조사하며, \`nums[j] < nums[i]\`가 성립할 때 \`dp[i] = Math.max(dp[i], dp[j] + 1)\` 로 기존 최장값을 연장합니다.
    `,
    objectives: [
      '모든 배열 원소의 LIS 기저를 1로 보관할 dp 배열을 선언할 것',
      '이중 포문으로 i의 이전 인덱스 j를 순회하여 최장 길이를 점화식으로 확장할 것'
    ],
    exercise: "1. `dp` 배열을 입력받은 nums 길이만큼 생성하고 1로 가득 채우세요.\n2. j 인덱스 값이 i 인덱스 값보다 작을 때, `dp[j] + 1`이 현재 dp[i]보다 크면 덮어씌워 갱신하고 LIS의 최댓값을 출력하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function lengthOfLIS(nums: number[]): number {
  // 가장 긴 증가하는 부분 수열의 길이를 리턴하세요.
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
        pattern: 'lengthOfLIS',
        message: 'lengthOfLIS 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /dp\[j\]\s*\+\s*1/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '외부 루프 `i`는 1부터, 내부 루프 `j`는 0부터 `i-1`까지 순회하게 루프 범위를 정의하세요.'
    },
    {
      level: 2,
      content: '최종 반환 시에는 `Math.max(...dp)`를 이용하여 전체 메모이제이션 내 가장 큰 수치를 리턴하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function lengthOfLIS(nums: number[]): number {
  if (nums.length === 0) return 0;
  const dp = new Array(nums.length).fill(1);

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  return Math.max(...dp);
}`
    }
  ]
}
