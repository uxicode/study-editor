import type { FlowSpec } from '@/types/flow'

/** 소프트 엔지니어링 면접 대응(week-10 ~ week-12) 흐름 다이어그램 */

const SLOW_PAGE: FlowSpec = {
  title: '상품 목록 페이지 구간별 지연',
  nodes: [
    { id: 'browser', label: '모바일 브라우저', icon: '📱', x: 0, y: 1.3, tone: 'green' },
    { id: 'web', label: '웹 서버', icon: '🖥️', x: 2, y: 0, tone: 'gray' },
    { id: 'api', label: '상품 API', icon: '🚪', x: 2, y: 2.6, tone: 'blue' },
    { id: 'db', label: 'DB', icon: '🗄️', x: 4, y: 3.9, tone: 'teal' }
  ],
  edges: [
    { from: 'browser', to: 'web' },
    { from: 'browser', to: 'api' },
    { from: 'api', to: 'db' }
  ],
  stages: [
    {
      title: 'HTML',
      description: '첫 HTML 응답까지 180ms. 여기는 문제가 아닙니다.',
      packets: [
        { from: 'browser', to: 'web', kind: 'request', label: 'GET /shoes' },
        { from: 'web', to: 'browser', kind: 'response', label: '180ms' }
      ],
      dimmed: ['api', 'db'],
      metrics: [{ label: '누적', value: '180ms' }]
    },
    {
      title: 'JS 번들',
      description: 'JS 310KB 다운로드에 420ms. 줄일 수 있지만 가장 큰 구간은 아닙니다.',
      packets: [{ from: 'web', to: 'browser', kind: 'event', label: 'JS 420ms' }],
      dimmed: ['api', 'db'],
      metrics: [{ label: '누적', value: '600ms' }]
    },
    {
      title: '상품 API',
      description: 'API 가 **2,400ms** 로 전체의 절반 이상입니다. 그 안의 DB 쿼리가 1,700ms — category 컬럼에 인덱스가 없습니다.',
      packets: [
        { from: 'browser', to: 'api', kind: 'request', label: '?category=shoes' },
        { from: 'api', to: 'db', kind: 'request', label: '풀 스캔' },
        { from: 'db', to: 'api', kind: 'response', label: '1,700ms' },
        { from: 'api', to: 'browser', kind: 'response', label: '1.8MB' }
      ],
      failed: ['db'],
      badges: [{ node: 'db', text: '인덱스 없음', tone: 'danger' }],
      metrics: [{ label: '누적', value: '3,000ms', tone: 'danger' }]
    },
    {
      title: '이미지 · 렌더',
      description: '이미지 650ms, 렌더링 230ms 를 더해 첫 화면까지 약 **3.9초**입니다. 목표는 2초.',
      packets: [{ from: 'web', to: 'browser', kind: 'event', label: '이미지 8장' }],
      dimmed: ['api', 'db'],
      metrics: [
        { label: '누적', value: '~3,900ms', tone: 'danger' },
        { label: '목표', value: '2,000ms' }
      ]
    },
    {
      title: '가장 큰 구간부터',
      description: '인덱스 추가와 20개씩 페이지네이션만으로 API 구간이 크게 줄어 **목표 안**으로 들어옵니다.',
      packets: [
        { from: 'browser', to: 'api', kind: 'request', label: 'page=1' },
        { from: 'api', to: 'db', kind: 'request', label: '인덱스' },
        { from: 'db', to: 'api', kind: 'response', label: '20ms' },
        { from: 'api', to: 'browser', kind: 'response', label: '120KB' }
      ],
      active: ['db', 'api'],
      badges: [{ node: 'db', text: 'category 인덱스', tone: 'good' }],
      metrics: [{ label: '누적', value: '~1,600ms', tone: 'good' }]
    }
  ]
}

const WEBHOOK_CLOCK: FlowSpec = {
  title: '서버 3대 중 1대에서만 나는 웹훅 실패',
  nodes: [
    { id: 'pg', label: '결제사', icon: '💳', x: 0, y: 3.9, tone: 'gray' },
    { id: 'lb', label: '로드 밸런서', icon: '🔀', x: 2, y: 2.6, tone: 'purple' },
    { id: 'w1', label: 'web-1', icon: '🖥️', x: 4, y: 1.3, tone: 'blue' },
    { id: 'w2', label: 'web-2', icon: '🖥️', x: 4, y: 3.9, tone: 'blue' },
    { id: 'w3', label: 'web-3', icon: '🖥️', x: 2, y: 5.2, tone: 'blue' }
  ],
  edges: [
    { from: 'pg', to: 'lb' },
    { from: 'lb', to: 'w1' },
    { from: 'lb', to: 'w2' },
    { from: 'lb', to: 'w3' }
  ],
  stages: [
    {
      title: '정상 처리',
      description: '웹훅의 타임스탬프와 서버 시각 차이가 ±300초 안이면 서명이 유효합니다.',
      packets: [
        { from: 'pg', to: 'lb', kind: 'event', label: '웹훅' },
        { from: 'lb', to: 'w1', kind: 'event' },
        { from: 'w1', to: 'lb', kind: 'response', label: '200' }
      ],
      active: ['w1'],
      metrics: [{ label: 'ts_diff', value: '2s', tone: 'good' }]
    },
    {
      title: 'web-3 로 가면',
      description: 'web-3 에서는 시각 차이가 -312초로 허용 범위를 **살짝** 넘어 서명 검증이 실패합니다.',
      packets: [
        { from: 'pg', to: 'lb', kind: 'event', label: '웹훅' },
        { from: 'lb', to: 'w3', kind: 'event' },
        { from: 'w3', to: 'lb', kind: 'error', label: '401' }
      ],
      failed: ['w3'],
      badges: [{ node: 'w3', text: 'ts_diff -312s', tone: 'danger' }],
      metrics: [{ label: 'ts_diff', value: '-312s', tone: 'danger' }]
    },
    {
      title: '"가끔" 인 이유',
      description: '요청은 세 서버에 나뉘어 가고, web-3 에 간 것 중에서도 경계를 넘은 것만 실패합니다. 그래서 **간헐적**으로 보이고, 서버 1대인 로컬에서는 재현되지 않습니다.',
      packets: [
        { from: 'lb', to: 'w1', kind: 'event', delay: 0 },
        { from: 'lb', to: 'w2', kind: 'event', delay: 200 },
        { from: 'lb', to: 'w3', kind: 'event', delay: 400 },
        { from: 'w1', to: 'lb', kind: 'response', delay: 1000 },
        { from: 'w2', to: 'lb', kind: 'response', delay: 1200 },
        { from: 'w3', to: 'lb', kind: 'error', delay: 1400 }
      ],
      badges: [{ node: 'w3', text: '시계가 약 5분 어긋남', tone: 'warn' }],
      metrics: [{ label: '실패율', value: '~4%', tone: 'danger' }]
    },
    {
      title: '원인 확정 후',
      description: 'web-3 의 시간 동기화(NTP)를 고치고, 서버 시각·호스트명을 로그에 함께 남기도록 보강합니다.',
      packets: [
        { from: 'lb', to: 'w3', kind: 'event' },
        { from: 'w3', to: 'lb', kind: 'response', label: '200' }
      ],
      active: ['w3'],
      badges: [{ node: 'w3', text: 'NTP 동기화', tone: 'good' }],
      metrics: [{ label: 'ts_diff', value: '1s', tone: 'good' }]
    }
  ]
}

const INCIDENT: FlowSpec = {
  title: '배포 직후 결제 장애 대응',
  nodes: [
    { id: 'deploy', label: '배포', icon: '🚀', x: 0, y: 1.3, tone: 'purple' },
    { id: 'safari', label: 'Safari 사용자', icon: '🧭', x: 2, y: 0, tone: 'blue' },
    { id: 'chrome', label: 'Chrome 사용자', icon: '🌐', x: 2, y: 2.6, tone: 'blue' },
    { id: 'cs', label: 'CS 팀', icon: '🎧', x: 4, y: -1.3, tone: 'yellow' },
    { id: 'dev', label: '개발팀', icon: '🛠️', x: 4, y: 1.3, tone: 'green' }
  ],
  edges: [
    { from: 'deploy', to: 'safari' },
    { from: 'deploy', to: 'chrome' },
    { from: 'safari', to: 'cs' },
    { from: 'cs', to: 'dev' },
    { from: 'dev', to: 'deploy' }
  ],
  stages: [
    {
      title: '18:00 배포',
      description: '새 코드가 나갔고, **Safari 에서만** 결제 버튼이 반응하지 않습니다.',
      packets: [
        { from: 'deploy', to: 'safari', kind: 'event', label: '새 코드' },
        { from: 'deploy', to: 'chrome', kind: 'event', label: '새 코드' }
      ],
      failed: ['safari'],
      badges: [{ node: 'safari', text: '결제 버튼 무반응', tone: 'danger' }],
      metrics: [{ label: '시각', value: '18:00' }]
    },
    {
      title: '18:12 문의',
      description: 'CS 팀이 문의를 받아 개발팀 채널에 공유합니다.',
      packets: [
        { from: 'safari', to: 'cs', kind: 'error', label: '문의' },
        { from: 'cs', to: 'dev', kind: 'request', label: '슬랙' }
      ],
      failed: ['safari'],
      metrics: [{ label: '시각', value: '18:12' }]
    },
    {
      title: '18:15 1차 공지',
      description: '원인보다 **영향 범위 · 현재 조치 · 고객 안내 · 다음 업데이트 시각**을 먼저 알립니다.',
      packets: [{ from: 'dev', to: 'cs', kind: 'response', label: '18:40 재공유' }],
      active: ['cs'],
      failed: ['safari'],
      badges: [{ node: 'cs', text: '고객 안내 문구 전달' }],
      metrics: [{ label: '시각', value: '18:15' }]
    },
    {
      title: '18:25 롤백',
      description: '원인 분석보다 복구가 먼저입니다. 이전 버전으로 되돌려 결제를 살립니다.',
      packets: [
        { from: 'dev', to: 'deploy', kind: 'request', label: '롤백' },
        { from: 'deploy', to: 'safari', kind: 'event', label: '이전 버전' }
      ],
      active: ['safari'],
      badges: [{ node: 'safari', text: '정상', tone: 'good' }],
      metrics: [
        { label: '시각', value: '18:25' },
        { label: '장애 시간', value: '25분', tone: 'danger' }
      ]
    },
    {
      title: '회고',
      description: '"누가 실수했나" 가 아니라 **"어떤 장치가 없었나"** 를 찾아, 지원 브라우저 검사와 Safari E2E 테스트를 배포 과정에 넣습니다.',
      packets: [{ from: 'dev', to: 'deploy', kind: 'event', label: '브라우저 검사 추가' }],
      active: ['dev', 'deploy'],
      badges: [{ node: 'dev', text: '비난 없는 회고', tone: 'good' }],
      metrics: [{ label: '재발 방지', value: '2건' }]
    }
  ]
}

export const INTERVIEW_FLOWS: Record<string, FlowSpec> = {
  'week-10-5': SLOW_PAGE,
  'week-10-6': WEBHOOK_CLOCK,
  'week-12-4': INCIDENT
}
