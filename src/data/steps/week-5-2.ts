import type { CurriculumStep } from '@/types/curriculum'

export const week_5_2: CurriculumStep = {
  id: 'week-5-2',
  title: '5주차 · 정규 표현식 고급 패턴 및 캡처 그룹',
  order: 26,
  category: 'advanced',
  content: {
    mission:
      '사용자가 입력한 10자리 또는 11자리의 숫자로 구성된 전화번호를 하이픈(-)이 삽입된 형식인 `010-XXXX-XXXX` 형태로 치환하는 `formatPhoneNumber(phone: string): string` 함수를 작성하세요. 캡처 그룹($1, $2, $3 등)과 `.replace()` 메서드를 반드시 활용하세요.',
    theory: `
      **캡처 그룹(Capture Group)**은 정규 표현식에서 괄호 \`()\`를 사용하여 특정 부분 문자열을 그룹화하고 기억하는 기능입니다.

      ## 1. 캡처 그룹의 활용
      예를 들어, 연-월-일 (\`YYYY-MM-DD\`) 형식을 매칭할 때 각 부분을 괄호로 감싸 캡처 그룹으로 만들 수 있습니다.
      \`\`\`ts
      const dateRegex = /(\\d{4})-(\\d{2})-(\\d{2})/;
      \`\`\`
      매칭된 정규식 그룹들은 순서대로 \`$1\`, \`$2\`, \`$3\` 등으로 참조할 수 있습니다.

      ## 2. 문자열 치환과 캡처 그룹
      JavaScript의 \`replace\` 메서드를 정규식과 연동하여 특정 그룹의 레이아웃을 교체할 수 있습니다.
      \`\`\`ts
      // 예시: "2026-07-20" -> "07/20/2026" (미국식 날짜 표기)
      const formatted = "2026-07-20".replace(/(\\d{4})-(\\d{2})-(\\d{2})/, "$2/$3/$1");
      \`\`\`

      ## 3. 전화번호 예시 패턴 설계
      - 패턴: \`^(010)(\\d{3,4})(\\d{4})$\`
      - 첫 번째 그룹 (\`010\`), 두 번째 그룹 (\`3~4자리 숫자\`), 세 번째 그룹 (\`4자리 숫자\`)
      - 치환 결과: \`$1-$2-$3\`
    `,
    objectives: [
      '괄호 ()를 사용하여 3개의 전화번호 구역을 캡처 그룹으로 설정할 것',
      '문자열 replace() 메서드에 정규식과 그룹 지시어($1-$2-$3)를 사용하여 하이픈을 추가할 것'
    ],
    exercise: "1. `validatePhone` 함수 내부에 010으로 시작하고 중간 4자리, 끝 4자리 숫자가 하이픈(-)으로 연결되는 핸드폰 정규식을 선언하세요.\n2. `phoneRegex.test(phone)` 의 검증 결과를 리턴하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function formatPhoneNumber(phone: string): string {
  // 숫자만 들어있는 전화번호를 010-XXXX-XXXX 형식으로 변환하세요.
  const regex = /^(010)(\\d{3,4})(\\d{4})$/;
  return phone;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.replace(',
        message: 'replace() 메서드를 사용하여 치환해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\$[123]/,
        message: '캡처 그룹 참조($1, $2, $3 등)를 치환 템플릿에 사용해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`phone.replace(regex, "$1-$2-$3")` 와 같은 형태로 호출해 보세요.'
    },
    {
      level: 2,
      content: '정규식 리터럴에는 앞뒤에 `/`가 필요하며, 캡처 그룹 지정을 위해 숫자가 들어갈 부분을 `(\\d{3,4})`와 `(\\d{4})`로 감싸야 합니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function validatePhone(phone: string): boolean {
  const phoneRegex = /^010-\\d{4}-\\d{4}$/;
  return phoneRegex.test(phone);
}`
    }
  ]
}