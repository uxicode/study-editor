<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
      <div class="congrats-modal">
        <!-- 엠블럼 -->
        <div class="emblem-container">
          <div class="emblem">
            <div class="emblem-glow"></div>
            <svg class="emblem-icon" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="url(#gradient)" />
              <path
                d="M 30 50 L 45 65 L 70 35"
                stroke="white"
                stroke-width="6"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <!-- 축하 메시지 -->
        <div class="congrats-content">
          <h2 class="congrats-title">🎉 축하합니다!</h2>
          <p class="congrats-message">
            {{ currentLevel }} 레벨의 모든 단계를 완료하셨습니다!
          </p>
          <div class="level-upgrade">
            <div class="level-box from-level">
              <span class="level-label">현재</span>
              <span class="level-number">{{ currentLevel }}</span>
            </div>
            <div class="arrow">→</div>
            <div class="level-box to-level">
              <span class="level-label">다음</span>
              <span class="level-number">{{ nextLevel }}</span>
            </div>
          </div>

          <!-- 통계 -->
          <div class="stats">
            <div class="stat-item">
              <div class="stat-icon">✓</div>
              <div class="stat-label">완료한 단계</div>
              <div class="stat-value">{{ completedSteps }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🏆</div>
              <div class="stat-label">획득 엠블럼</div>
              <div class="stat-value">Level {{ currentLevel }}</div>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="action-buttons">
            <button class="btn-secondary" @click="handleRestart">
              🔄 처음으로 가 복습하기
            </button>
            <button class="btn-primary" @click="handleNext">
              🚀 다음 레벨로 진행
            </button>
          </div>
        </div>

        <!-- 닫기 버튼 -->
        <button class="close-button" @click="emit('close')" title="닫기">
          ×
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  currentLevel: number
  nextLevel: number
  completedSteps: number
}

interface Emits {
  (e: 'close'): void
  (e: 'restart'): void
  (e: 'next-level'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleRestart() {
  emit('restart')
  emit('close')
}

function handleNext() {
  emit('next-level')
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
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.congrats-modal {
  position: relative;
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

  :global(.dark) & {
    background: #1e293b;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.emblem-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px 20px;
  background: linear-gradient(180deg, #fef3c7 0%, transparent 100%);
  border-radius: 24px 24px 0 0;

  :global(.dark) & {
    background: linear-gradient(180deg, #78350f 0%, transparent 100%);
  }
}

.emblem {
  position: relative;
  width: 120px;
  height: 120px;
  animation: emblem-float 3s ease-in-out infinite;
}

@keyframes emblem-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.emblem-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.emblem-icon {
  position: relative;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 20px rgba(251, 191, 36, 0.3));
  animation: emblem-rotate 20s linear infinite;
}

@keyframes emblem-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.congrats-content {
  padding: 32px;
  text-align: center;
}

.congrats-title {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 16px 0;
  animation: title-bounce 0.6s ease-out 0.2s both;

  :global(.dark) & {
    color: #f9fafb;
  }
}

@keyframes title-bounce {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  50% {
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.congrats-message {
  font-size: 18px;
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.6;

  :global(.dark) & {
    color: #9ca3af;
  }
}

.level-upgrade {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 32px;
  animation: slide-in 0.6s ease-out 0.4s both;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.level-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  min-width: 120px;
  transition: all 0.3s;
}

.from-level {
  background: #f3f4f6;
  border: 2px solid #e5e7eb;

  :global(.dark) & {
    background: #374151;
    border-color: #4b5563;
  }
}

.to-level {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: 2px solid #f59e0b;
  transform: scale(1.05);
  box-shadow: 0 10px 25px -5px rgba(251, 191, 36, 0.4);
}

.level-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  color: #6b7280;

  :global(.dark) & {
    color: #9ca3af;
  }

  .to-level & {
    color: #78350f;
  }
}

.level-number {
  font-size: 36px;
  font-weight: 800;
  color: #111827;

  :global(.dark) & {
    color: #f9fafb;
  }

  .to-level & {
    color: white;
  }
}

.arrow {
  font-size: 32px;
  color: #3b82f6;
  font-weight: bold;
  animation: arrow-move 1s ease-in-out infinite;

  :global(.dark) & {
    color: #60a5fa;
  }
}

@keyframes arrow-move {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
  animation: fade-in 0.6s ease-out 0.6s both;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.stat-item {
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;

  :global(.dark) & {
    background: #0f172a;
    border-color: #334155;
  }
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;

  :global(.dark) & {
    color: #9ca3af;
  }
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;

  :global(.dark) & {
    color: #f9fafb;
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;

  button {
    flex: 1;
    min-width: 200px;
    padding: 14px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.5);
    }
  }

  .btn-secondary {
    &:hover {
      transform: translateY(-2px);
    }
  }
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  font-size: 32px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #111827;
    transform: rotate(90deg);

    :global(.dark) & {
      background: #374151;
      color: #f9fafb;
    }
  }

  :global(.dark) & {
    color: #9ca3af;
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .congrats-modal {
    width: 95%;
    max-width: none;
  }

  .congrats-title {
    font-size: 24px;
  }

  .congrats-message {
    font-size: 16px;
  }

  .level-upgrade {
    flex-direction: column;
    gap: 16px;
  }

  .arrow {
    transform: rotate(90deg);
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;

    button {
      min-width: auto;
      width: 100%;
    }
  }
}
</style>
