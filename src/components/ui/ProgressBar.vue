<template>
  <div class="progress-bar-container">
    <div class="progress-header">
      <div class="step-info">
        <span class="step-number">Step {{ currentStep }} / {{ totalSteps }}</span>
        <span v-if="stepTitle" class="step-title">{{ stepTitle }}</span>
      </div>
      <div class="progress-stats">
        <span class="completed-count">{{ completedCount }}개 완료</span>
      </div>
    </div>
    
    <div class="progress-track">
      <div 
        class="progress-fill" 
        :style="{ width: progressPercentage + '%' }"
      ></div>
    </div>

    <div class="step-dots">
      <div
        v-for="step in totalSteps"
        :key="step"
        :class="[
          'step-dot',
          {
            'completed': step < currentStep || isStepCompleted(step),
            'current': step === currentStep,
            'upcoming': step > currentStep
          }
        ]"
        :title="`Step ${step}`"
      >
        <span v-if="step < currentStep || isStepCompleted(step)">✓</span>
        <span v-else>{{ step }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentStep: number
  totalSteps: number
  stepTitle?: string
  completedSteps?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  completedSteps: () => []
})

const progressPercentage = computed(() => {
  return (props.currentStep / props.totalSteps) * 100
})

const completedCount = computed(() => {
  return props.completedSteps.length
})

function isStepCompleted(stepNumber: number): boolean {
  const stepId = `step-${stepNumber}`
  return props.completedSteps.includes(stepId)
}
</script>

<style scoped lang="scss">
.progress-bar-container {
  padding: 8px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  :global(.dark) & {
    background: #1e293b;
    border-color: #334155;
  }
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.step-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-number {
  font-size: 18px;
  font-weight: 700;
  color: #0ea5e9;

  :global(.dark) & {
    color: #7dd3fc;
  }
}

.step-title {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;

  :global(.dark) & {
    color: #9ca3af;
  }
}

.progress-stats {
  font-size: 13px;
  color: #10b981;
  font-weight: 600;

  :global(.dark) & {
    color: #34d399;
  }
}

.progress-track {
  height: 4px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;

  :global(.dark) & {
    background: #374151;
  }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9 0%, #06b6d4 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.step-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.step-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid;
  transition: all 0.3s;
  cursor: default;

  &.completed {
    background: #10b981;
    border-color: #10b981;
    color: white;
    transform: scale(1);

    &:hover {
      transform: scale(1.1);
    }
  }

  &.current {
    background: #0ea5e9;
    border-color: #0ea5e9;
    color: white;
    animation: pulse 2s infinite;
    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7);
  }

  &.upcoming {
    background: white;
    border-color: #d1d5db;
    color: #9ca3af;

    :global(.dark) & {
      background: #334155;
      border-color: #475569;
      color: #94a3b8;
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(14, 165, 233, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0);
  }
}
</style>
