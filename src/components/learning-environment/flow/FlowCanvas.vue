<template>
  <svg
    class="flow-canvas"
    :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
    role="img"
    :aria-label="ariaLabel"
  >
    <defs>
      <pattern :id="ids.grid" width="28" height="14" patternUnits="userSpaceOnUse">
        <path d="M0 7 L14 0 L28 7 L14 14 Z" class="grid-line" fill="none" />
      </pattern>
      <radialGradient :id="ids.fade" cx="50%" cy="50%" r="60%">
        <stop offset="55%" stop-color="#fff" />
        <stop offset="100%" stop-color="#000" />
      </radialGradient>
      <mask :id="ids.mask">
        <rect :x="viewBox.x" :y="viewBox.y" :width="viewBox.width" :height="viewBox.height" :fill="`url(#${ids.fade})`" />
      </mask>
      <marker
        :id="ids.arrow"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="9"
        markerHeight="9"
        markerUnits="userSpaceOnUse"
        orient="auto-start-reverse"
      >
        <path d="M1,1.2 L9,5 L1,8.8 Z" class="arrow-head" />
      </marker>
      <template v-for="tone in tones" :key="tone">
        <linearGradient :id="`${ids.prefix}-${tone}-top`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="TONE_SHADES[tone].topLight" />
          <stop offset="100%" :stop-color="TONE_SHADES[tone].top" />
        </linearGradient>
        <linearGradient :id="`${ids.prefix}-${tone}-left`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="TONE_SHADES[tone].side" />
          <stop offset="100%" :stop-color="TONE_SHADES[tone].sideDark" />
        </linearGradient>
        <linearGradient :id="`${ids.prefix}-${tone}-right`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="TONE_SHADES[tone].sideDark" />
          <stop offset="100%" :stop-color="TONE_SHADES[tone].sideDark" stop-opacity="0.85" />
        </linearGradient>
      </template>
    </defs>

    <rect
      :x="viewBox.x"
      :y="viewBox.y"
      :width="viewBox.width"
      :height="viewBox.height"
      :fill="`url(#${ids.grid})`"
      :mask="`url(#${ids.mask})`"
    />

    <!-- 기본 연결선 -->
    <path v-for="edge in edgePaths" :key="edge.key" :d="edge.d" class="edge" />

    <!-- 이 단계의 이동 경로 -->
    <path v-for="route in routePaths" :key="route.key" :d="route.d" class="route" :marker-end="`url(#${ids.arrow})`" />

    <!-- 노드 (뒤쪽부터 그려 앞쪽 큐브가 위에 오도록) -->
    <g
      v-for="node in cubes"
      :key="node.id"
      class="node"
      :class="{ 'is-active': node.active, 'is-failed': node.failed, 'is-dimmed': node.dimmed }"
    >
      <ellipse
        class="node-shadow"
        :cx="node.base.x + 4"
        :cy="node.base.y + CUBE.halfHeight * 0.55"
        :rx="CUBE.halfWidth * 1.05"
        :ry="CUBE.halfHeight * 0.9"
      />
      <ellipse
        v-if="node.active"
        class="node-glow"
        :cx="node.base.x"
        :cy="node.base.y"
        :rx="CUBE.halfWidth + 12"
        :ry="CUBE.halfHeight + 8"
      />
      <path :d="node.shape.left" :fill="`url(#${ids.prefix}-${node.paint}-left)`" />
      <path :d="node.shape.right" :fill="`url(#${ids.prefix}-${node.paint}-right)`" />
      <path :d="node.shape.top" :fill="`url(#${ids.prefix}-${node.paint}-top)`" />
      <path :d="node.shape.highlight" class="cube-highlight" />
      <path :d="node.shape.innerEdge" class="cube-inner-edge" />
      <path :d="node.shape.outline" class="cube-outline" />
      <text v-if="node.icon" :x="node.shape.center.x" :y="node.shape.center.y - 4" class="node-icon">{{ node.icon }}</text>
      <text
        :x="node.shape.center.x"
        :y="node.shape.center.y + (node.icon ? 10 : 4)"
        class="node-label"
        :style="{ fontSize: `${node.labelSize}px` }"
      >
        {{ node.label }}
      </text>
    </g>

    <!-- 배지 -->
    <g v-for="badge in badges" :key="badge.key" class="badge" :class="`badge-${badge.tone}`">
      <rect :x="badge.x - badge.width / 2" :y="badge.y - 9" :width="badge.width" height="18" rx="9" />
      <text :x="badge.x" :y="badge.y + 3.4">{{ badge.text }}</text>
    </g>

    <!-- 이동 중인 패킷 -->
    <g v-for="packet in movingPackets" :key="packet.key" class="packet">
      <circle :cx="packet.point.x" :cy="packet.point.y" r="4.5" :fill="packet.color" />
      <text v-if="packet.label" :x="packet.point.x + 8" :y="packet.point.y - 7" class="packet-label">{{ packet.label }}</text>
    </g>
  </svg>
</template>

<script lang="ts">
/** 같은 화면에 다이어그램이 여러 개여도 SVG defs id 가 겹치지 않게 한다 */
let canvasCount = 0
function nextCanvasId(): number {
  canvasCount += 1
  return canvasCount
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import type { FlowSpec, FlowStage, FlowTone } from '@/types/flow'
import {
  CUBE,
  PACKET_COLORS,
  TONE_SHADES,
  computeViewBox,
  cubeShape,
  cycleLength,
  isoRoute,
  packetProgress,
  pointAlong,
  project,
  roundedPolylinePath,
  textWidth,
  trimToCubes,
  type Point
} from '@/utils/flow-geometry'

interface Props {
  spec: FlowSpec
  stage: FlowStage
  elapsed: number
}

const props = defineProps<Props>()

const uid = nextCanvasId()
const ids = {
  prefix: `flow-${uid}`,
  grid: `flow-${uid}-grid`,
  fade: `flow-${uid}-fade`,
  mask: `flow-${uid}-mask`,
  arrow: `flow-${uid}-arrow`
}

/** 윗면에 라벨이 들어갈 최대 폭과 글자 크기 */
const LABEL_MAX_WIDTH = CUBE.halfWidth * 1.55
const LABEL_SIZE = 10.5
const BADGE_SIZE = 9.5

const viewBox = computed(() => computeViewBox(props.spec.nodes))
const ariaLabel = computed(() => `${props.spec.title}: ${props.stage.title}`)

/** 쓰이는 톤만 그라데이션을 만든다 (실패 표시용 red 포함) */
const tones = computed<FlowTone[]>(() => [...new Set<FlowTone>([...props.spec.nodes.map((n) => n.tone), 'red'])])

const basePoints = computed(() => {
  const map = new Map<string, Point>()
  for (const node of props.spec.nodes) map.set(node.id, project(node.x, node.y))
  return map
})

function routeBetween(fromId: string, toId: string): Point[] | null {
  const from = basePoints.value.get(fromId)
  const to = basePoints.value.get(toId)
  if (!from || !to) return null
  const obstacles = [...basePoints.value.entries()].filter(([id]) => id !== fromId && id !== toId).map(([, p]) => p)
  return trimToCubes(isoRoute(from, to, obstacles))
}

const edgePaths = computed(() =>
  props.spec.edges.flatMap((edge) => {
    const points = routeBetween(edge.from, edge.to)
    return points ? [{ key: `${edge.from}-${edge.to}`, d: roundedPolylinePath(points) }] : []
  })
)

const routePaths = computed(() => {
  const seen = new Set<string>()
  return props.stage.packets.flatMap((packet) => {
    const key = `${packet.from}>${packet.to}`
    if (seen.has(key)) return []
    seen.add(key)
    const points = routeBetween(packet.from, packet.to)
    return points ? [{ key, d: roundedPolylinePath(points) }] : []
  })
})

const cubes = computed(() => {
  const active = new Set(props.stage.active ?? [])
  const failed = new Set(props.stage.failed ?? [])
  const dimmed = new Set(props.stage.dimmed ?? [])
  return [...props.spec.nodes]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((node) => {
      const base = project(node.x, node.y)
      const isFailed = failed.has(node.id)
      const fullWidth = textWidth(node.label, LABEL_SIZE)
      return {
        ...node,
        base,
        shape: cubeShape(base),
        paint: isFailed ? 'red' : node.tone,
        labelSize: fullWidth > LABEL_MAX_WIDTH ? (LABEL_SIZE * LABEL_MAX_WIDTH) / fullWidth : LABEL_SIZE,
        active: active.has(node.id),
        failed: isFailed,
        dimmed: dimmed.has(node.id)
      }
    })
})

const badges = computed(() =>
  (props.stage.badges ?? []).flatMap((badge, index) => {
    const base = basePoints.value.get(badge.node)
    if (!base) return []
    return [
      {
        key: `${badge.node}-${index}`,
        text: badge.text,
        tone: badge.tone ?? 'info',
        x: base.x,
        y: base.y - CUBE.depth - CUBE.halfHeight - 15,
        width: textWidth(badge.text, BADGE_SIZE) + 16
      }
    ]
  })
)

const movingPackets = computed(() => {
  const packets = props.stage.packets
  const inCycle = props.elapsed % cycleLength(packets)
  return packets.flatMap((packet, index) => {
    const progress = packetProgress(packet, index, inCycle)
    if (progress === null) return []
    const points = routeBetween(packet.from, packet.to)
    if (!points) return []
    return [
      {
        key: `${index}`,
        point: pointAlong(points, progress),
        color: PACKET_COLORS[packet.kind],
        label: packet.label
      }
    ]
  })
})
</script>

<style scoped lang="scss">
.flow-canvas {
  display: block;
  width: 100%;
  height: auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

.grid-line {
  stroke: #e2d8c7;
  stroke-width: 0.8;

  html.dark & {
    stroke: #243042;
  }
}

.edge {
  fill: none;
  stroke: #b8afa2;
  stroke-width: 1.2;

  html.dark & {
    stroke: #475569;
  }
}

.route {
  fill: none;
  stroke: #2b2723;
  stroke-width: 1.6;
  stroke-linecap: round;

  html.dark & {
    stroke: #cbd5e1;
  }
}

.arrow-head {
  fill: #2b2723;

  html.dark & {
    fill: #cbd5e1;
  }
}

.node {
  transition: opacity 0.3s ease;

  &.is-dimmed {
    opacity: 0.32;
  }

  &.is-failed .cube-outline {
    stroke: #b42323;
  }
}

.node-shadow {
  fill: #5a4123;
  opacity: 0.13;

  html.dark & {
    fill: #000;
    opacity: 0.35;
  }
}

.node-glow {
  fill: #f6d77a;
  opacity: 0.45;
  animation: glow 1.6s ease-in-out infinite;

  html.dark & {
    fill: #facc15;
    opacity: 0.2;
  }
}

@keyframes glow {
  50% {
    opacity: 0.15;
  }
}

.cube-highlight {
  fill: #fff;
  opacity: 0.28;
}

.cube-inner-edge {
  fill: none;
  stroke: #fff;
  stroke-width: 1.1;
  opacity: 0.7;
}

.cube-outline {
  fill: none;
  stroke: #2b2723;
  stroke-width: 1.4;
  stroke-linejoin: round;

  html.dark & {
    stroke: #0b1220;
  }
}

.node-icon {
  font-size: 12px;
  text-anchor: middle;
}

.node-label {
  font-weight: 700;
  fill: #2b2723;
  text-anchor: middle;
  letter-spacing: -0.2px;
}

.badge {
  rect {
    fill: #fdf3dc;
    stroke: #2b2723;
    stroke-width: 1;
  }

  text {
    font-size: 9.5px;
    font-weight: 600;
    fill: #2b2723;
    text-anchor: middle;
  }

  &.badge-warn rect {
    fill: #fde7cf;
  }

  &.badge-danger rect {
    fill: #fbdcdc;
    stroke: #b42323;
  }

  &.badge-good rect {
    fill: #e1f1d8;
  }
}

.packet circle {
  stroke: #2b2723;
  stroke-width: 1.1;
}

.packet-label {
  font-size: 9px;
  font-weight: 700;
  fill: #2b2723;
  paint-order: stroke;
  stroke: #faf6ee;
  stroke-width: 3px;

  html.dark & {
    fill: #f1f5f9;
    stroke: #0f172a;
  }
}

@media (prefers-reduced-motion: reduce) {
  .node-glow {
    animation: none;
  }
}
</style>
