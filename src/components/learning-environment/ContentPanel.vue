<template>
  <div class="content-panel-container">
    <!-- 프로그레스 표시 -->
    <div v-if="!isLoading && step" class="progress-indicator">
      <div class="progress-text">Step {{ currentStepNumber }}/{{ totalSteps }}</div>
      <div class="progress-bar-mini">
        <div 
          class="progress-fill" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>로딩 중...</p>
    </div>

    <div v-else-if="step" class="content-wrapper">
      <!-- 단계 헤더 -->
      <div class="step-header">
        <span class="step-badge">{{ step.category }}</span>
        <h2 class="step-title">Step {{ currentStepNumber }}. {{ cleanTitle(step.title) }}</h2>
      </div>

      <!-- 미션 -->
      <section class="content-section mission-section">
        <h3 class="section-title">🎯 미션</h3>
        <div class="section-content" v-html="formatMarkdown(step.content.mission)"></div>
      </section>

      <!-- 학습 목표 -->
      <section class="content-section objectives-section">
        <h3 class="section-title">📚 학습 목표</h3>
        <ul class="objectives-list">
          <li v-for="(objective, idx) in step.content.objectives" :key="idx">
            {{ objective }}
          </li>
        </ul>
      </section>

      <!-- 이론 설명 -->
      <section class="content-section theory-section">
        <h3 class="section-title">💡 이론</h3>
        <div class="section-content" v-html="formatMarkdown(step.content.theory)"></div>
      </section>

      <!-- 연습문제 -->
      <section v-if="displayExercise" class="content-section exercise-section">
        <h3 class="section-title">📝 연습문제</h3>
        <div class="section-content" v-html="formatMarkdown(displayExercise)"></div>
      </section>

      <!-- 예상 출력 -->
      <section v-if="step.content.expectedOutput" class="content-section expected-section">
        <h3 class="section-title">✅ 예상 결과</h3>
        <pre class="code-block">{{ step.content.expectedOutput }}</pre>
      </section>

      <!-- 힌트 및 정답 버튼 (로그인 회원만) -->
      <div v-if="isAuthenticated" class="hint-buttons">
        <button
          v-for="hint in step.hints"
          :key="hint.level"
          class="btn-hint"
          @click="emit('showHint', hint.level)"
        >
          💡 힌트 {{ hint.level }}
        </button>
        
        <!-- 정답 보기 버튼 (마지막 힌트가 있을 때만 표시) -->
        <button
          v-if="step.hints.length > 0 && step.hints[step.hints.length - 1].codeSnippet"
          class="btn-answer"
          @click="emit('applyAnswer')"
        >
          ✨ 정답 보기 및 적용
        </button>
      </div>
      <p v-else-if="step.hints.length > 0" class="hint-login-message">
        💡 힌트는 로그인한 회원만 볼 수 있습니다.
      </p>
    </div>

    <div v-else class="empty-state">
      <p>단계를 선택해주세요</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CurriculumStep } from '@/types/curriculum'

interface Props {
  step: CurriculumStep | null
  isLoading: boolean
  currentStepNumber: number
  totalSteps: number
  completedSteps: string[]
  isAuthenticated: boolean
}

interface Emits {
  (e: 'showHint', level: number): void
  (e: 'applyAnswer'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

import { parseMarkdown } from '@/utils/markdown'

function formatMarkdown(text: string): string {
  return parseMarkdown(text)
}

function cleanTitle(title: string): string {
  return title.replace(/^\d+주차\s*·\s*/, '')
}

const progressPercentage = computed(() => {
  if (props.totalSteps === 0) return 0
  return (props.completedSteps.length / props.totalSteps) * 100
})

const displayExercise = computed(() => {
  if (!props.step) return ''
  if (props.step.content.exercise) {
    return props.step.content.exercise
  }
  if (props.step.validator && props.step.validator.staticChecks) {
    return props.step.validator.staticChecks
      .map((check, index) => `${index + 1}. ${check.message}`)
      .join('\n')
  }
  return ''
})
</script>

<style scoped lang="scss">
.content-panel-container {
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  background: white;
  position: relative;

  :global(.dark) & {
    background: #1e293b;
  }
}

.progress-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  z-index: 10;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 0.5px;

  :global(.dark) & {
    color: #9ca3af;
  }
}

.progress-bar-mini {
  width: 100px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;

  :global(.dark) & {
    background: #374151;
  }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  border-radius: 2px;
  transition: width 0.3s ease;

  :global(.dark) & {
    background: linear-gradient(90deg, #60a5fa, #3b82f6);
  }
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-header {
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 16px;

  :global(.dark) & {
    border-bottom-color: #374151;
  }
}

.step-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;

  :global(.dark) & {
    background: #1e3a8a;
    color: #93c5fd;
  }
}

.step-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;

  :global(.dark) & {
    color: #f9fafb;
  }
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0;

  :global(.dark) & {
    color: #d1d5db;
  }
}

.section-content {
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;

  :global(.dark) & {
    color: #9ca3af;
  }

  :deep(pre.code-block), :deep(pre) {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px 16px;
    margin: 16px 0;
    overflow-x: auto;
    font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.5;

    code {
      background: transparent;
      padding: 0;
      border-radius: 0;
      color: #0f172a;
      white-space: pre;
    }

    :global(.dark) & {
      background: #0f172a;
      border-color: #334155;

      code {
        color: #f8fafc;
      }
    }
  }

  :deep(code) {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 13px;

    :global(.dark) & {
      background: #374151;
      color: #f3f4f6;
    }
  }

  :deep(blockquote) {
    border-left: 4px solid #3b82f6;
    background: #eff6ff;
    padding: 12px 16px;
    margin: 16px 0;
    border-radius: 0 8px 8px 0;

    :global(.dark) & {
      background: #1e3a8a33;
      border-left-color: #60a5fa;
    }
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 14px;

    th,
    td {
      padding: 8px 12px;
      text-align: left;
      border: 1px solid #e5e7eb;

      :global(.dark) & {
        border-color: #374151;
      }
    }

    th {
      background: #f9fafb;
      font-weight: 600;
      color: #111827;

      :global(.dark) & {
        background: #1f2937;
        color: #f9fafb;
      }
    }

    td {
      background: white;

      :global(.dark) & {
        background: #111827;
      }
    }

    tr:nth-child(even) td {
      background: #f9fafb;

      :global(.dark) & {
        background: #1f2937;
      }
    }
  }
}

.objectives-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    padding-left: 24px;
    position: relative;
    font-size: 14px;
    color: #4b5563;

    :global(.dark) & {
      color: #9ca3af;
    }

    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
    }
  }
}

.code-block {
  background: #1f2937;
  color: #e5e7eb;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  overflow-x: auto;
  margin: 0;
}

.hint-login-message {
  font-size: 14px;
  color: #6b7280;
  margin-top: 12px;
}

.hint-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-hint {
  padding: 8px 16px;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fde68a;
  }

  :global(.dark) & {
    background: #78350f;
    color: #fde68a;
    border-color: #92400e;

    &:hover {
      background: #92400e;
    }
  }
}

.btn-answer {
  padding: 8px 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  :global(.dark) & {
    background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  }
}
</style>
