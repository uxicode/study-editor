<template>
  <div :class="['error-message', variant]">
    <div class="error-icon">{{ icon }}</div>
    <div class="error-content">
      <h3 v-if="title" class="error-title">{{ title }}</h3>
      <p class="error-text">{{ message }}</p>
      <button v-if="retry" class="retry-button" @click="emit('retry')">
        🔄 다시 시도
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  message: string
  variant?: 'error' | 'warning' | 'info'
  retry?: boolean
}

interface Emits {
  (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'error',
  retry: false
})

const emit = defineEmits<Emits>()

const icon = computed(() => {
  switch (props.variant) {
    case 'error':
      return '❌'
    case 'warning':
      return '⚠️'
    case 'info':
      return 'ℹ️'
    default:
      return '❌'
  }
})
</script>

<style scoped lang="scss">
.error-message {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid;

  &.error {
    background: #fef2f2;
    border-color: #fecaca;
    color: #991b1b;

    :global(.dark) & {
      background: #7f1d1d;
      border-color: #991b1b;
      color: #fecaca;
    }
  }

  &.warning {
    background: #fffbeb;
    border-color: #fde68a;
    color: #92400e;

    :global(.dark) & {
      background: #78350f;
      border-color: #92400e;
      color: #fde68a;
    }
  }

  &.info {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1e40af;

    :global(.dark) & {
      background: #1e3a8a;
      border-color: #1e40af;
      color: #bfdbfe;
    }
  }
}

.error-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.error-text {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.retry-button {
  align-self: flex-start;
  padding: 6px 12px;
  background: currentColor;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}
</style>
