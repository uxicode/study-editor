<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>🔍 코드 분석 모드</h2>
            <button class="close-button" @click="handleClose">✕</button>
          </div>

          <div class="modal-body">
            <div class="info-section">
              <p class="main-description">
                WebContainers의 제한으로 인해 실제 데이터베이스 실행 대신 
                <strong>코드 패턴을 분석</strong>합니다. 학습 효과는 동일합니다!
              </p>
            </div>

            <div class="divider"></div>

            <div class="info-section">
              <h3>💡 WebContainers란?</h3>
              <p class="sub-description">
                브라우저 안에서 Node.js 개발 환경을 그대로 실행하는 기술
              </p>

              <div class="feature-list">
                <div class="feature-item">
                  <div class="feature-number">1️⃣</div>
                  <div class="feature-content">
                    <h4>WebAssembly (WASM)</h4>
                    <p>Node.js를 WebAssembly로 컴파일해서 브라우저에서 실행</p>
                  </div>
                </div>

                <div class="feature-item">
                  <div class="feature-number">2️⃣</div>
                  <div class="feature-content">
                    <h4>브라우저 가상 파일 시스템</h4>
                    <div class="code-example">
                      <code>/package.json</code>
                      <code>/node_modules</code>
                      <code>/src/index.ts</code>
                    </div>
                    <p>같은 구조를 브라우저 메모리 안에 구현</p>
                  </div>
                </div>

                <div class="feature-item">
                  <div class="feature-number">3️⃣</div>
                  <div class="feature-content">
                    <h4>네이티브에 가까운 실행</h4>
                    <div class="code-example">
                      <code>npm install</code>
                      <code>node index.js</code>
                      <code>vite dev</code>
                    </div>
                    <p>같은 명령을 브라우저 터미널에서 그대로 실행 가능</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-section note-section">
              <div class="note-icon">ℹ️</div>
              <div>
                <strong>참고:</strong> Prisma의 네이티브 바이너리 다운로드 제한으로 인해 
                이 플랫폼에서는 코드 패턴 분석 방식을 사용합니다.
              </div>
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
interface Props {
  isOpen: boolean
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
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
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
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;

  :global(.dark) & {
    border-bottom-color: #374151;
  }

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #111827;

    :global(.dark) & {
      color: #f9fafb;
    }
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
  gap: 24px;
}

.info-section {
  h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;

    :global(.dark) & {
      color: #f9fafb;
    }
  }
}

.main-description {
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  margin: 0;

  :global(.dark) & {
    color: #d1d5db;
  }

  strong {
    color: #0ea5e9;
    font-weight: 600;

    :global(.dark) & {
      color: #38bdf8;
    }
  }
}

.sub-description {
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;

  :global(.dark) & {
    color: #9ca3af;
  }
}

.divider {
  height: 1px;
  background: #e5e7eb;

  :global(.dark) & {
    background: #374151;
  }
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  gap: 16px;
}

.feature-number {
  font-size: 24px;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;

  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;

    :global(.dark) & {
      color: #e5e7eb;
    }
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.5;

    :global(.dark) & {
      color: #9ca3af;
    }
  }
}

.code-example {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 8px 0;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #0ea5e9;

  :global(.dark) & {
    background: #111827;
    border-left-color: #38bdf8;
  }

  code {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    color: #1f2937;

    :global(.dark) & {
      color: #e5e7eb;
    }
  }
}

.note-section {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #eff6ff;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
  font-size: 14px;
  color: #1e40af;
  line-height: 1.5;

  :global(.dark) & {
    background: #1e3a8a;
    border-color: #1e40af;
    color: #bfdbfe;
  }
}

.note-icon {
  font-size: 20px;
  flex-shrink: 0;
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
