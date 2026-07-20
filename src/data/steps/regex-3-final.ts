import type { CurriculumStep } from '@/types/curriculum'

export const regex_3_final: CurriculumStep = {
  id: 'regex-3-final',
  title: '정규식 고급 종합 · 마크다운 → HTML 변환기',
  order: 217,
  category: 'advanced',
  content: {
    mission:
      '간단한 마크다운 문법을 HTML로 변환하는 `markdownToHtml(markdown: string): string` 함수를 작성하세요.\n\n**변환 규칙:**\n- `# 제목` → `<h1>제목</h1>` (##은 h2, ###은 h3)\n- `**텍스트**` → `<strong>텍스트</strong>`\n- `*텍스트*` → `<em>텍스트</em>` (**는 제외)\n- `[텍스트](URL)` → `<a href="URL">텍스트</a>`\n- `` `코드` `` → `<code>코드</code>`',
    theory: `
## 고급 종합: 정규식 체이닝으로 마크다운 → HTML 변환

### ① 헤딩 변환 — 수량자와 캡처 그룹

\`\`\`ts
// h1~h6 처리: # 개수를 캡처하여 레벨 결정
markdown
  .replace(/^(#{1,6}) (.+)$/gm, (_, hashes, content) => {
    const level = hashes.length;
    return \`<h\${level}>\${content}</h\${level}>\`;
  });

// 예시
'# Hello'.replace(/^(#{1,6}) (.+)$/gm, (_, h, c) => \`<h\${h.length}>\${c}</h\${h.length}>\`);
// '<h1>Hello</h1>'
\`\`\`

### ② 볼드(**) 와 이탤릭(*) — 순서가 중요

**를 먼저 처리하지 않으면 * 패턴이 **의 첫 번째 *를 이탤릭으로 잘못 변환합니다.

\`\`\`ts
// 1. 볼드 먼저 (**텍스트**)
.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')

// 2. 이탤릭 나중에 (볼드가 아닌 단일 *)
// 긍정 뒤/앞 탐색으로 ** 제외
.replace(/(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)/g, '<em>$1</em>')

// 또는 더 단순하게: ** 치환 완료 후 남은 * 처리
// (순서를 지키면 이중 ** 는 이미 없음)
\`\`\`

### ③ 링크와 코드 — 비탐욕 매칭 활용

\`\`\`ts
// 링크: [텍스트](URL)
.replace(/\\[(.+?)\\]\\(([^)]+)\\)/g, '<a href="$2">$1</a>')

// 인라인 코드: \`코드\`
.replace(/\`([^\`]+)\`/g, '<code>$1</code>')
\`\`\`

### ④ 처리 순서의 중요성

\`\`\`ts
// 잘못된 순서: 이탤릭을 먼저 처리하면 **text**의 바깥 * 가 이탤릭으로 잡힘
'**hello**'
  .replace(/\\*(.+?)\\*/g, '<em>$1</em>')   // 잘못: '<em>*hello*</em>'
  .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');  // 이미 오염

// 올바른 순서: 볼드 먼저
'**hello**'
  .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')  // '<strong>hello</strong>'
  .replace(/\\*(.+?)\\*/g, '<em>$1</em>');  // 남은 * 처리 (없음)
\`\`\`

### ⑤ m 플래그와 줄 단위 처리

\`\`\`ts
// 헤딩은 줄 시작(^)이 필요 — m 플래그로 각 줄의 시작을 인식
const md = '# Title\\nsome text\\n## Section';
md.replace(/^(#{1,6}) (.+)$/gm, (_, h, c) => \`<h\${h.length}>\${c}</h\${h.length}>\`);
// '<h1>Title</h1>\\nsome text\\n<h2>Section</h2>'
\`\`\`

### ⑥ 정규식 체이닝으로 변환 파이프라인 구성

\`\`\`ts
function markdownToHtml(md: string): string {
  return md
    .replace(/* 헤딩 */)
    .replace(/* 볼드 */)
    .replace(/* 이탤릭 */)
    .replace(/* 링크 */)
    .replace(/* 코드 */);
}
// 각 replace()가 이전 변환 결과를 받아 처리 — 파이프라인
\`\`\`
    `,
    objectives: [
      '헤딩 변환 시 `#` 개수를 캡처하여 h1~h3 레벨을 동적으로 생성할 것',
      '볼드(`**`)를 이탤릭(`*`) 보다 먼저 처리하여 패턴 충돌을 방지할 것',
      '링크, 인라인 코드, 볼드, 이탤릭 등 5가지 패턴을 메서드 체이닝으로 순차 적용할 것'
    ],
    exercise: `
1. 헤딩 변환: \`/^(#{1,3}) (.+)$/gm\` 패턴으로 h1~h3을 변환하세요. 콜백 함수를 사용해 \`#\`의 개수로 h 레벨을 동적 결정하세요.
2. 인라인 코드 변환: \`코드\` → \`<code>코드</code>\`
3. 볼드 변환: \`**텍스트**\` → \`<strong>텍스트</strong>\` (이탤릭보다 먼저!)
4. 이탤릭 변환: \`*텍스트*\` → \`<em>텍스트</em>\`
5. 링크 변환: \`[텍스트](URL)\` → \`<a href="URL">텍스트</a>\`
6. 위 변환을 올바른 순서로 체이닝하여 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function markdownToHtml(markdown: string): string {
  return markdown
    // 1. 헤딩 (# 개수로 h1~h3 결정) — 콜백 함수 사용
    .replace(/^(#{1,3}) (.+)$/gm, (_, hashes, content) => {
      return \`<h\${hashes.length}>\${content}</h\${hashes.length}>\`;
    })
    // 2. 인라인 코드 (\`코드\`) — 다른 패턴보다 먼저 처리
    // TODO: 완성하세요.
    // 3. 볼드 (**텍스트**) — 이탤릭보다 먼저!
    // TODO: 완성하세요.
    // 4. 이탤릭 (*텍스트*)
    // TODO: 완성하세요.
    // 5. 링크 ([텍스트](URL))
    // TODO: 완성하세요.
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /<strong>/,
        message: '볼드 **텍스트**를 <strong> 태그로 변환해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /<em>/,
        message: '이탤릭 *텍스트*를 <em> 태그로 변환해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /<a href/,
        message: '링크를 <a href="URL"> 태그로 변환해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /<code>/,
        message: '인라인 코드를 <code> 태그로 변환해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '인라인 코드: `.replace(/\\`([^\\`]+)\\`/g, \'<code>$1</code>\')`\n볼드: `.replace(/\\*\\*(.+?)\\*\\*/g, \'<strong>$1</strong>\')`'
    },
    {
      level: 2,
      content: '이탤릭: `.replace(/\\*(.+?)\\*/g, \'<em>$1</em>\')` — 볼드 변환 후 체이닝하면 남은 단일 `*`만 처리됩니다.\n링크: `.replace(/\\[(.+?)\\]\\(([^)]+)\\)/g, \'<a href="$2">$1</a>\')`'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^(#{1,3}) (.+)$/gm, (_, hashes, content) =>
      \`<h\${hashes.length}>\${content}</h\${hashes.length}>\`
    )
    .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
    .replace(/\\[(.+?)\\]\\(([^)]+)\\)/g, '<a href="$2">$1</a>');
}`
    }
  ]
}
