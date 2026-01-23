<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <div class="hint-badge">💡 힌트 {{ hint.level }}</div>
            <button class="close-button" @click="handleClose">✕</button>
          </div>

          <div class="modal-body">
            <p class="hint-content">{{ hint.content }}</p>

            <div v-if="hint.codeSnippet" class="code-snippet">
              <div class="snippet-header">📝 코드 예시</div>
              <pre><code>{{ hint.codeSnippet }}</code></pre>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-primary" @click="handleClose">
              확인
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Hint } from '@/types/curriculum'

interface Props {
  isOpen: boolean
  hint: Hint
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleClose() {
  emit('close')
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :global(.dark) & {
    background: #1f2937;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5),
                0 10px 10px -5px rgba(0, 0, 0, 0.3);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;

  :global(.dark) & {
    border-bottom-color: #374151;
  }
}

.hint-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;

  :global(.dark) & {
    background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
    color: #fde68a;
  }
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #111827;

    :global(.dark) & {
      background: #374151;
      color: #f9fafb;
    }
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hint-content {
  font-size: 16px;
  line-height: 1.7;
  color: #374151;
  margin: 0;

  :global(.dark) & {
    color: #d1d5db;
  }
}

.code-snippet {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;

  :global(.dark) & {
    background: #111827;
    border-color: #374151;
  }
}

.snippet-header {
  padding: 12px 16px;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;

  :global(.dark) & {
    background: #1f2937;
    border-bottom-color: #374151;
    color: #f3f4f6;
  }
}

pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;

  code {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    color: #1f2937;

    :global(.dark) & {
      color: #e5e7eb;
    }
  }
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;

  :global(.dark) & {
    border-top-color: #374151;
  }
}

// 트랜지션 애니메이션
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .modal-container {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-container {
    transform: scale(0.95) translateY(-20px);
    opacity: 0;
  }
}
</style>
