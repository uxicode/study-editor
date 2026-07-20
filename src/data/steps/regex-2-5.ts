import type { CurriculumStep } from '@/types/curriculum'

export const regex_2_5: CurriculumStep = {
  id: 'regex-2-5',
  title: '정규식 중급 · 실전 데이터 추출 (해시태그, 멘션, 이모지)',
  order: 210,
  category: 'advanced',
  content: {
    mission:
      'SNS 게시물 텍스트를 분석하는 `parsePostContent(text: string): { hashtags: string[]; mentions: string[]; plainText: string }` 함수를 작성하세요.\n\n- `hashtags`: `#태그` 형식으로 시작하는 모든 해시태그 (# 포함)\n- `mentions`: `@사용자명` 형식의 멘션 (@ 포함)\n- `plainText`: 해시태그와 멘션을 제거한 순수 텍스트 (앞뒤 공백 제거)',
    theory: `
## 실전 데이터 추출 패턴

### ① 해시태그 패턴

\`\`\`ts
// 해시태그: # 뒤에 영문/숫자/한글/언더바가 1자 이상
const hashtagRegex = /#[\\w가-힣]+/g;

const text = '오늘 #여행 다녀왔어요 #제주도 #맛집 amazing!';
text.match(hashtagRegex);  // ['#여행', '#제주도', '#맛집']

// 한글이 포함되지 않는 경우 (영문/숫자/_ 만)
const engHashtag = /#\\w+/g;
'#hello #world_123'.match(engHashtag);  // ['#hello', '#world_123']
\`\`\`

### ② 멘션(@사용자) 패턴

\`\`\`ts
// 멘션: @ 뒤에 영문/숫자/언더바/점이 1자 이상
const mentionRegex = /@[\\w.]+/g;

'안녕 @alice 잘 지내? @bob.smith 요즘 뭐해요?'.match(mentionRegex);
// ['@alice', '@bob.smith']
\`\`\`

### ③ 패턴 조합으로 여러 정보 한꺼번에 추출

\`\`\`ts
// 해시태그 또는 멘션을 하나의 패턴으로
const tagOrMention = /(?:#|@)[\\w가-힣]+/g;
'@user1 #coding #js @user2'.match(tagOrMention);
// ['@user1', '#coding', '#js', '@user2']
\`\`\`

### ④ 특정 패턴 제거 (replace)

\`\`\`ts
const withTags = 'Hello @alice #world check this out #js';

// 해시태그 제거
withTags.replace(/#\\w+/g, '');
// 'Hello @alice  check this out '

// 멘션 제거
withTags.replace(/@\\w+/g, '');
// 'Hello  #world check this out #js'

// 해시태그와 멘션 모두 제거 후 여러 공백 정리
withTags
  .replace(/#\\w+/g, '')
  .replace(/@\\w+/g, '')
  .replace(/\\s+/g, ' ')
  .trim();
// 'Hello check this out'
\`\`\`

### ⑤ 중복 제거와 정렬

\`\`\`ts
const tags = '#js #react #js #vue #react'.match(/#\\w+/g) || [];
const uniqueTags = [...new Set(tags)].sort();
// ['#js', '#react', '#vue']
\`\`\`

### ⑥ 이모지 및 특수 유니코드 처리

\`\`\`ts
// 이모지 감지 (간단한 방법)
const emojiRegex = /[\\u{1F300}-\\u{1FAFF}]/gu;  // u 플래그 필요

'Hello 🌍 World 🚀'.match(emojiRegex);  // ['🌍', '🚀']

// 이모지 제거
'Nice day! 😊 Let\\'s go 🏃'.replace(emojiRegex, '').trim();
// 'Nice day! Let\\'s go'
\`\`\`
    `,
    objectives: [
      '`#[\\\\w가-힣]+` 패턴으로 한글/영문 해시태그를 추출할 것',
      '`@[\\\\w.]+` 패턴으로 멘션을 추출할 것',
      '`replace()`로 해시태그와 멘션을 제거하고, 다중 공백을 정리한 후 `trim()`으로 반환할 것'
    ],
    exercise: `
1. 해시태그 정규식(\`/#[\\\\w가-힣]+/g\`)으로 모든 해시태그를 추출하세요.
2. 멘션 정규식(\`/@[\\\\w.]+/g\`)으로 모든 멘션을 추출하세요.
3. 원본 텍스트에서 해시태그와 멘션을 제거하고, 연속된 공백을 단일 공백으로 변환한 후 \`trim()\`으로 앞뒤 공백을 제거하여 \`plainText\`를 만드세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export interface PostAnalysis {
  hashtags: string[];
  mentions: string[];
  plainText: string;
}

export function parsePostContent(text: string): PostAnalysis {
  // 해시태그 추출
  const hashtagRegex = /#[\\w가-힣]+/g;
  const hashtags = text.match(hashtagRegex) || [];

  // 멘션 추출
  // TODO: 멘션 추출 로직을 추가하세요.
  const mentions: string[] = [];

  // 해시태그와 멘션을 제거한 순수 텍스트 추출
  // TODO: plainText를 만드세요.
  const plainText = text;

  return { hashtags, mentions, plainText };
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /@\[\\w/,
        message: '@로 시작하는 멘션 패턴을 정규식으로 추출해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.replace(',
        message: 'replace()를 사용하여 해시태그와 멘션을 제거해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.trim()',
        message: 'trim()으로 앞뒤 공백을 제거해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '멘션은 `text.match(/@[\\w.]+/g) || []`로 추출하세요. `||  []`는 매칭 결과가 없을 때(null) 빈 배열을 보장합니다.'
    },
    {
      level: 2,
      content: '`plainText`는 원본 텍스트에서 해시태그와 멘션을 순서대로 제거하세요: `text.replace(/#[\\w가-힣]+/g, \'\').replace(/@[\\w.]+/g, \'\').replace(/\\s+/g, \' \').trim()`'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function parsePostContent(text: string): PostAnalysis {
  const hashtags = text.match(/#[\\w가-힣]+/g) || [];
  const mentions = text.match(/@[\\w.]+/g) || [];
  const plainText = text
    .replace(/#[\\w가-힣]+/g, '')
    .replace(/@[\\w.]+/g, '')
    .replace(/\\s+/g, ' ')
    .trim();
  return { hashtags, mentions, plainText };
}`
    }
  ]
}
