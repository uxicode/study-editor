import type { CurriculumStep } from '@/types/curriculum'

export const week_6_3: CurriculumStep = {
  id: 'week-6-3',
  title: '6주차 · [큐] 프린터 인쇄 대기열 (기본)',
  order: 33,
  category: 'advanced',
  content: {
    mission: '문서의 중요도가 담긴 배열 `priorities`와 내가 인쇄를 요청한 문서의 인덱스 `location`이 주어질 때, 대기열 중요도를 판별하여 내 문서가 몇 번째로 인쇄되는지 구하는 `printerQueue(priorities: number[], location: number): number` 함수를 완성하세요.',
    theory: `
      ## 큐(Queue) 자료구조
      큐는 **FIFO (First In First Out, 선입선출)** 원칙에 따라 동작하는 선형 자료구조입니다. 먼저 들어온 데이터가 먼저 빠져나갑니다.

      ## 문제 해결 전략
      - 문서를 \`{ id, priority }\` 객체로 포장하여 대기열 큐로 관리합니다.
      - 대기열의 맨 앞 문서를 꺼낸 후, 대기열 내에 더 높은 중요도를 가진 문서가 존재한다면 다시 큐의 뒤로 보냅니다.
      - 더 높은 중요도가 없으면 해당 문서를 인쇄 처리하고 순서를 셉니다.
    `,
    objectives: [
      '대기열 문서들의 원본 위치와 중요도를 결합해 큐 배열로 구성할 것',
      '큐 맨 앞을 꺼내어 중요도를 확인하고 최우선순위가 아닐 경우 맨 뒤로 보낼 것',
      '최우선순위일 때 인쇄 카운트를 늘리고 본인의 인덱스가 맞으면 출력할 것'
    ],
    exercise: "1. `priorities` 배열을 `{ id: index, priority: val }` 형태의 객체 큐로 변환하세요.\n2. 인쇄 처리될 때마다 순서를 누적하여 내가 요청한 location과 id가 같아지는 시점의 순서를 리턴하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function printerQueue(priorities: number[], location: number): number {
  // 큐 시뮬레이션을 통해 내 문서가 인쇄되는 순서를 계산하세요.
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
        pattern: 'printerQueue',
        message: 'printerQueue 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\.shift\(/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\.push\(/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '큐의 앞단을 꺼내려면 JS 배열의 `shift()` 메서드를 이용하면 편리합니다.'
    },
    {
      level: 2,
      content: '대기열에 나보다 높은 중요도가 있는지 탐색할 때 `some()` 메서드를 활용해 보세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function printerQueue(priorities: number[], location: number): number {
  const queue = priorities.map((p, i) => ({ id: i, priority: p }));
  let printOrder = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const hasHigher = queue.some(doc => doc.priority > current.priority);

    if (hasHigher) {
      queue.push(current);
    } else {
      printOrder++;
      if (current.id === location) {
        return printOrder;
      }
    }
  }
  return printOrder;
}`
    }
  ]
}
