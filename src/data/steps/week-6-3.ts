import type { CurriculumStep } from '@/types/curriculum'

export const week_6_3: CurriculumStep = {
  id: 'week-6-3',
  title: '6주차 · 해시 맵(Hash Map) 및 빈도수 집계',
  order: 33,
  category: 'advanced',
  content: {
    mission:
      '숫자 배열 \`nums\`가 주어집니다. 배열 내에서 과반수(배열 길이의 절반을 초과)로 등장하는 요소를 찾아내는 \`findMajorityElement(nums: number[]): number\` 함수를 작성하세요. JavaScript의 \`Map\` 또는 기본 객체(\`Record\`)를 해시 맵으로 활용하여 빈도수를 집계하세요.',
    theory: `
      ## 1. 해시 맵(Hash Map)
      키-값 쌍을 관리하며 검색, 삽입의 평균 시간 복잡도가 \`O(1)\`인 고성능 자료구조입니다. JavaScript에서는 일반 객체 \`{}\` 또는 \`Map\` 클래스를 사용하여 구현할 수 있습니다.

      ## 2. 빈도수 집계 패턴(Frequency Counter)
      중첩 루프를 사용해 \`O(N^2)\`이 걸릴 수 있는 탐색 작업을 한 번의 루프로 처리하게 해주는 최적화 방법입니다.
      \`\`\`ts
      const counts: Record<number, number> = {};
      for (const num of nums) {
        counts[num] = (counts[num] || 0) + 1;
      }
      \`\`\`
    `,
    objectives: [
      '해시 맵(객체 또는 Map 인스턴스)에 각 요소를 키로 하여 등장 빈도수를 기록할 것',
      '빈도수가 nums.length / 2를 초과하는 요소를 찾아 반환할 것'
    ],
    exercise: "1. 해시 맵 구조를 이용하여 배열 내 각 숫자의 카운트를 세어보세요.\n2. 그 후, 빈도가 `k` 이상인 숫자들만 필터링하여 오름차순 배열로 리턴하는 `topKFrequent` 함수를 작성하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function findMajorityElement(nums: number[]): number {
  const frequencyMap: Record<number, number> = {};
  // 해시 맵을 사용하여 과반수 요소를 찾아 리턴하세요.
  return -1;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /frequencyMap\[\w+\]\s*=/,
        message: '해시 맵에 각 요소의 빈도수를 누적하여 저장해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '배열을 루프 돌며 `frequencyMap[num] = (frequencyMap[num] || 0) + 1;` 패턴을 사용해 개수를 세어보세요.'
    },
    {
      level: 2,
      content: '이후 객체의 키를 순회하거나 루프 도중 `frequencyMap[num] > nums.length / 2`인지 판단하여 충족하는 즉시 해당 `num`을 반환하면 됩니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function topKFrequent(nums: number[], k: number): number[] {
  const counts = new Map<number, number>();
  for (const num of nums) {
    counts.set(num, (counts.get(num) || 0) + 1);
  }
  const result: number[] = [];
  for (const [num, count] of counts.entries()) {
    if (count >= k) {
      result.push(num);
    }
  }
  return result.sort((a, b) => a - b);
}`
    }
  ]
}