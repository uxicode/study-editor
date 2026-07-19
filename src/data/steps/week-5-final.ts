import type { CurriculumStep } from '@/types/curriculum'

export const week_5_final: CurriculumStep = {
  id: 'week-5-final',
  title: '5주차 종합 · 웹 서버 로그 분석기 (Regex + Data Parsing)',
  order: 30,
  category: 'advanced',
  content: {
    mission:
      '원시 Nginx 웹 서버 로그 행들이 들어있는 문자열 배열 `logs`가 매개변수로 주어집니다. 각 로그 줄을 정규 표현식으로 파싱하여 IP 주소, 요청 경로, 응답 상태코드를 추출한 뒤, 상태코드별(예: 200, 404, 500) 발생 횟수를 집계하여 반환하는 `parseAndCountStatus(logs: string[]): Record<string, number>` 함수를 작성하세요.\n\n로그 템플릿 예시:\n`127.0.0.1 - - [20/Jul/2026:01:29:17 +0900] "GET /api/users HTTP/1.1" 200 4566`\n\n- 상태코드 위치: 요청 구절 바로 다음 숫자 (예: 위의 예시에서는 `200`)',
    theory: `
      ## 5주차 종합: 웹 서버 로그 분석기 구축

      그동안 배운 정규식 그룹 캡처 기법과 배열/객체 고차 함수를 총동원하여 서버 데이터를 집계해봅니다.

      ### 1. 로그 매칭 정규식 예제
      간단한 웹 로그 라인은 띄어쓰기로 분절하거나 특정 문자를 타겟팅하는 정규 표현식으로 각 항목을 분리해 낼 수 있습니다.
      \`\`\`ts
      // 간단한 로그 파싱용 정규식
      // IP: $1, HTTP Method: $2, Path: $3, Status: $4
      const logRegex = /^(\\S+) - - \\[.*?\\] "\\S+ (\\S+) \\S+" (\\d{3})/;
      \`\`\`

      ### 2. 집계 로직 (Reduce / Objects)
      추출한 상태코드 정보를 누적 객체에 기록하여 횟수를 카운팅합니다:
      \`\`\`ts
      const countMap: Record<string, number> = {};
      // 순회하며 카운트 증가
      countMap[status] = (countMap[status] || 0) + 1;
      \`\`\`
    `,
    objectives: [
      '정규식을 사용하여 로그 문자열에서 응답 상태코드(3자리 숫자)를 추출할 것',
      '각 로그를 순회(forEach 또는 reduce 등)하며 상태코드의 카운트를 누적할 것',
      '최종적으로 { "200": 10, "404": 2 } 형태의 누계 객체를 반환할 것'
    ],
    exercise: "1. `maskUserEmails` 함수 내부에서 일반 유저(`user.role === 'USER'`)만 필터링하세요.\n2. 필터링된 유저들에 대해 이메일 아이디의 앞 3글자를 제외한 나머지를 `*` 기호로 마스킹 처리하여 리턴하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function parseAndCountStatus(logs: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  // 정규 표현식을 사용하여 상태 코드를 추출하고 누적하세요.
  const regex = /" (\\d{3}) /;
  
  logs.forEach(log => {
    const match = log.match(regex);
    if (match) {
      const status = match[1];
      counts[status] = (counts[status] || 0) + 1;
    }
  });
  
  return counts;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.match(',
        message: 'string.match() 메서드를 사용하여 상태 코드를 추출해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /counts\[\w+\]\s*=/,
        message: '집계한 카운트를 객체 속성에 누적해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`log.match(regex)`를 통해 반환받은 결과 배열에서 인덱스 1번(`match[1]`)이 캡처 그룹인 상태 코드가 됩니다.'
    },
    {
      level: 2,
      content: '추출한 상태 코드가 `counts` 객체에 존재하지 않는 경우 기본값을 0으로 둔 후 1을 더해 할당하는 패턴(`counts[status] = (counts[status] || 0) + 1`)을 사용하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function maskUserEmails(users: any[]): any[] {
  const emailRegex = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$/;
  return users
    .filter(user => user.role === 'USER')
    .map(user => {
      const match = user.email.match(emailRegex);
      if (!match) return { id: user.id, email: user.email };
      const account = match[1];
      const domain = match[2];
      const maskedAccount = account.substring(0, 3) + '*'.repeat(Math.max(0, account.length - 3));
      return {
        id: user.id,
        email: \`\${maskedAccount}@\${domain}\`
      };
    });
}`
    }
  ]
}