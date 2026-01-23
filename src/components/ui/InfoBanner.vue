<template>
  <div :class="['info-banner', variant]">
    <div class="banner-icon">{{ icon }}</div>
    <div class="banner-content">
      <div class="banner-text" v-html="message"></div>
      <button v-if="dismissible" class="dismiss-button" @click="emit('dismiss')">
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  message: string
  variant?: 'info' | 'warning' | 'success'
  dismissible?: boolean
}

interface Emits {
  (e: 'dismiss'): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  dismissible: false
})

const emit = defineEmits<Emits>()

const icon = computed(() => {
  switch (props.variant) {
    case 'info':
      return 'ℹ️'
    case 'warning':
      return '⚠️'
    case 'success':
      return '✅'
    default:
      return 'ℹ️'
  }
})
</script>

<style scoped lang="scss">
.info-banner {
  display: flex;
  gap: 12px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid;

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

  &.success {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #166534;

    :global(.dark) & {
      background: #14532d;
      border-color: #166534;
      color: #bbf7d0;
    }
  }
}

.banner-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.banner-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.banner-text {
  font-size: 14px;
  line-height: 1.5;

  :deep(strong) {
    font-weight: 600;
  }

  :deep(a) {
    text-decoration: underline;
    
    &:hover {
      opacity: 0.8;
    }
  }
}

.dismiss-button {
  padding: 4px;
  background: transparent;
  border: none;
  color: currentColor;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }
}
</style>
