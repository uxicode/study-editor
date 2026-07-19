import type { CurriculumStep } from '@/types/curriculum'

export const week_6_2: CurriculumStep = {
  id: 'week-6-2',
  title: '6주차 · 스택 & 큐 자료구조 활용',
  order: 32,
  category: 'advanced',
  content: {
    mission:
      '괄호 문자들로만 이루어진 문자열 \`s\`가 매개변수로 주어집니다 (예: \`"()[]{}"\`). 소괄호, 중괄호, 대괄호의 짝이 올바르게 닫히는지 여부를 확인하는 \`isValidParentheses(s: string): boolean\` 함수를 작성하세요. 스택 자료구조(배열의 push, pop 활용)를 필수로 활용하여 해결하세요.',
    theory: `
      ## 1. 스택(Stack)과 큐(Queue)
      - **스택**: 후입선출(LIFO, Last In First Out) 형태의 자료구조입니다. JavaScript 배열의 \`push()\`와 \`pop()\` 메서드로 간단히 모방할 수 있습니다.
      - **큐**: 선입선출(FIFO, First In First Out) 형태의 자료구조입니다. JavaScript 배열의 \`push()\`와 \`shift()\` 메서드로 간단히 구현할 수 있습니다.

      ## 2. 괄호 검사 알고리즘과 스택
      여는 괄호(\`(\`, \`{\`, \`[\`)를 만나면 스택에 추가하고, 닫는 괄호를 만나면 스택에서 최상단 요소를 꺼내어 매칭되는 여는 괄호인지 확인합니다.
    `,
    objectives: [
      '배열의 push() 메서드를 활용하여 여는 괄호를 스택에 집어넣을 것',
      '배열의 pop() 메서드를 활용하여 닫는 괄호가 매칭되는지 스택에서 꺼내 확인하도록 구현할 것'
    ],
    exercise: "1. 괄호 검사 클래스 `ParenthesisChecker`의 `isValid` 메서드를 완성하세요.\n2. 스택(Stack) 배열 구조를 선언하고, 열린 괄호가 올 때 push하고 닫힌 괄호가 올 때 pop하며 올바르게 짝이 맞는지 검사하여 결과를 리턴하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function isValidParentheses(s: string): boolean {
  const stack: string[] = [];
  // 스택을 사용하여 괄호 유효성을 검사하고 결과를 반환하세요.
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
        pattern: '.push(',
        message: 'push() 메서드를 사용하여 여는 괄호를 스택에 쌓아야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.pop()',
        message: 'pop() 메서드를 사용하여 스택에서 이전 여는 괄호를 추출하여 비교해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '닫는 괄호를 만났을 때 스택이 비어 있거나 스택 최상단(pop 결과)이 매칭되지 않는 괄호면 바로 `false`를 리턴해야 합니다.'
    },
    {
      level: 2,
      content: '루프가 모두 끝났을 때 스택에 남은 여는 괄호가 없어야(즉, `stack.length === 0`) 유효한 괄호입니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export class ParenthesisChecker {
  isValid(s: string): boolean {
    const stack: string[] = [];
    const pairs: Record<string, string> = {
      ')': '(',
      '}': '{',
      ']': '['
    };
    for (const char of s) {
      if (['(', '{', '['].includes(char)) {
        stack.push(char);
      } else if ([')', '}', ']'].includes(char)) {
        if (stack.pop() !== pairs[char]) {
          return false;
        }
      }
    }
    return stack.length === 0;
  }
}`
    }
  ]
}