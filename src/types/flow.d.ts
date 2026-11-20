/**
 * 스텝 이론 위에 표시하는 "흐름으로 보기" 다이어그램 데이터.
 * 노드는 아이소메트릭 격자 좌표에 놓이고, 단계(stage)마다 패킷이 노드 사이를 이동한다.
 */

export type FlowTone = 'blue' | 'orange' | 'green' | 'purple' | 'yellow' | 'red' | 'teal' | 'gray'

/** 패킷 종류: 요청(주황) · 응답(초록) · 이벤트/데이터(노랑) · 실패(빨강) */
export type FlowPacketKind = 'request' | 'response' | 'event' | 'error'

export interface FlowNode {
  id: string
  label: string
  /** 노드 위에 표시할 이모지 한 글자 */
  icon?: string
  /** 화면 격자 좌표: x 는 오른쪽(1칸 64px), y 는 아래(1칸 37px). (1, 1) 방향이 아이소메트릭 축이다 */
  x: number
  y: number
  tone: FlowTone
}

export interface FlowEdge {
  from: string
  to: string
}

export interface FlowPacket {
  from: string
  to: string
  kind: FlowPacketKind
  /** 패킷 옆에 붙는 짧은 글자 (예: "SELECT", "401") */
  label?: string
  /** 단계 시작 후 출발까지 기다리는 시간(ms). 생략하면 앞 패킷 순서대로 이어서 출발한다 */
  delay?: number
}

export interface FlowBadge {
  node: string
  text: string
  tone?: 'info' | 'warn' | 'danger' | 'good'
}

export interface FlowMetric {
  label: string
  value: string
  tone?: 'neutral' | 'danger' | 'good'
}

export interface FlowStage {
  /** 스테퍼 아래에 보이는 짧은 이름 */
  title: string
  /** 단계 설명 (마크다운 일부 지원: **굵게**, `코드`) */
  description: string
  packets: FlowPacket[]
  /** 강조할 노드 */
  active?: string[]
  /** 실패·거부 상태로 표시할 노드 */
  failed?: string[]
  /** 흐리게 표시할 노드 (이 단계와 무관) */
  dimmed?: string[]
  badges?: FlowBadge[]
  metrics?: FlowMetric[]
}

export interface FlowSpec {
  title: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  stages: FlowStage[]
}
