import { describe, it, expect } from 'vitest'
import { CURRICULUM_STEPS } from '@/data/curriculum-steps'
import { FLOW_SPECS } from '@/data/flows'
import {
  PACKET_DURATION,
  PACKET_GAP,
  computeViewBox,
  cycleLength,
  isoRoute,
  packetProgress,
  pointAlong,
  project,
  trimPolyline,
  trimToCubes,
  cubeSilhouette
} from '@/utils/flow-geometry'
import type { FlowSpec } from '@/types/flow'

/** 큐브끼리 겹치지 않고 사이에 연결선이 보이려면 필요한 격자 간격 */
const MIN_DX_WHEN_CLOSE = 0.85
const MIN_DY_WHEN_CLOSE = 1.05
/** 콘텐츠 패널(약 420px)에서 글자가 읽히는 최대 가로 폭 (격자 칸) */
const MAX_WIDTH_UNITS = 4.5

function nodeIds(spec: FlowSpec): Set<string> {
  return new Set(spec.nodes.map((n) => n.id))
}

describe('흐름 다이어그램 데이터', () => {
  const entries = Object.entries(FLOW_SPECS)
  const stepIds = new Set(CURRICULUM_STEPS.map((s) => s.id))

  it('등록된 다이어그램이 있다', () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  describe.each(entries)('%s', (stepId, spec) => {
    it('실제로 있는 스텝에 연결된다', () => {
      expect(stepIds.has(stepId)).toBe(true)
    })

    it('노드 id 가 중복되지 않는다', () => {
      expect(nodeIds(spec).size).toBe(spec.nodes.length)
    })

    it('단계는 2개 이상이고 이름이 중복되지 않는다', () => {
      expect(spec.stages.length).toBeGreaterThanOrEqual(2)
      const titles = spec.stages.map((s) => s.title)
      expect(new Set(titles).size).toBe(titles.length)
    })

    it('연결선 · 패킷 · 배지 · 강조가 모두 있는 노드를 가리킨다', () => {
      const ids = nodeIds(spec)
      const refs = [
        ...spec.edges.flatMap((e) => [e.from, e.to]),
        ...spec.stages.flatMap((stage) => [
          ...stage.packets.flatMap((p) => [p.from, p.to]),
          ...(stage.badges ?? []).map((b) => b.node),
          ...(stage.active ?? []),
          ...(stage.failed ?? []),
          ...(stage.dimmed ?? [])
        ])
      ]
      expect(refs.filter((id) => !ids.has(id))).toEqual([])
    })

    it('큐브끼리 겹치지 않는다', () => {
      const overlaps: string[] = []
      spec.nodes.forEach((a, i) => {
        spec.nodes.slice(i + 1).forEach((b) => {
          const dx = Math.abs(a.x - b.x)
          const dy = Math.abs(a.y - b.y)
          if (dx < MIN_DX_WHEN_CLOSE && dy < MIN_DY_WHEN_CLOSE) overlaps.push(`${a.id}-${b.id}`)
        })
      })
      expect(overlaps).toEqual([])
    })

    it('콘텐츠 패널 폭 안에 들어간다', () => {
      const xs = spec.nodes.map((n) => n.x)
      expect(Math.max(...xs) - Math.min(...xs)).toBeLessThanOrEqual(MAX_WIDTH_UNITS)
    })
  })
})

describe('흐름 다이어그램 계산', () => {
  it('격자 좌표를 픽셀로 바꾼다', () => {
    expect(project(2, 1.3)).toEqual({ x: 200, y: 100 })
  })

  it('가로 2칸 · 세로 1.3칸 이동은 아이소메트릭 축(기울기 ½)이다', () => {
    const a = project(0, 1.3)
    const b = project(2, 0)
    expect(Math.abs((b.y - a.y) / (b.x - a.x))).toBeCloseTo(0.5)
  })

  it('꺾이는 모서리가 다른 큐브와 겹치면 반대쪽으로 꺾는다', () => {
    const from = { x: 0, y: 0 }
    const to = { x: 200, y: 0 }
    const [, corner] = isoRoute(from, to, [{ x: 100, y: 50 }])
    expect(corner).toEqual({ x: 100, y: -50 })
  })

  it('두 모서리가 모두 막히거나 경로가 바깥으로 튀면 직선으로 잇는다', () => {
    expect(isoRoute({ x: 0, y: 0 }, { x: 200, y: 0 }, [{ x: 100, y: 50 }, { x: 100, y: -50 }])).toHaveLength(2)
    expect(isoRoute({ x: 0, y: 0 }, { x: 0, y: 200 })).toHaveLength(2)
  })

  it('연결선은 아이소메트릭 두 축(기울기 ±½)으로만 꺾인다', () => {
    const route = isoRoute({ x: 0, y: 0 }, { x: 200, y: 0 })
    expect(route).toHaveLength(3)
    const [a, corner, b] = route
    expect(Math.abs((corner.y - a.y) / (corner.x - a.x))).toBeCloseTo(0.5)
    expect(Math.abs((b.y - corner.y) / (b.x - corner.x))).toBeCloseTo(0.5)
  })

  it('한 축 위에 있으면 직선으로 잇는다', () => {
    expect(isoRoute({ x: 0, y: 0 }, { x: 100, y: 50 })).toHaveLength(2)
  })

  it('양끝을 잘라도 경로 방향은 그대로다', () => {
    const trimmed = trimPolyline([{ x: 0, y: 0 }, { x: 200, y: 0 }], 30)
    expect(trimmed[0]).toEqual({ x: 30, y: 0 })
    expect(trimmed[trimmed.length - 1]).toEqual({ x: 170, y: 0 })
  })

  it('위쪽 큐브에서 아래쪽 큐브로 가는 선도 화살표 끝이 큐브 윤곽 밖에 있다', () => {
    const from = { x: 200, y: 0 }
    const to = { x: 400, y: 100 }
    const trimmed = trimToCubes([from, to])
    const end = trimmed[trimmed.length - 1]
    const start = trimmed[0]
    const outside = (p: { x: number; y: number }, base: { x: number; y: number }) =>
      cubeSilhouette(base).some((a, i, poly) => {
        const b = poly[(i + 1) % poly.length]
        return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) < 0
      })
    expect(outside(end, to)).toBe(true)
    expect(outside(start, from)).toBe(true)
    expect(end.x).toBeGreaterThan(start.x)
  })

  it('패킷은 꺾인 경로를 길이 비율대로 따라간다', () => {
    const path = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }]
    expect(pointAlong(path, 0.25)).toEqual({ x: 50, y: 0 })
    expect(pointAlong(path, 0.75)).toEqual({ x: 100, y: 50 })
  })

  it('viewBox 는 모든 노드를 담는다', () => {
    const box = computeViewBox([
      { id: 'a', label: 'a', x: 0, y: 0, tone: 'blue' },
      { id: 'b', label: 'b', x: 4, y: 2.6, tone: 'blue' }
    ])
    expect(box.x).toBeLessThan(0)
    expect(box.x + box.width).toBeGreaterThan(project(4, 0).x)
    expect(box.y + box.height).toBeGreaterThan(project(0, 2.6).y)
  })

  it('delay 가 없으면 패킷이 순서대로 출발한다', () => {
    const packets = [
      { from: 'a', to: 'b', kind: 'request' as const },
      { from: 'b', to: 'a', kind: 'response' as const }
    ]
    expect(packetProgress(packets[1], 1, PACKET_GAP - 1)).toBeNull()
    expect(packetProgress(packets[1], 1, PACKET_GAP + PACKET_DURATION / 2)).toBeCloseTo(0.5)
    expect(packetProgress(packets[1], 1, PACKET_GAP + PACKET_DURATION + 1)).toBeNull()
  })

  it('한 바퀴는 마지막 패킷이 도착한 뒤에 끝난다', () => {
    const packets = [
      { from: 'a', to: 'b', kind: 'request' as const },
      { from: 'b', to: 'a', kind: 'response' as const, delay: 2000 }
    ]
    expect(cycleLength(packets)).toBeGreaterThan(2000 + PACKET_DURATION)
  })
})
