import type { CurriculumStep } from '@/types/curriculum'

export const week_6_4: CurriculumStep = {
  id: 'week-6-4',
  title: '6주차 · [큐] 기능 개발 (중급)',
  order: 34,
  category: 'advanced',
  content: {
    mission: '작업 진도 배열 `progresses`와 작업 속도 배열 `speeds`가 주어질 때, 각 배포마다 완료된 기능들이 묶여 배포되는 개수 목록을 반환하는 `developFeatures(progresses: number[], speeds: number[]): number[]` 함수를 구현하세요.',
    theory: `
      ## 큐 기반 묶음 연산
      앞선 기능이 완료되기 전까지는 뒤의 기능들이 먼저 완성되어도 대기하게 됩니다. 이를 해결하기 위해 각 기능별 완료까지 남은 "일수(days)"를 먼저 연산해 두고 순서대로 소모하며 배포 묶음을 구성합니다.

      ## 완료 일수 계산
      - 남은 작업량: \`100 - progresses[i]\`
      - 완료까지 걸리는 일수: \`Math.ceil(남은 작업량 / speeds[i])\`
    `,
    objectives: [
      '각 작업이 100% 완료되기까지 걸리는 소요일을 구해 순차 큐를 만들 것',
      '배포 기준일(maxDay)보다 작거나 같은 기간의 작업들은 단일 배포 묶음(count)으로 통합 연산할 것'
    ],
    exercise: "1. `Math.ceil((100 - p) / speeds[i])` 공식으로 작업 완료까지 소요되는 일수 배열을 만드세요.\n2. 순차적으로 루프를 돌며 배포 기준일에 같이 묶여 나가는 개수를 추출하여 배열로 리턴하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function developFeatures(progresses: number[], speeds: number[]): number[] {
  // 남은 기능 개발 일수를 큐처럼 접근하여 배포 그룹별 개수를 반환하세요.
  return [];
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'developFeatures',
        message: 'developFeatures 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /Math\.ceil/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '첫 번째 완성 일수를 `maxDay`로 삼고, 다음 일수들이 `maxDay`보다 작거나 같은지 검사하며 카운트를 늘리세요.'
    },
    {
      level: 2,
      content: '`maxDay`보다 큰 일수를 만나면 지금까지 쌓인 카운트를 push하고 `maxDay`를 그 값으로 교체하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function developFeatures(progresses: number[], speeds: number[]): number[] {
  const days = progresses.map((p, i) => Math.ceil((100 - p) / speeds[i]));
  const result: number[] = [];
  
  let maxDay = days[0];
  let count = 1;

  for (let i = 1; i < days.length; i++) {
    if (days[i] <= maxDay) {
      count++;
    } else {
      result.push(count);
      count = 1;
      maxDay = days[i];
    }
  }
  result.push(count);
  return result;
}`
    }
  ]
}
