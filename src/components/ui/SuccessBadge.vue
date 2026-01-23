<template>
  <div class="success-badge">
    <div class="badge-icon">🎉</div>
    <div class="badge-content">
      <h3>정답입니다!</h3>
      <p>{{ message }}</p>
      <button v-if="showNextButton" class="next-button" @click="emit('next')">
        다음 단계로 →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  showNextButton?: boolean
}

interface Emits {
  (e: 'next'): void
}

withDefaults(defineProps<Props>(), {
  message: '다음 단계로 진행할 수 있습니다.',
  showNextButton: true
})

const emit = defineEmits<Emits>()
</script>

<style scoped lang="scss">
.success-badge {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #86efac;
  border-radius: 12px;
  animation: slideIn 0.3s ease-out;

  :global(.dark) & {
    background: linear-gradient(135deg, #14532d 0%, #166534 100%);
    border-color: #22c55e;
  }
}

.badge-icon {
  font-size: 48px;
  animation: bounce 0.5s ease-in-out;
}

.badge-content {
  flex: 1;

  h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 700;
    color: #166534;

    :global(.dark) & {
      color: #86efac;
    }
  }

  p {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #15803d;

    :global(.dark) & {
      color: #bbf7d0;
    }
  }
}

.next-button {
  padding: 10px 20px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #16a34a;
    transform: translateX(4px);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
