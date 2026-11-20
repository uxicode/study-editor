import type { FlowNode, FlowPacket, FlowTone } from '@/types/flow'

/**
 * 흐름 다이어그램의 순수 계산 함수 모음.
 * - 2:1 아이소메트릭 큐브(둥근 모서리)의 면 경로
 * - 아이소메트릭 축(기울기 ±½)을 따라 꺾이는 연결선 경로
 * - 경로 위 패킷 위치와 진행도
 * 렌더링과 분리해 단위 테스트할 수 있게 둔다.
 */

export interface Point {
  x: number
  y: number
}

/**
 * 격자 한 칸의 화면 크기.
 * 가로 2칸 · 세로 1.3칸 이동이 정확히 아이소메트릭 축(기울기 ½)이 되도록 세로를 맞춘다.
 */
const UNIT_X = 100
const UNIT_Y = UNIT_X / 1.3

/** 큐브 크기: 윗면 반너비, 윗면 반높이(반너비의 1/2 = 2:1 아이소메트릭), 옆면 높이, 모서리 반지름 */
export const CUBE = { halfWidth: 38, halfHeight: 19, depth: 36, radius: 5 } as const

/** 큐브 바닥 중심에서 바닥 마름모 테두리까지의 거리(축 방향) + 화살표가 보일 여백 */
export const FOOT_OFFSET = CUBE.halfWidth * 0.56 + 7

/** 연결선이 꺾이는 모서리의 반지름 */
const CORNER_RADIUS = 9

/** 패킷 한 개가 이동하는 시간과 순서대로 출발할 때의 간격 */
export const PACKET_DURATION = 900
export const PACKET_GAP = 450
/** 한 바퀴가 끝난 뒤 다시 시작하기 전 쉬는 시간 */
const CYCLE_REST = 900

/** 화면 격자 좌표 → 픽셀 좌표 (큐브 바닥 중심) */
export function project(x: number, y: number): Point {
  return { x: x * UNIT_X, y: y * UNIT_Y }
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

function moveToward(from: Point, to: Point, length: number): Point {
  const total = distance(from, to) || 1
  const t = Math.min(1, length / total)
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }
}

function fmt(p: Point): string {
  return `${Math.round(p.x * 100) / 100},${Math.round(p.y * 100) / 100}`
}

/** 닫힌 다각형을 꼭짓점마다 둥글린 path d */
export function roundedPolygonPath(points: Point[], radius: number): string {
  const n = points.length
  const parts: string[] = []
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n]
    const curr = points[i]
    const next = points[(i + 1) % n]
    const r = Math.min(radius, distance(prev, curr) / 2, distance(curr, next) / 2)
    const start = moveToward(curr, prev, r)
    const end = moveToward(curr, next, r)
    parts.push(`${i === 0 ? 'M' : 'L'}${fmt(start)} Q${fmt(curr)} ${fmt(end)}`)
  }
  return `${parts.join(' ')} Z`
}

/** 열린 꺾은선을 중간 꼭짓점마다 둥글린 path d */
export function roundedPolylinePath(points: Point[], radius = CORNER_RADIUS): string {
  if (points.length < 2) return ''
  const parts = [`M${fmt(points[0])}`]
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]
    const r = Math.min(radius, distance(prev, curr) / 2, distance(curr, next) / 2)
    parts.push(`L${fmt(moveToward(curr, prev, r))} Q${fmt(curr)} ${fmt(moveToward(curr, next, r))}`)
  }
  parts.push(`L${fmt(points[points.length - 1])}`)
  return parts.join(' ')
}

export interface CubeShape {
  top: string
  left: string
  right: string
  outline: string
  highlight: string
  /** 윗면과 옆면이 만나는 안쪽 모서리 */
  innerEdge: string
  /** 윗면 중심 (라벨 위치) */
  center: Point
}

export function cubeShape(base: Point): CubeShape {
  const { halfWidth: w, halfHeight: h, depth: d, radius: r } = CUBE
  const ty = base.y - d
  const top = { x: base.x, y: ty - h }
  const right = { x: base.x + w, y: ty }
  const front = { x: base.x, y: ty + h }
  const left = { x: base.x - w, y: ty }
  const rightBottom = { x: base.x + w, y: base.y }
  const frontBottom = { x: base.x, y: base.y + h }
  const leftBottom = { x: base.x - w, y: base.y }
  const shrink = (p: Point, k: number): Point => ({ x: base.x + (p.x - base.x) * k, y: ty + (p.y - ty) * k })

  return {
    top: roundedPolygonPath([top, right, front, left], r),
    left: roundedPolygonPath([left, front, frontBottom, leftBottom], r),
    right: roundedPolygonPath([right, rightBottom, frontBottom, front], r),
    outline: roundedPolygonPath([top, right, rightBottom, frontBottom, leftBottom, left], r),
    highlight: roundedPolygonPath([shrink(top, 0.72), shrink(right, 0.72), shrink(front, 0.72), shrink(left, 0.72)], r),
    innerEdge: roundedPolylinePath([left, front, right], r),
    center: { x: base.x, y: ty }
  }
}

/** 꺾이는 모서리가 다른 큐브와 이 거리보다 가까우면 그 경로는 쓰지 않는다 */
const OBSTACLE_RADIUS = 48

/**
 * 두 점 사이를 아이소메트릭 두 축 (2, 1) · (2, -1) 방향으로만 이동하는 꺾은선.
 * - 한 축 위에 있으면 직선
 * - 꺾으면 경로가 두 점 바깥으로 튀어 나가는 경우(가파른 방향)는 직선
 * - 두 꺾임 후보 중 다른 큐브와 겹치지 않는 쪽을 쓰고, 둘 다 겹치면 직선
 */
export function isoRoute(from: Point, to: Point, obstacles: Point[] = []): Point[] {
  const dx = to.x - from.x
  const dy = to.y - from.y
  // dx = 2a + 2b, dy = a - b  →  (2, 1) 방향 a 만큼, (2, -1) 방향 b 만큼
  const a = (dx / 2 + dy) / 2
  const b = (dx / 2 - dy) / 2
  if (Math.abs(a) < 1 || Math.abs(b) < 1 || a * b < 0) return [from, to]

  const corners = [
    { x: from.x + 2 * a, y: from.y + a },
    { x: from.x + 2 * b, y: from.y - b }
  ]
  const corner = corners.find((c) => obstacles.every((o) => distance(c, o) >= OBSTACLE_RADIUS))
  return corner ? [from, corner, to] : [from, to]
}

function polylineLength(points: Point[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) total += distance(points[i - 1], points[i])
  return total
}

/** 꺾은선 양끝을 큐브 발치까지 잘라 낸다 (선과 화살표가 큐브에 가려지지 않게) */
export function trimPolyline(points: Point[], amount = FOOT_OFFSET): Point[] {
  const total = polylineLength(points)
  const cut = Math.min(amount, total / 3)
  return slicePolyline(points, cut, total - cut)
}

/** 바닥 중심이 base 인 큐브가 화면에서 차지하는 육각형 윤곽 (시계 방향) */
export function cubeSilhouette(base: Point): Point[] {
  const { halfWidth: w, halfHeight: h, depth: d } = CUBE
  return [
    { x: base.x, y: base.y - d - h },
    { x: base.x + w, y: base.y - d },
    { x: base.x + w, y: base.y },
    { x: base.x, y: base.y + h },
    { x: base.x - w, y: base.y },
    { x: base.x - w, y: base.y - d }
  ]
}

function isInsideConvex(point: Point, polygon: Point[]): boolean {
  return polygon.every((a, i) => {
    const b = polygon[(i + 1) % polygon.length]
    return (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x) >= 0
  })
}

/** 꺾은선 시작점에서 출발해 polygon 밖으로 처음 나가는 지점까지의 길이 */
function exitDistance(points: Point[], polygon: Point[], total: number): number {
  for (let walked = 0; walked <= total; walked += 1) {
    if (!isInsideConvex(pointAlong(points, walked / total), polygon)) return walked
  }
  return total
}

/** 큐브 윤곽에서 화살표 끝까지 띄울 여백 */
const CUBE_GAP = 5

/**
 * 꺾은선 양끝을 출발 · 도착 큐브의 윤곽 바깥까지 잘라 낸다.
 * 위쪽에서 들어오는 선도 화살표가 큐브 옆면에 가려지지 않는다.
 */
export function trimToCubes(points: Point[], gap = CUBE_GAP): Point[] {
  const total = polylineLength(points)
  if (total === 0) return points
  const reversed = [...points].reverse()
  const maxCut = total * 0.4
  const startCut = Math.min(exitDistance(points, cubeSilhouette(points[0]), total) + gap, maxCut)
  const endCut = Math.min(exitDistance(reversed, cubeSilhouette(reversed[0]), total) + gap, maxCut)
  return slicePolyline(points, startCut, total - endCut)
}

function slicePolyline(points: Point[], startAt: number, endAt: number): Point[] {
  const result: Point[] = []
  let walked = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const length = distance(a, b)
    const segStart = walked
    const segEnd = walked + length
    if (segEnd >= startAt && segStart <= endAt) {
      const from = startAt > segStart ? moveToward(a, b, startAt - segStart) : a
      const to = endAt < segEnd ? moveToward(a, b, endAt - segStart) : b
      if (result.length === 0) result.push(from)
      result.push(to)
    }
    walked = segEnd
  }
  return result.length >= 2 ? result : [points[0], points[points.length - 1]]
}

/** 꺾은선 위에서 진행도 t(0 ~ 1)에 해당하는 점 */
export function pointAlong(points: Point[], t: number): Point {
  const total = polylineLength(points)
  let remaining = Math.max(0, Math.min(1, t)) * total
  for (let i = 1; i < points.length; i++) {
    const length = distance(points[i - 1], points[i])
    if (remaining <= length) return moveToward(points[i - 1], points[i], remaining)
    remaining -= length
  }
  return points[points.length - 1]
}

export interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

/** 모든 노드(큐브 + 배지 공간)를 담는 viewBox */
export function computeViewBox(nodes: FlowNode[], padding = 36): ViewBox {
  if (nodes.length === 0) return { x: 0, y: 0, width: 100, height: 100 }

  const points = nodes.map((n) => project(n.x, n.y))
  const badgeSpace = 30
  const minX = Math.min(...points.map((p) => p.x)) - CUBE.halfWidth - padding
  const maxX = Math.max(...points.map((p) => p.x)) + CUBE.halfWidth + padding
  const minY = Math.min(...points.map((p) => p.y)) - CUBE.depth - CUBE.halfHeight - badgeSpace - padding
  const maxY = Math.max(...points.map((p) => p.y)) + CUBE.halfHeight + padding

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

/** 패킷의 출발 시각(ms). delay 가 없으면 앞 패킷 다음 순서로 출발한다 */
export function packetStart(packet: FlowPacket, index: number): number {
  return packet.delay ?? index * PACKET_GAP
}

/** 모든 패킷이 도착하고 잠깐 쉰 뒤 다시 시작하는 한 바퀴 길이(ms) */
export function cycleLength(packets: FlowPacket[]): number {
  if (packets.length === 0) return PACKET_DURATION
  const lastArrival = Math.max(...packets.map((p, i) => packetStart(p, i) + PACKET_DURATION))
  return lastArrival + CYCLE_REST
}

/**
 * 경과 시간에서 패킷의 진행도(0 ~ 1)를 구한다.
 * 아직 출발 전이거나 이미 도착했으면 null (화면에 그리지 않음).
 */
export function packetProgress(packet: FlowPacket, index: number, elapsedInCycle: number): number | null {
  const t = (elapsedInCycle - packetStart(packet, index)) / PACKET_DURATION
  if (t < 0 || t > 1) return null
  return easeInOut(t)
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

export interface ToneShades {
  /** 윗면 그라데이션 (밝은 쪽 → 기본) */
  topLight: string
  top: string
  /** 옆면 그라데이션 (기본 → 어두운 쪽) */
  side: string
  sideDark: string
}

/** 톤별 큐브 색 */
export const TONE_SHADES: Record<FlowTone, ToneShades> = {
  blue: { topLight: '#dce9f8', top: '#b4cdee', side: '#93b4e2', sideDark: '#6f93c9' },
  orange: { topLight: '#fde3cc', top: '#f8c49b', side: '#f0a46c', sideDark: '#d9824a' },
  green: { topLight: '#e2f1da', top: '#c2e0b2', side: '#9fcd8a', sideDark: '#7aae64' },
  purple: { topLight: '#ebe4f8', top: '#d1c4ef', side: '#b4a2e2', sideDark: '#907cc6' },
  yellow: { topLight: '#fdf0cc', top: '#f8db93', side: '#efc663', sideDark: '#d4a640' },
  red: { topLight: '#fbe0e0', top: '#f4bcbc', side: '#ea9494', sideDark: '#cc6b6b' },
  teal: { topLight: '#dcf1ef', top: '#b3e0dc', side: '#86cbc5', sideDark: '#5ea9a2' },
  gray: { topLight: '#f1eeea', top: '#dcd7d0', side: '#c3bcb2', sideDark: '#a19a90' }
}

export const PACKET_COLORS = {
  request: '#f0a46c',
  response: '#7fbf6a',
  event: '#efc663',
  error: '#d95c5c'
} as const

/** 한글은 영문보다 넓으므로 글자 종류별로 너비를 어림한다 (font-size 1px 당) */
export function textWidth(text: string, fontSize: number): number {
  let units = 0
  for (const char of text) units += /[ㄱ-힝]/.test(char) ? 1 : 0.58
  return units * fontSize
}
