import type { CurriculumStep } from '@/types/curriculum'

export const week_5_1: CurriculumStep = {
  id: 'week-5-1',
  title: '5주차 · 정규 표현식 기초 패턴',
  order: 25,
  category: 'advanced',
  content: {
    mission:
      '이메일 형식을 검증하는 정규 표현식을 작성하고, 이를 이용하여 입력값이 유효한 이메일인지 여부를 판단하는 `validateEmail(email: string): boolean` 함수를 작성하세요.',
    theory: `
      **정규 표현식(Regular Expression)**은 문자열에서 특정한 규칙을 가진 패턴을 찾거나 치환하기 위해 사용하는 형식 언어입니다.

      ## 1. 정규식 선언 방법
      JavaScript/TypeScript에서는 리터럴 방식 또는 생성자 방식으로 정규식을 정의합니다.
      \`\`\`ts
      const regex = /pattern/flags; // 리터럴 방식 (권장)
      const regex2 = new RegExp('pattern', 'flags'); // 생성자 방식
      \`\`\`

      ## 2. 기본적인 정규식 메타 문자
      - \`^\`: 문자열의 시작을 나타냅니다.
      - \`$\`: 문자열의 끝을 나타냅니다.
      - \`.\`: 임의의 한 문자를 나타냅니다.
      - \`\\d\`: 숫자(digit)를 나타냅니다. (\`[0-9]\`와 동일)
      - \`\\w\`: 알파벳, 숫자, 언더바(\`_\`)를 나타냅니다. (\`[a-zA-Z0-9_]\`와 동일)
      - \`\\s\`: 공백 문자를 나타냅니다.
      - \`+\`: 앞의 문자가 1번 이상 반복됨을 의미합니다.
      - \`*\`: 앞의 문자가 0번 이상 반복됨을 의미합니다.
      - \`?\`: 앞의 문자가 0번 또는 1번 존재함을 의미합니다.

      ## 3. 이메일 정규식 매칭의 예시
      이메일의 기본 형식은 \`계정명@도메인\`입니다.
      간단한 형태의 이메일 정규 표현식은 다음과 같습니다:
      \`\`\`ts
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
      \`\`\`
    `,
    objectives: [
      'validateEmail 함수 내에 이메일 검증용 정규식(Regex)을 선언할 것',
      'regex.test(email) 메서드를 이용하여 이메일 규칙 만족 여부를 boolean으로 반환할 것'
    ],
    exercise: `
1. \`validateEmail\` 함수 내부에 이메일 형식을 검증하는 정규 표현식을 선언하세요.
2. 정규식 객체의 \`test()\` 메서드를 사용해 입력된 \`email\` 값이 정규식 조건을 통과하는지 판단한 뒤 그 결과를 리턴하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function validateEmail(email: string): boolean {
  // 이메일 형식을 검증하는 정규 표현식을 작성하고 결과를 반환하세요.
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
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
        pattern: 'validateEmail',
        message: 'validateEmail 함수 이름이 존재해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\.test\(/,
        message: '정규식의 test() 메서드를 사용하여 검증해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '정규식을 선언한 후 `emailRegex.test(email)` 처럼 정규식 객체의 test 메서드 인자에 검사할 문자열을 넣어 호출하세요.'
    },
    {
      level: 2,
      content: '리턴 값을 단순히 false로 고정해두지 말고, test() 호출의 실행 결과를 그대로 return문 뒤에 넣어보세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}`
    }
  ]
}
