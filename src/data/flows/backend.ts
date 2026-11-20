import type { FlowSpec } from '@/types/flow'

/** 백엔드 코어(week-2 ~ week-4) 흐름 다이어그램 */

const LAYERED: FlowSpec = {
  title: '레이어드 아키텍처 요청 흐름',
  nodes: [
    { id: 'client', label: '클라이언트', icon: '🧑‍💻', x: 0, y: 0, tone: 'gray' },
    { id: 'route', label: 'route', icon: '🚪', x: 1, y: 0.65, tone: 'blue' },
    { id: 'service', label: 'service', icon: '🧠', x: 2, y: 1.3, tone: 'purple' },
    { id: 'repo', label: 'repository', icon: '📦', x: 3, y: 1.95, tone: 'orange' },
    { id: 'db', label: 'MySQL', icon: '🗄️', x: 4, y: 2.6, tone: 'teal' }
  ],
  edges: [
    { from: 'client', to: 'route' },
    { from: 'route', to: 'service' },
    { from: 'service', to: 'repo' },
    { from: 'repo', to: 'db' }
  ],
  stages: [
    {
      title: '요청 도착',
      description: '클라이언트가 `POST /users` 로 가입을 요청합니다. 요청은 항상 **route** 로 먼저 들어옵니다.',
      packets: [{ from: 'client', to: 'route', kind: 'request', label: 'POST /users' }],
      active: ['route'],
      dimmed: ['repo', 'db'],
      metrics: [{ label: '지나는 계층', value: 'route' }]
    },
    {
      title: '입력만 확인',
      description: 'route 는 HTTP 입출력만 책임집니다. body 형식을 확인하고, 규칙 판단은 `userService.create(dto)` 에 넘깁니다.',
      packets: [{ from: 'route', to: 'service', kind: 'request', label: 'create(dto)' }],
      active: ['route', 'service'],
      badges: [{ node: 'route', text: '형식 검증만' }],
      dimmed: ['db'],
      metrics: [{ label: '지나는 계층', value: 'route → service' }]
    },
    {
      title: '규칙 판단',
      description: 'service 가 "이메일은 중복될 수 없다" 는 **비즈니스 규칙**을 확인하려고 repository 에 조회를 맡깁니다. service 는 SQL 도 Prisma 도 모릅니다.',
      packets: [
        { from: 'service', to: 'repo', kind: 'request', label: 'findByEmail' },
        { from: 'repo', to: 'db', kind: 'request', label: 'SELECT' },
        { from: 'db', to: 'repo', kind: 'response', label: '없음' },
        { from: 'repo', to: 'service', kind: 'response', label: 'null' }
      ],
      active: ['service'],
      badges: [{ node: 'service', text: '이메일 중복 규칙' }],
      metrics: [{ label: 'DB 왕복', value: '1회' }]
    },
    {
      title: '저장 후 응답',
      description: '규칙을 통과하면 repository 가 `INSERT` 하고, 결과가 거꾸로 올라가 route 가 `201` 로 응답합니다.',
      packets: [
        { from: 'service', to: 'repo', kind: 'request', label: 'create' },
        { from: 'repo', to: 'db', kind: 'request', label: 'INSERT' },
        { from: 'db', to: 'repo', kind: 'response' },
        { from: 'repo', to: 'service', kind: 'response' },
        { from: 'service', to: 'route', kind: 'response', label: 'user' },
        { from: 'route', to: 'client', kind: 'response', label: '201' }
      ],
      active: ['repo', 'route'],
      metrics: [
        { label: 'DB 왕복', value: '2회' },
        { label: '응답', value: '201 Created', tone: 'good' }
      ]
    },
    {
      title: '규칙 위반',
      description: '이미 있는 이메일이면 service 가 에러를 던지고, **route 가 그 에러를 HTTP 상태 코드(409)로 바꿉니다.** 상태 코드는 HTTP 계층의 일입니다.',
      packets: [
        { from: 'repo', to: 'service', kind: 'response', label: '기존 user' },
        { from: 'service', to: 'route', kind: 'error', label: 'DuplicateEmail' },
        { from: 'route', to: 'client', kind: 'error', label: '409' }
      ],
      failed: ['service'],
      badges: [{ node: 'route', text: '에러 → 409', tone: 'danger' }],
      metrics: [{ label: '응답', value: '409 Conflict', tone: 'danger' }]
    },
    {
      title: '방향을 거스르면',
      description: 'route 가 repository 를 **직접** 부르면 이메일 중복 규칙을 건너뜁니다. 의존성은 `route → service → repository` 한 방향으로만 흘러야 합니다.',
      packets: [{ from: 'route', to: 'repo', kind: 'error', label: '직접 호출 ✕' }],
      failed: ['route'],
      dimmed: ['service'],
      badges: [{ node: 'service', text: '규칙을 건너뜀', tone: 'danger' }],
      metrics: [{ label: '레이어', value: '깨짐', tone: 'danger' }]
    }
  ]
}

const FOREIGN_KEY: FlowSpec = {
  title: '외래키와 ON DELETE CASCADE',
  nodes: [
    { id: 'app', label: '앱', icon: '🧑‍💻', x: 0, y: 1.3, tone: 'gray' },
    { id: 'users', label: 'users', icon: '👤', x: 2, y: 0, tone: 'blue' },
    { id: 'posts', label: 'posts', icon: '📝', x: 4, y: 1.3, tone: 'orange' }
  ],
  edges: [
    { from: 'app', to: 'users' },
    { from: 'app', to: 'posts' },
    { from: 'posts', to: 'users' }
  ],
  stages: [
    {
      title: '정상 INSERT',
      description: '`posts.user_id` 에 외래키가 있으면, 글을 넣을 때 MySQL 이 **부모 행(users)이 있는지 먼저 확인**합니다.',
      packets: [
        { from: 'app', to: 'posts', kind: 'request', label: 'user_id=1' },
        { from: 'posts', to: 'users', kind: 'event', label: '1번 있나?' },
        { from: 'users', to: 'posts', kind: 'response', label: '있음' },
        { from: 'posts', to: 'app', kind: 'response', label: 'OK' }
      ],
      active: ['posts'],
      metrics: [{ label: '결과', value: '저장됨', tone: 'good' }]
    },
    {
      title: '없는 부모',
      description: '존재하지 않는 `user_id=99` 로 넣으면 외래키 제약이 막습니다. 주인 없는 글(고아 행)이 생기지 않습니다.',
      packets: [
        { from: 'app', to: 'posts', kind: 'request', label: 'user_id=99' },
        { from: 'posts', to: 'users', kind: 'event', label: '99번 있나?' },
        { from: 'users', to: 'posts', kind: 'error', label: '없음' },
        { from: 'posts', to: 'app', kind: 'error', label: 'ERROR 1452' }
      ],
      failed: ['posts'],
      metrics: [{ label: '결과', value: 'FK 위반', tone: 'danger' }]
    },
    {
      title: '부모 삭제 → CASCADE',
      description: '`ON DELETE CASCADE` 면 users 의 행을 지울 때 **그 사용자의 글도 함께 지워집니다.** 앱이 posts 를 따로 지울 필요가 없습니다.',
      packets: [
        { from: 'app', to: 'users', kind: 'request', label: 'DELETE id=1' },
        { from: 'users', to: 'posts', kind: 'event', label: 'CASCADE' },
        { from: 'users', to: 'app', kind: 'response', label: 'OK' }
      ],
      active: ['users', 'posts'],
      badges: [{ node: 'posts', text: '글 3개 함께 삭제', tone: 'warn' }],
      metrics: [{ label: '삭제된 행', value: 'users 1 + posts 3' }]
    },
    {
      title: 'RESTRICT 였다면',
      description: '기본값(RESTRICT)이면 자식 행이 남아 있는 부모는 지울 수 없습니다. 어떤 동작이 맞는지는 **데이터의 의미**로 정합니다.',
      packets: [
        { from: 'app', to: 'users', kind: 'request', label: 'DELETE id=1' },
        { from: 'users', to: 'posts', kind: 'event', label: '자식 있나?' },
        { from: 'posts', to: 'users', kind: 'error', label: '3개 있음' },
        { from: 'users', to: 'app', kind: 'error', label: '삭제 거부' }
      ],
      failed: ['users'],
      metrics: [{ label: '결과', value: 'ERROR 1451', tone: 'danger' }]
    }
  ]
}

const TRANSACTION: FlowSpec = {
  title: '$transaction 커밋과 롤백',
  nodes: [
    { id: 'service', label: 'service', icon: '🧠', x: 0, y: 2.6, tone: 'purple' },
    { id: 'tx', label: '트랜잭션', icon: '🔒', x: 2, y: 1.3, tone: 'yellow' },
    { id: 'users', label: 'users', icon: '👤', x: 4, y: 0, tone: 'blue' },
    { id: 'posts', label: 'posts', icon: '📝', x: 4, y: 2.6, tone: 'orange' }
  ],
  edges: [
    { from: 'service', to: 'tx' },
    { from: 'tx', to: 'users' },
    { from: 'tx', to: 'posts' }
  ],
  stages: [
    {
      title: '시작',
      description: '"사용자 생성 + 첫 글 작성" 을 `prisma.$transaction([...])` 하나로 묶어 보냅니다. 둘은 **함께 성공하거나 함께 실패**해야 합니다.',
      packets: [{ from: 'service', to: 'tx', kind: 'request', label: '$transaction' }],
      active: ['tx'],
      metrics: [{ label: '확정된 행', value: '0' }]
    },
    {
      title: '사용자 생성',
      description: '첫 번째 작업이 성공해도 아직 **확정(COMMIT)되지 않은 상태**입니다. 다른 연결에서는 보이지 않습니다.',
      packets: [
        { from: 'tx', to: 'users', kind: 'request', label: 'INSERT user' },
        { from: 'users', to: 'tx', kind: 'response', label: 'id=7' }
      ],
      active: ['users'],
      badges: [{ node: 'users', text: '임시 반영' }],
      metrics: [{ label: '확정된 행', value: '0' }]
    },
    {
      title: '글 작성 실패',
      description: '두 번째 작업이 제약 위반으로 실패했습니다.',
      packets: [
        { from: 'tx', to: 'posts', kind: 'request', label: 'INSERT post' },
        { from: 'posts', to: 'tx', kind: 'error', label: '제약 위반' }
      ],
      failed: ['posts'],
      badges: [{ node: 'users', text: '임시 반영' }]
    },
    {
      title: 'ROLLBACK',
      description: '하나라도 실패하면 **이미 성공한 사용자 생성까지 되돌립니다.** "글 없는 신규 사용자" 같은 반쪽 데이터가 남지 않습니다.',
      packets: [
        { from: 'tx', to: 'users', kind: 'error', label: 'ROLLBACK' },
        { from: 'tx', to: 'service', kind: 'error', label: '에러 전달' }
      ],
      failed: ['tx'],
      badges: [{ node: 'users', text: '생성 취소', tone: 'danger' }],
      metrics: [{ label: '확정된 행', value: '0', tone: 'good' }]
    },
    {
      title: '모두 성공 → COMMIT',
      description: '두 작업이 모두 성공하면 한 번에 확정됩니다. 이때부터 다른 연결에서도 보입니다.',
      packets: [
        { from: 'tx', to: 'users', kind: 'request', label: 'INSERT' },
        { from: 'tx', to: 'posts', kind: 'request', label: 'INSERT' },
        { from: 'users', to: 'tx', kind: 'response' },
        { from: 'posts', to: 'tx', kind: 'response' },
        { from: 'tx', to: 'service', kind: 'response', label: 'COMMIT' }
      ],
      active: ['users', 'posts'],
      metrics: [{ label: '확정된 행', value: '2', tone: 'good' }]
    },
    {
      title: '트랜잭션이 없다면',
      description: '따로따로 실행하면 사용자만 저장되고 글은 실패한 **반쪽 상태**가 그대로 남습니다.',
      packets: [
        { from: 'service', to: 'users', kind: 'request', label: 'INSERT user' },
        { from: 'users', to: 'service', kind: 'response' },
        { from: 'service', to: 'posts', kind: 'request', label: 'INSERT post' },
        { from: 'posts', to: 'service', kind: 'error', label: '실패' }
      ],
      dimmed: ['tx'],
      failed: ['posts'],
      badges: [{ node: 'users', text: '사용자만 남음', tone: 'danger' }],
      metrics: [{ label: '데이터 상태', value: '반쪽 저장', tone: 'danger' }]
    }
  ]
}

const INDEX: FlowSpec = {
  title: '인덱스가 조회 경로를 바꾸는 방식',
  nodes: [
    { id: 'query', label: '쿼리', icon: '🔎', x: 0, y: 1.3, tone: 'gray' },
    { id: 'index', label: '인덱스', icon: '🌳', x: 2, y: 0, tone: 'purple' },
    { id: 'table', label: 'posts 100만 행', icon: '🗄️', x: 4, y: 1.3, tone: 'teal' }
  ],
  edges: [
    { from: 'query', to: 'index' },
    { from: 'index', to: 'table' },
    { from: 'query', to: 'table' }
  ],
  stages: [
    {
      title: '인덱스 없음',
      description: '`WHERE userId = 7` 을 찾으려면 테이블의 **모든 행을 처음부터 끝까지** 읽어야 합니다 (풀 스캔).',
      packets: [
        { from: 'query', to: 'table', kind: 'request', label: 'userId=7' },
        { from: 'table', to: 'query', kind: 'response', label: '30행' }
      ],
      dimmed: ['index'],
      badges: [{ node: 'table', text: '100만 행 전부 읽음', tone: 'danger' }],
      metrics: [
        { label: '읽은 행', value: '1,000,000', tone: 'danger' },
        { label: '시간', value: '~800ms', tone: 'danger' }
      ]
    },
    {
      title: '인덱스 탐색',
      description: '정렬된 인덱스(B-Tree)에서 `userId = 7` 의 위치를 바로 찾고, 그 행들만 테이블에서 가져옵니다.',
      packets: [
        { from: 'query', to: 'index', kind: 'request', label: 'userId=7' },
        { from: 'index', to: 'table', kind: 'event', label: '행 위치 30개' },
        { from: 'table', to: 'query', kind: 'response', label: '30행' }
      ],
      active: ['index'],
      metrics: [
        { label: '읽은 행', value: '30', tone: 'good' },
        { label: '시간', value: '~2ms', tone: 'good' }
      ]
    },
    {
      title: '복합 인덱스',
      description: '`@@index([userId, createdAt])` 는 userId 안에서 createdAt 순으로 이미 정렬돼 있어, "내 글 최신순" 에 **추가 정렬이 필요 없습니다.**',
      packets: [
        { from: 'query', to: 'index', kind: 'request', label: 'userId=7 최신순' },
        { from: 'index', to: 'table', kind: 'event', label: '정렬된 위치' },
        { from: 'table', to: 'query', kind: 'response', label: '10행' }
      ],
      active: ['index'],
      badges: [{ node: 'index', text: '(userId, createdAt)', tone: 'good' }],
      metrics: [{ label: '추가 정렬', value: '없음', tone: 'good' }]
    },
    {
      title: '앞 컬럼이 빠지면',
      description: '`createdAt` 만으로 검색하면 복합 인덱스의 **첫 컬럼(userId)이 없어** 인덱스를 타지 못하고 다시 풀 스캔합니다.',
      packets: [
        { from: 'query', to: 'index', kind: 'error', label: 'createdAt 만' },
        { from: 'query', to: 'table', kind: 'request', label: '풀 스캔', delay: 700 }
      ],
      failed: ['index'],
      badges: [{ node: 'index', text: '앞 컬럼 없이 못 씀', tone: 'warn' }],
      metrics: [{ label: '읽은 행', value: '1,000,000', tone: 'danger' }]
    },
    {
      title: '쓰기 비용',
      description: '인덱스는 공짜가 아닙니다. INSERT · UPDATE 마다 **인덱스도 함께 갱신**되므로, 실제로 쓰는 조회에만 만듭니다.',
      packets: [
        { from: 'query', to: 'table', kind: 'request', label: 'INSERT' },
        { from: 'table', to: 'index', kind: 'event', label: '인덱스 갱신' }
      ],
      active: ['index', 'table'],
      badges: [{ node: 'index', text: '쓰기마다 갱신', tone: 'warn' }],
      metrics: [{ label: '인덱스 수', value: '= 쓰기 비용' }]
    }
  ]
}

const N_PLUS_ONE: FlowSpec = {
  title: 'N+1 쿼리와 include',
  nodes: [
    { id: 'app', label: '서비스 코드', icon: '🧠', x: 0, y: 1.3, tone: 'purple' },
    { id: 'orm', label: 'Prisma', icon: '🔷', x: 2, y: 0, tone: 'blue' },
    { id: 'db', label: 'MySQL', icon: '🗄️', x: 4, y: 1.3, tone: 'teal' }
  ],
  edges: [
    { from: 'app', to: 'orm' },
    { from: 'orm', to: 'db' }
  ],
  stages: [
    {
      title: '목록 1번',
      description: '사용자 목록을 가져오는 쿼리 **1번**입니다. 여기까지는 문제없습니다.',
      packets: [
        { from: 'app', to: 'orm', kind: 'request', label: 'findMany users' },
        { from: 'orm', to: 'db', kind: 'request', label: 'SELECT users' },
        { from: 'db', to: 'orm', kind: 'response', label: '100명' },
        { from: 'orm', to: 'app', kind: 'response' }
      ],
      metrics: [{ label: '쿼리 수', value: '1' }]
    },
    {
      title: '반복문 안에서 N번',
      description: '`for` 문 안에서 사용자마다 글을 조회하면 쿼리가 **사용자 수(N)만큼** 더 나갑니다. 왕복 1번이 1ms 여도 100명이면 100ms 입니다.',
      packets: [
        { from: 'orm', to: 'db', kind: 'request', label: 'user_id=1', delay: 0 },
        { from: 'orm', to: 'db', kind: 'request', label: 'user_id=2', delay: 250 },
        { from: 'orm', to: 'db', kind: 'request', label: 'user_id=3', delay: 500 },
        { from: 'orm', to: 'db', kind: 'request', label: '…', delay: 750 },
        { from: 'orm', to: 'db', kind: 'request', label: 'user_id=100', delay: 1000 }
      ],
      failed: ['orm'],
      badges: [{ node: 'orm', text: 'for 문 안에서 100번', tone: 'danger' }],
      metrics: [
        { label: '쿼리 수', value: '1 + 100', tone: 'danger' },
        { label: 'DB 왕복', value: '~101ms', tone: 'danger' }
      ]
    },
    {
      title: 'include 로 한 번에',
      description: '`findMany({ include: { posts: true } })` 는 글을 `WHERE user_id IN (...)` **한 번**으로 모아 가져옵니다.',
      packets: [
        { from: 'app', to: 'orm', kind: 'request', label: 'include: posts' },
        { from: 'orm', to: 'db', kind: 'request', label: 'SELECT users' },
        { from: 'orm', to: 'db', kind: 'request', label: 'posts IN (…)' },
        { from: 'db', to: 'orm', kind: 'response' },
        { from: 'orm', to: 'app', kind: 'response', label: 'users + posts' }
      ],
      active: ['orm'],
      metrics: [
        { label: '쿼리 수', value: '2', tone: 'good' },
        { label: 'DB 왕복', value: '~2ms', tone: 'good' }
      ]
    }
  ]
}

const PAGINATION: FlowSpec = {
  title: '오프셋 vs 커서 페이지네이션',
  nodes: [
    { id: 'client', label: '클라이언트', icon: '📱', x: 0, y: 1.3, tone: 'gray' },
    { id: 'api', label: '목록 API', icon: '🚪', x: 2, y: 0, tone: 'blue' },
    { id: 'db', label: 'posts', icon: '🗄️', x: 4, y: 1.3, tone: 'teal' }
  ],
  edges: [
    { from: 'client', to: 'api' },
    { from: 'api', to: 'db' }
  ],
  stages: [
    {
      title: '오프셋',
      description: '`skip: 20, take: 10` 은 앞의 20행을 **읽고 버린 뒤** 10행을 돌려줍니다.',
      packets: [
        { from: 'client', to: 'api', kind: 'request', label: 'page=3' },
        { from: 'api', to: 'db', kind: 'request', label: 'OFFSET 20 LIMIT 10' },
        { from: 'db', to: 'api', kind: 'response' },
        { from: 'api', to: 'client', kind: 'response', label: '10개' }
      ],
      badges: [{ node: 'db', text: '20행 읽고 버림', tone: 'warn' }],
      metrics: [{ label: '읽은 행', value: '30' }]
    },
    {
      title: '깊은 페이지',
      description: '페이지가 깊어질수록 버리는 행이 늘어 **점점 느려집니다.**',
      packets: [
        { from: 'client', to: 'api', kind: 'request', label: 'page=5000' },
        { from: 'api', to: 'db', kind: 'request', label: 'OFFSET 49990' },
        { from: 'db', to: 'api', kind: 'response' },
        { from: 'api', to: 'client', kind: 'response', label: '10개' }
      ],
      failed: ['db'],
      badges: [{ node: 'db', text: '49,990행 버림', tone: 'danger' }],
      metrics: [{ label: '읽은 행', value: '50,000', tone: 'danger' }]
    },
    {
      title: '새 글이 끼어들면',
      description: '1페이지를 본 뒤 새 글이 올라오면 모든 글이 한 칸씩 밀려, 2페이지 첫 글이 **이미 본 글**이 됩니다.',
      packets: [
        { from: 'client', to: 'api', kind: 'request', label: 'page=2' },
        { from: 'api', to: 'db', kind: 'request', label: 'OFFSET 10' },
        { from: 'db', to: 'api', kind: 'response' },
        { from: 'api', to: 'client', kind: 'error', label: '중복 노출' }
      ],
      badges: [{ node: 'db', text: '새 글 1개 추가됨', tone: 'warn' }],
      metrics: [{ label: '중복', value: '1건', tone: 'danger' }]
    },
    {
      title: '커서',
      description: '`cursor: { id: 마지막 id }, skip: 1` 은 "마지막으로 본 글 다음" 을 **인덱스로 바로** 찾습니다. 새 글이 생겨도 밀리지 않습니다.',
      packets: [
        { from: 'client', to: 'api', kind: 'request', label: 'cursor=1234' },
        { from: 'api', to: 'db', kind: 'request', label: 'id < 1234 LIMIT 10' },
        { from: 'db', to: 'api', kind: 'response' },
        { from: 'api', to: 'client', kind: 'response', label: '10개 + nextCursor' }
      ],
      active: ['db'],
      badges: [{ node: 'db', text: '인덱스로 바로 찾음', tone: 'good' }],
      metrics: [
        { label: '읽은 행', value: '10', tone: 'good' },
        { label: '중복', value: '0건', tone: 'good' }
      ]
    }
  ]
}

const SQL_INJECTION: FlowSpec = {
  title: '$queryRaw 와 SQL 인젝션',
  nodes: [
    { id: 'client', label: '요청', icon: '🧑‍💻', x: 0, y: 1.3, tone: 'gray' },
    { id: 'api', label: 'getTopWriters', icon: '🚪', x: 2, y: 0, tone: 'blue' },
    { id: 'db', label: 'MySQL', icon: '🗄️', x: 4, y: 1.3, tone: 'teal' }
  ],
  edges: [
    { from: 'client', to: 'api' },
    { from: 'api', to: 'db' }
  ],
  stages: [
    {
      title: '문자열 이어 붙이기',
      description: '입력을 SQL 문자열에 그대로 붙이면 `0 OR 1=1` 같은 입력이 **조건이 아니라 SQL 코드**가 됩니다.',
      packets: [
        { from: 'client', to: 'api', kind: 'request', label: "minPosts='0 OR 1=1'" },
        { from: 'api', to: 'db', kind: 'error', label: '>= 0 OR 1=1' },
        { from: 'db', to: 'client', kind: 'error', label: '모든 행 노출' }
      ],
      failed: ['db'],
      badges: [{ node: 'db', text: '입력이 SQL 이 됨', tone: 'danger' }],
      metrics: [{ label: '보안', value: '뚫림', tone: 'danger' }]
    },
    {
      title: '바인딩',
      description: '`$queryRaw` 템플릿의 `${minPosts}` 는 SQL 과 **값을 따로** 보냅니다. 같은 입력도 그냥 문자열 값으로만 비교됩니다.',
      packets: [
        { from: 'client', to: 'api', kind: 'request', label: "minPosts='0 OR 1=1'" },
        { from: 'api', to: 'db', kind: 'request', label: 'SQL + 값(?)' },
        { from: 'db', to: 'api', kind: 'response', label: '0행' },
        { from: 'api', to: 'client', kind: 'response', label: '[]' }
      ],
      active: ['api'],
      badges: [{ node: 'db', text: '값은 값으로만', tone: 'good' }],
      metrics: [{ label: '보안', value: '안전', tone: 'good' }]
    },
    {
      title: '결과 타입',
      description: '`$queryRaw<Writer[]>` 로 결과 타입을 지정하면, 이후 코드에서 `postCount` 오타를 컴파일 단계에서 잡을 수 있습니다.',
      packets: [
        { from: 'db', to: 'api', kind: 'response', label: 'rows' },
        { from: 'api', to: 'client', kind: 'response', label: 'Writer[]' }
      ],
      badges: [{ node: 'api', text: '$queryRaw<Writer[]>', tone: 'good' }]
    }
  ]
}

export const BACKEND_FLOWS: Record<string, FlowSpec> = {
  'week-2-4': FOREIGN_KEY,
  'week-3-5': LAYERED,
  'week-4-1': TRANSACTION,
  'week-4-2': INDEX,
  'week-4-3': N_PLUS_ONE,
  'week-4-4': PAGINATION,
  'week-4-7': SQL_INJECTION
}
