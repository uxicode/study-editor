<template>
  <div class="loading-spinner-container">
    <div :class="['spinner', size]"></div>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

withDefaults(defineProps<Props>(), {
  size: 'medium'
})
</script>

<style scoped lang="scss">
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.spinner {
  border-radius: 50%;
  border-style: solid;
  border-color: #e5e7eb;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;

  &.small {
    width: 24px;
    height: 24px;
    border-width: 3px;
  }

  &.medium {
    width: 40px;
    height: 40px;
    border-width: 4px;
  }

  &.large {
    width: 60px;
    height: 60px;
    border-width: 5px;
  }
}

.message {
  color: #6b7280;
  font-size: 14px;
  margin: 0;

  :global(.dark) & {
    color: #9ca3af;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
