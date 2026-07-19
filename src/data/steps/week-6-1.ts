import type { CurriculumStep } from '@/types/curriculum'

export const week_6_1: CurriculumStep = {
  id: 'week-6-1',
  title: '6주차 · [스택] 올바른 괄호쌍 검사 (기본)',
  order: 31,
  category: 'advanced',
  content: {
    mission: '대, 중, 소괄호가 섞인 문자열 `str`이 주어질 때, 괄호의 짝이 맞고 올바른 순서로 닫혔는지 검사하는 `checkBrackets(str: string): boolean` 함수를 작성하세요.',
    theory: `
      ## 스택(Stack) 자료구조
      스택은 **LIFO (Last In First Out, 후입선출)** 원칙에 따라 동작하는 선형 자료구조입니다. 가장 마지막에 삽입된 데이터가 가장 먼저 꺼내집니다.

      ## 괄호 매칭 설계
      - 여는 괄호(\`(\`, \`{\`, \`[\`)를 만나면 스택에 push합니다.
      - 닫는 괄호(\`)\`, \`}\`, \`]\`)를 만나면 스택에서 pop하여 짝이 맞는지 검사합니다.
      - 모든 처리가 끝났을 때 스택이 비어 있어야 올바른 괄호쌍입니다.
    `,
    objectives: [
      '여는 괄호가 올 때 스택에 적재할 것',
      '닫는 괄호를 만나면 스택에서 pop하여 올바른 짝인지 비교 검증할 것',
      '최종 스택의 빈 상태 여부를 boolean으로 리턴할 것'
    ],
    exercise: "1. `checkBrackets` 함수 내부에 스택 배열을 선언하세요.\n2. 여는 괄호와 닫는 괄호의 대응 관계를 나타내는 매핑 객체(matches)를 선언하고, 짝이 맞는지 검사하여 결과를 반환하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function checkBrackets(str: string): boolean {
  // 스택을 사용해 대, 중, 소괄호 매칭 여부를 검사하여 반환하세요.
  return false;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'checkBrackets',
        message: 'checkBrackets 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\.push\(/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\.pop\(/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '여는 괄호가 들어오면 `stack.push(char)`를 사용해 스택에 담으세요.'
    },
    {
      level: 2,
      content: '닫는 괄호인 경우 `stack.pop()`을 호출해 매칭되는 짝과 맞는지 검사하고, 다르면 즉시 false를 리턴하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function checkBrackets(str: string): boolean {
  const stack: string[] = [];
  const matches: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  
  for (let char of str) {
    if (['(', '{', '['].includes(char)) {
      stack.push(char);
    } else if ([')', '}', ']'].includes(char)) {
      if (stack.length === 0 || stack.pop() !== matches[char]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}`
    }
  ]
}
