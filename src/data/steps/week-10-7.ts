import type { CurriculumStep } from '@/types/curriculum'
import { codeNote } from './interview-shared'

export const week_10_7: CurriculumStep = {
  id: 'week-10-7',
  title: '면접 1주차 · 규모가 1,000배가 되면 — 트래픽 어림 계산',
  order: 318,
  category: 'advanced',
  content: {
    mission: '"하루 1만 건이 1,000만 건이 되면?"이라는 질문에, 초당 요청 수와 저장량으로 바꿔 계산하고 무엇이 먼저 깨질지 판단합니다.',
    theory: `
## 면접 질문: "입력이 하루 1만 건에서 1,000만 건으로 늘면 무엇이 먼저 깨질까요?"

**평가 의도**: 병목을 예측하는 능력과 대략적인 숫자 감각

## 하루 단위를 초 단위로 바꾸기

하루는 **86,400초**, 어림으로는 **약 10만 초**입니다.

| 하루 요청 수 | 평균 초당 요청 수 | 피크 (평균 × 5) |
|---|---|---|
| 1만 | 약 0.1 | 약 0.6 |
| 100만 | 약 12 | 약 58 |
| 1,000만 | 약 116 | 약 579 |

트래픽은 하루 내내 고르지 않으므로 **피크 배수**(보통 3 ~ 10배)를 곱해서 생각합니다.

## 숫자 다음에 말할 것

> "피크 기준 초당 약 580건입니다. 이 정도면 웹 서버보다 **DB 쓰기**와 **외부 API 호출 한도**가 먼저 문제입니다.
> 모든 것을 미리 대비하기보다, 가장 먼저 무너질 곳만 대비하겠습니다."

## 면접관이 보는 신호

| 좋은 신호 (+) | 위험 신호 (−) |
|---|---|
| 숫자로 바꿔서 판단한다 | "마이크로서비스와 쿠버네티스"처럼 정답처럼 들리는 기술을 나열한다 |
| 먼저 깨질 곳의 순서를 정한다 | 모든 것을 한 번에 바꾸려 한다 |
| 과설계를 경계한다 | 숫자 없이 "엄청 많다"고 말한다 |

**꼬리 질문**: "예산이 거의 없다면 가장 먼저 무엇을 하시겠어요?"
    `,
    objectives: [
      '하루 건수를 평균·피크 초당 요청 수로 바꾼다',
      '하루 저장량을 GB 단위로 어림한다',
      '가장 먼저 깨질 곳과 지금은 하지 않을 일을 설명한다'
    ],
    exercise: `
**상황**
사용자 행동 로그(클릭, 페이지 조회)를 저장하는 API 가 있습니다. 지금은 하루 1만 건인데, 마케팅 캠페인 뒤 하루 1,000만 건까지 늘 수 있다고 합니다. 면접관이 "대략 어느 정도 부하인지 계산해 보고, 무엇이 먼저 깨질지 말해 주세요"라고 합니다.

**요구사항** (\`estimateCapacity(dailyEvents: number, peakFactor: number, bytesPerEvent: number)\`)
1. 반환값은 \`{ averagePerSecond, peakPerSecond, storagePerDayGb }\` 이며 **이 순서로** 키를 만듭니다.
2. \`averagePerSecond\` = 하루 건수 ÷ 86,400 을 **반올림한 정수**
3. \`peakPerSecond\` = (하루 건수 ÷ 86,400 × 피크 배수) 를 **반올림한 정수** (반올림한 평균에 곱하지 않습니다)
4. \`storagePerDayGb\` = 하루 건수 × 건당 바이트 ÷ 1,000,000,000 을 **소수 첫째 자리까지 반올림**
5. 세 입력 중 하나라도 0 이하이면 모두 0 을 반환합니다.

**생각해 보기** (\`//\` 주석으로 작성)
- \`// 가장 먼저 깨질 곳:\` 계산한 숫자를 근거로, 이 API 에서 가장 먼저 문제가 될 곳
- \`// 지금 하지 않을 것:\` 과설계라서 지금은 미룰 일
    `.trim(),
    expectedOutput: '트래픽 어림 계산 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      language: 'typescript',
      content: `// 가장 먼저 깨질 곳:
// 지금 하지 않을 것:
export interface Capacity {
  averagePerSecond: number;
  peakPerSecond: number;
  storagePerDayGb: number;
}

export function estimateCapacity(dailyEvents: number, peakFactor: number, bytesPerEvent: number): Capacity {
  // 요구사항에 맞게 계산해 반환하세요.
  return { averagePerSecond: 0, peakPerSecond: 0, storagePerDayGb: 0 };
}
`
    }
  ],
  validator: {
    staticChecks: [
      codeNote('index.ts', '가장 먼저 깨질 곳', '계산한 숫자를 근거로 가장 먼저 문제가 될 곳을 // 가장 먼저 깨질 곳: 주석으로 적어야 합니다.'),
      codeNote('index.ts', '지금 하지 않을 것', '과설계라서 미룰 일을 // 지금 하지 않을 것: 주석으로 적어야 합니다.')
    ],
    dynamicChecks: [],
    functionTests: [
      {
        target: 'index.ts',
        functionName: 'estimateCapacity',
        cases: [
          {
            description: '하루 1,000만 건, 피크 5배, 건당 2KB',
            args: [10_000_000, 5, 2_000],
            expected: { averagePerSecond: 116, peakPerSecond: 579, storagePerDayGb: 20 }
          },
          {
            description: '지금 규모: 하루 1만 건',
            args: [10_000, 5, 2_000],
            expected: { averagePerSecond: 0, peakPerSecond: 1, storagePerDayGb: 0 }
          },
          {
            description: '나누어떨어지는 규모, 소수 첫째 자리 저장량',
            args: [86_400_000, 3, 500],
            expected: { averagePerSecond: 1000, peakPerSecond: 3000, storagePerDayGb: 43.2 }
          },
          {
            description: '0 이하 입력은 모두 0',
            args: [10_000_000, 0, 2_000],
            expected: { averagePerSecond: 0, peakPerSecond: 0, storagePerDayGb: 0 }
          }
        ]
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '평균 초당 건수를 반올림하기 전 값(`perSecond`)으로 먼저 구해 두고, 평균·피크 둘 다 그 값에서 반올림하세요. 소수 첫째 자리 반올림은 `Math.round(x * 10) / 10` 입니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- // 가장 먼저 깨질 곳:, // 지금 하지 않을 것: 주석
- estimateCapacity 함수 테스트 4개 (1,000만 건, 1만 건, 나누어떨어지는 규모, 0 이하 입력)`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 가장 먼저 깨질 곳: 피크 초당 약 580건의 단건 INSERT 라 DB 쓰기가 먼저 밀립니다. 하루 20GB 씩 쌓이므로 디스크와 인덱스 크기도 한 달 안에 문제가 됩니다.
// 지금 하지 않을 것: 서비스 분리나 메시지 큐 클러스터 도입은 미루고, 배치 INSERT 와 오래된 로그 보관 정책부터 적용합니다.
export interface Capacity {
  averagePerSecond: number;
  peakPerSecond: number;
  storagePerDayGb: number;
}

const SECONDS_PER_DAY = 86_400;
const BYTES_PER_GB = 1_000_000_000;

export function estimateCapacity(dailyEvents: number, peakFactor: number, bytesPerEvent: number): Capacity {
  if (dailyEvents <= 0 || peakFactor <= 0 || bytesPerEvent <= 0) {
    return { averagePerSecond: 0, peakPerSecond: 0, storagePerDayGb: 0 };
  }

  const perSecond = dailyEvents / SECONDS_PER_DAY;
  const storageGb = (dailyEvents * bytesPerEvent) / BYTES_PER_GB;

  return {
    averagePerSecond: Math.round(perSecond),
    peakPerSecond: Math.round(perSecond * peakFactor),
    storagePerDayGb: Math.round(storageGb * 10) / 10
  };
}
`
    }
  ]
}
