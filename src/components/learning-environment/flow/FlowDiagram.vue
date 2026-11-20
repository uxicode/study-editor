<template>
  <div class="flow-diagram">
    <div class="flow-toolbar">
      <div v-if="stage.metrics?.length" class="metrics">
        <div v-for="metric in stage.metrics" :key="metric.label" class="metric" :class="`metric-${metric.tone ?? 'neutral'}`">
          <span class="metric-label">{{ metric.label }}</span>
          <span class="metric-value">{{ metric.value }}</span>
        </div>
      </div>
      <div class="controls">
        <button type="button" class="control" @click="replay" title="이 단계를 처음부터 다시 재생">↻ 다시 보기</button>
        <button type="button" class="control" @click="togglePlay" :aria-pressed="!isPlaying">
          {{ isPlaying ? '❚❚ 일시정지' : '▶ 재생' }}
        </button>
      </div>
    </div>

    <div class="canvas-wrap">
      <FlowCanvas :spec="spec" :stage="stage" :elapsed="elapsed" />
      <ul class="legend" aria-label="범례">
        <li><span class="dot dot-request"></span>요청</li>
        <li><span class="dot dot-response"></span>응답</li>
        <li><span class="dot dot-event"></span>데이터·이벤트</li>
        <li><span class="dot dot-error"></span>실패</li>
      </ul>
    </div>

    <div class="stage-info" aria-live="polite">
      <div class="stage-heading">
        <span class="stage-count">{{ stageIndex + 1 }} / {{ spec.stages.length }}단계</span>
        <strong class="stage-title">{{ stage.title }}</strong>
      </div>
      <div class="stage-description" v-html="descriptionHtml"></div>
    </div>

    <div class="stepper">
      <button type="button" class="nav" :disabled="stageIndex === 0" @click="goTo(stageIndex - 1)" aria-label="이전 단계">←</button>
      <ol class="stepper-list">
        <li v-for="(item, index) in spec.stages" :key="item.title">
          <button
            type="button"
            class="stepper-dot"
            :class="{ 'is-current': index === stageIndex, 'is-done': index < stageIndex }"
            :aria-current="index === stageIndex ? 'step' : undefined"
            :title="item.title"
            @click="goTo(index)"
          >
            {{ index + 1 }}
          </button>
          <span class="stepper-label">{{ item.title }}</span>
        </li>
      </ol>
      <button
        type="button"
        class="nav"
        :disabled="stageIndex === spec.stages.length - 1"
        @click="goTo(stageIndex + 1)"
        aria-label="다음 단계"
      >
        →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FlowSpec } from '@/types/flow'
import { parseMarkdown } from '@/utils/markdown'
import { useFlowPlayback } from '@/composables/use-flow-playback'
import FlowCanvas from './FlowCanvas.vue'

interface Props {
  spec: FlowSpec
}

const props = defineProps<Props>()

const stageIndex = ref(0)
const stage = computed(() => props.spec.stages[stageIndex.value] ?? props.spec.stages[0])
const descriptionHtml = computed(() => parseMarkdown(stage.value.description))

const { elapsed, isPlaying, togglePlay, replay } = useFlowPlayback(stageIndex)

function goTo(index: number) {
  if (index < 0 || index >= props.spec.stages.length) return
  stageIndex.value = index
}

</script>

<style scoped lang="scss">
.flow-diagram {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4dccd;
  border-radius: 12px;
  background: #fbf8f2;

  html.dark & {
    background: #0f172a;
    border-color: #334155;
  }
}

.flow-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.metric {
  display: flex;
  flex-direction: column;
  min-width: 96px;
  padding: 6px 10px;
  border: 1.2px solid #c9c1b3;
  border-radius: 8px;
  background: #fff;

  html.dark & {
    background: #1e293b;
    border-color: #334155;
  }

  &.metric-danger {
    border-left: 4px solid #d64545;
  }

  &.metric-good {
    border-left: 4px solid #5aa84a;
  }
}

.metric-label {
  font-size: 10.5px;
  color: #6b6358;

  html.dark & {
    color: #94a3b8;
  }
}

.metric-value {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;

  html.dark & {
    color: #f1f5f9;
  }

  .metric-danger & {
    color: #c03535;
  }

  .metric-good & {
    color: #3d7f30;
  }

  html.dark .metric-danger & {
    color: #f87171;
  }

  html.dark .metric-good & {
    color: #86efac;
  }
}

.controls {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.control,
.nav {
  padding: 5px 10px;
  border: 1.4px solid #3f3a33;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 2px 2px 0 #3f3a33;
  transition: transform 0.1s ease, box-shadow 0.1s ease;

  &:hover:not(:disabled) {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #3f3a33;
  }

  &:active:not(:disabled) {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #3f3a33;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  html.dark & {
    background: #1e293b;
    color: #e2e8f0;
    border-color: #64748b;
    box-shadow: 2px 2px 0 #64748b;
  }
}

.canvas-wrap {
  position: relative;
  border-radius: 8px;
  background: #f7f1e6;
  border: 1px solid #ebe3d4;
  overflow: hidden;

  html.dark & {
    background: #111c2e;
    border-color: #1e293b;
  }
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 6px 10px;
  list-style: none;
  font-size: 11px;
  color: #6b6358;

  html.dark & {
    color: #94a3b8;
  }

  li {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid #1f2937;
}

.dot-request { background: #ee9455; }
.dot-response { background: #5aa84a; }
.dot-event { background: #e2b13c; }
.dot-error { background: #d64545; }

.stage-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 64px;
}

.stage-heading {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stage-count {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 11px;
  color: #6b6358;

  html.dark & {
    color: #94a3b8;
  }
}

.stage-title {
  font-size: 15px;
  color: #1f2937;

  html.dark & {
    color: #f1f5f9;
  }
}

.stage-description {
  font-size: 13.5px;
  line-height: 1.6;
  color: #4b5563;

  html.dark & {
    color: #cbd5e1;
  }

  :deep(p) {
    margin: 0;
  }

  :deep(code) {
    padding: 1px 5px;
    border-radius: 4px;
    background: #efe9dd;
    font-size: 12px;

    html.dark & {
      background: #1e293b;
    }
  }
}

.stepper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.nav {
  flex-shrink: 0;
  margin-top: 2px;
}

.stepper-list {
  display: flex;
  flex: 1;
  justify-content: space-between;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;

  li {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 52px;
  }
}

.stepper-dot {
  width: 26px;
  height: 26px;
  border: 1.4px solid #3f3a33;
  border-radius: 50%;
  background: #fff;
  color: #3f3a33;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;

  &.is-done {
    background: #e5efd9;
  }

  &.is-current {
    background: #c9e3a5;
    transform: scale(1.12);
    box-shadow: 2px 2px 0 #3f3a33;
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  html.dark & {
    background: #1e293b;
    color: #e2e8f0;
    border-color: #64748b;

    &.is-done {
      background: #1f3a2a;
    }

    &.is-current {
      background: #3f6212;
    }
  }
}

.stepper-label {
  font-size: 10.5px;
  line-height: 1.3;
  text-align: center;
  color: #6b6358;
  word-break: keep-all;

  html.dark & {
    color: #94a3b8;
  }
}
</style>
