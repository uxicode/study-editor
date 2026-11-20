import type { CurriculumStep } from '@/types/curriculum'
import { codeNote } from './interview-shared'

export const week_10_4: CurriculumStep = {
  id: 'week-10-4',
  title: '면접 1주차 · 남의 코드 디버깅 — 예약 시간대 병합 버그',
  order: 304,
  category: 'advanced',
  content: {
    mission: '이미 작성된 버그 있는 코드를 받아, 재현 → 원인 → 수정 → 재발 방지 순서로 디버깅 과정을 설명하며 고칩니다.',
    theory: `
## 디버깅 면접은 "추리 과정"을 봅니다

실무 면접에서는 새 코드를 짜는 것만큼 **남이 짠 코드의 버그를 찾는 문제**가 자주 나옵니다.
면접관이 듣고 싶은 것은 "여기 고치면 돼요" 가 아니라 아래 순서입니다.

1. **재현** — 버그를 일으키는 가장 작은 입력을 찾는다.
2. **가설** — "정렬이 안 돼서 그런 것 같습니다" 처럼 원인 후보를 말한다.
3. **확인** — 가설이 맞는지 입력을 바꿔 가며 확인한다.
4. **수정** — 원인을 고친다. 증상만 가리는 수정(if 로 특정 값만 예외 처리)은 피한다.
5. **재발 방지** — 같은 버그가 다시 생기지 않도록 테스트 케이스나 규칙을 남긴다.

## 증상 vs 원인

| 증상 | 증상만 가리는 수정 | 원인 수정 |
|---|---|---|
| 겹친 예약이 안 합쳐짐 | 특정 입력만 예외 처리 | 시작 시각으로 먼저 정렬 |
| 큰 예약이 잘려 나감 | 끝 시각을 수동 보정 | \`Math.max\` 로 끝 시각 비교 |

## 경계 조건은 "요구사항"입니다

10:00~11:00 과 11:00~12:00 은 겹칠까요? 서비스마다 다릅니다. 회의실 예약이라면 **맞닿아도 합치는** 것이 자연스럽습니다.
이런 판단은 혼자 정하지 말고 확인 질문으로 남기세요.
    `,
    objectives: [
      '버그를 재현하는 가장 작은 입력을 찾는다',
      '증상이 아니라 원인을 고친다 (정렬, 경계 비교, 끝 시각 계산)',
      '재발 방지 방법을 설명한다'
    ],
    exercise: `
**상황**
회의실 예약 화면의 "사용 중인 시간" 막대가 가끔 잘못 그려진다는 문의가 들어왔습니다. 전임자가 남긴 \`mergeTimeRanges\` 함수가 원인으로 의심됩니다. 시간은 자정부터의 분(예: 600 = 10:00)입니다.

**요구사항** (\`mergeTimeRanges(ranges: TimeRange[])\`)
1. 겹치거나 **맞닿은** 예약(\`end\` 와 다음 \`start\` 가 같음)은 하나로 합칩니다.
2. 입력은 정렬되어 있지 않을 수 있습니다. 결과는 시작 시각 순입니다.
3. 다른 예약을 완전히 포함하는 예약이 있어도 끝 시각이 줄어들면 안 됩니다.
4. 입력 배열의 객체를 직접 수정하지 마세요. (화면의 다른 곳에서 원본을 씁니다)

**생각해 보기** (\`//\` 주석으로 작성)
- \`// 재현 입력:\` 버그를 일으키는 가장 작은 입력
- \`// 원인:\` 버그가 생긴 이유 (여러 개면 모두)
- \`// 재발 방지:\` 같은 버그가 다시 생기지 않게 하려면
    `.trim(),
    expectedOutput: '예약 시간대 병합 버그 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      language: 'typescript',
      content: `// 재현 입력:
// 원인:
// 재발 방지:
export interface TimeRange {
  start: number;
  end: number;
}

// 전임자가 남긴 코드입니다. 버그를 찾아 고치세요.
export function mergeTimeRanges(ranges: TimeRange[]): TimeRange[] {
  const result: TimeRange[] = [];
  for (const range of ranges) {
    const last = result[result.length - 1];
    if (last && range.start < last.end) {
      last.end = range.end;
    } else {
      result.push(range);
    }
  }
  return result;
}
`
    }
  ],
  validator: {
    staticChecks: [
      codeNote('index.ts', '재현 입력', '버그를 일으키는 가장 작은 입력을 // 재현 입력: 주석으로 적어야 합니다.'),
      codeNote('index.ts', '원인', '버그의 원인을 // 원인: 주석으로 적어야 합니다.'),
      codeNote('index.ts', '재발 방지', '재발 방지 방법을 // 재발 방지: 주석으로 적어야 합니다.')
    ],
    dynamicChecks: [],
    functionTests: [
      {
        target: 'index.ts',
        functionName: 'mergeTimeRanges',
        cases: [
          {
            description: '정렬된 겹친 예약',
            args: [[{ start: 540, end: 600 }, { start: 570, end: 660 }]],
            expected: [{ start: 540, end: 660 }]
          },
          {
            description: '정렬되지 않은 입력',
            args: [[{ start: 700, end: 720 }, { start: 540, end: 600 }, { start: 590, end: 610 }]],
            expected: [{ start: 540, end: 610 }, { start: 700, end: 720 }]
          },
          {
            description: '맞닿은 예약은 합침',
            args: [[{ start: 600, end: 660 }, { start: 660, end: 720 }]],
            expected: [{ start: 600, end: 720 }]
          },
          {
            description: '포함된 예약 때문에 끝 시각이 줄지 않음',
            args: [[{ start: 540, end: 720 }, { start: 600, end: 630 }]],
            expected: [{ start: 540, end: 720 }]
          },
          {
            description: '빈 입력',
            args: [[]],
            expected: []
          }
        ]
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '버그는 세 군데입니다. ① 합치기 전에 정렬하지 않음 ② 맞닿은 경우(`<`)를 놓침 ③ 끝 시각을 무조건 덮어씀. 원본을 지키려면 정렬은 복사본에, push 는 새 객체로 하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- // 재현 입력:, // 원인:, // 재발 방지: 주석
- mergeTimeRanges 함수 테스트 5개 (겹침, 미정렬, 맞닿음, 포함, 빈 입력)`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 재현 입력: [{ start: 540, end: 720 }, { start: 600, end: 630 }] → 끝 시각이 630 으로 줄어듭니다.
// 원인: ① 정렬하지 않고 앞에서부터 합침 ② 맞닿은 경우를 < 로 비교해 놓침 ③ last.end 를 Math.max 없이 덮어씀 (+ 입력 객체를 직접 수정)
// 재발 방지: 미정렬·맞닿음·포함 입력을 테스트 케이스로 고정하고, 입력 배열은 복사해서 다룬다는 규칙을 남깁니다.
export interface TimeRange {
  start: number;
  end: number;
}

export function mergeTimeRanges(ranges: TimeRange[]): TimeRange[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const result: TimeRange[] = [];

  for (const range of sorted) {
    const last = result[result.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      result.push({ start: range.start, end: range.end });
    }
  }

  return result;
}
`
    }
  ]
}
