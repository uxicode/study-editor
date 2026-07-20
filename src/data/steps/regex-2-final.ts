import type { CurriculumStep } from '@/types/curriculum'

export const regex_2_final: CurriculumStep = {
  id: 'regex-2-final',
  title: '정규식 중급 종합 · 개인정보 마스킹 처리기',
  order: 211,
  category: 'advanced',
  content: {
    mission:
      '로그 문자열에서 이메일과 전화번호를 탐지하여 개인정보를 마스킹 처리하는 `maskPersonalInfo(log: string): string` 함수를 작성하세요.\n\n**마스킹 규칙:**\n- 이메일: `user@example.com` → `u***@example.com` (계정명 두 번째 문자부터 `@` 전까지 `*`로 치환)\n- 전화번호 (`010-XXXX-XXXX` 또는 `010XXXXXXXX`): 중간 번호를 `****`로 치환 → `010-****-5678`',
    theory: `
## 중급 종합: 개인정보 보호를 위한 마스킹

캡처 그룹, replace() 함수 콜백, 교대(|) 패턴을 종합 활용합니다.

### 이메일 마스킹 전략

\`\`\`ts
// 계정명의 첫 글자만 남기고 나머지를 *로 치환
// 캡처 그룹: (첫 글자)(나머지 계정명)(@도메인)
const emailMaskRegex = /([a-zA-Z0-9])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/g;

'contact user@example.com'.replace(emailMaskRegex, (match, first, domain) => {
  const accountLen = match.indexOf('@') - 1;  // 마스킹할 길이 계산
  return first + '*'.repeat(accountLen) + domain;
});
// 'contact u***@example.com'
\`\`\`

### 전화번호 마스킹 전략

\`\`\`ts
// 하이픈 있는 형식: 010-XXXX-XXXX
const phoneMaskHyphen = /(010)-\\d{4}-(\\d{4})/g;
'전화: 010-1234-5678'.replace(phoneMaskHyphen, '$1-****-$2');
// '전화: 010-****-5678'

// 하이픈 없는 형식: 010XXXXXXXX
const phoneMaskFlat = /(010)\\d{4}(\\d{4})/g;
'전화: 01012345678'.replace(phoneMaskFlat, '$1****$2');
// '전화: 010****5678'
\`\`\`

### replace() 콜백 함수 활용

캡처 그룹의 내용을 동적으로 가공해야 할 때 함수를 씁니다.

\`\`\`ts
const text = 'Hello admin@corp.co.kr and bob@test.com';
text.replace(
  /([a-zA-Z0-9])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/g,
  (fullMatch, firstChar, atDomain) => {
    const stars = '*'.repeat(fullMatch.indexOf('@') - 1);
    return firstChar + stars + atDomain;
  }
);
// 'Hello a****@corp.co.kr and b**@test.com'
\`\`\`

### 여러 패턴을 순차적으로 처리

\`\`\`ts
function maskAll(text: string): string {
  // 1단계: 이메일 마스킹
  let result = text.replace(emailRegex, emailMasker);
  // 2단계: 전화번호 마스킹 (하이픈 있는 형식)
  result = result.replace(phoneRegex1, '$1-****-$2');
  // 3단계: 전화번호 마스킹 (하이픈 없는 형식)
  result = result.replace(phoneRegex2, '$1****$2');
  return result;
}
\`\`\`

### 정규식 체이닝 패턴

\`\`\`ts
// 메서드 체이닝으로 가독성 있게 작성
const masked = logLine
  .replace(/이메일_패턴/g, 이메일_마스킹_함수)
  .replace(/전화_패턴1/g, '$1-****-$2')
  .replace(/전화_패턴2/g, '$1****$2');
\`\`\`
    `,
    objectives: [
      '이메일 패턴에서 계정명 첫 글자를 캡처 그룹으로 남기고 나머지를 `*`로 치환할 것',
      '전화번호 패턴(하이픈 있는/없는 두 형식)에서 중간 번호를 `****`로 치환할 것',
      '`replace()` 콜백 함수 또는 `$N` 역참조를 활용하여 마스킹을 구현할 것'
    ],
    exercise: `
1. 이메일 마스킹: 계정명에서 첫 글자만 남기는 정규식과 치환 로직을 작성하세요.
   - 패턴 예시: \`/([a-zA-Z0-9])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,})/g\`
   - \`replace()\` 콜백에서 \`'*'.repeat(count)\`로 별표를 동적 생성하세요.
2. 전화번호 마스킹: 하이픈 있는 형식과 없는 형식 모두 처리하세요.
   - 하이픈 있는 형식: \`/(010)-\\\\d{4}-(\\\\d{4})/g\` → \`'$1-****-$2'\`
3. 두 치환을 차례로 적용한 최종 문자열을 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function maskPersonalInfo(log: string): string {
  // 1단계: 이메일 마스킹 (계정명 두 번째 문자부터 * 처리)
  const emailRegex = /([a-zA-Z0-9])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/g;
  let result = log.replace(emailRegex, (match, firstChar, atDomain) => {
    // match.indexOf('@') - 1 = 마스킹할 문자 수
    const maskCount = match.indexOf('@') - 1;
    return firstChar + '*'.repeat(maskCount) + atDomain;
  });

  // 2단계: 전화번호 마스킹 - 하이픈 있는 형식
  // TODO: 010-XXXX-XXXX → 010-****-XXXX 로 치환하세요.

  // 3단계: 전화번호 마스킹 - 하이픈 없는 형식
  // TODO: 010XXXXXXXX → 010****XXXX 로 치환하세요.

  return result;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /010.*\*\*\*\*/,
        message: '전화번호 중간 번호를 ****로 마스킹해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\$1.*\$2|\$2.*\$1/,
        message: '캡처 그룹 역참조($1, $2)를 전화번호 치환에 활용해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '하이픈 있는 전화번호 마스킹: `result = result.replace(/(010)-\\d{4}-(\\d{4})/g, \'$1-****-$2\')`를 추가하세요. `$1`은 `010`, `$2`는 마지막 4자리입니다.'
    },
    {
      level: 2,
      content: '하이픈 없는 전화번호 마스킹: `result = result.replace(/(010)\\d{4}(\\d{4})/g, \'$1****$2\')`를 추가하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function maskPersonalInfo(log: string): string {
  const emailRegex = /([a-zA-Z0-9])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})/g;
  let result = log.replace(emailRegex, (match, firstChar, atDomain) => {
    const maskCount = match.indexOf('@') - 1;
    return firstChar + '*'.repeat(maskCount) + atDomain;
  });
  result = result.replace(/(010)-\\d{4}-(\\d{4})/g, '$1-****-$2');
  result = result.replace(/(010)\\d{4}(\\d{4})/g, '$1****$2');
  return result;
}`
    }
  ]
}
