<template>
  <div class="learning-environment">
    <!-- 좌측: Content Panel -->
    <div class="content-panel panel">
      <ContentPanel
        :step="currentStep"
        :is-loading="isLoadingStep"
        :current-step-number="currentStep?.order || 0"
        :total-steps="totalSteps"
        :completed-steps="completedSteps"
        @show-hint="handleShowHint"
      />
    </div>

    <!-- 우측: Editor & Console -->
    <div class="editor-section">
      <!-- 상단: Code Editor -->
      <div class="code-editor-panel panel">
        <div v-if="isExecuting" class="execution-overlay">
          <div class="spinner"></div>
          <p>코드 실행 중...</p>
        </div>
        <CodeEditor
          :files="editorFiles"
          :active-file="activeFile"
          :open-tabs="openTabs"
          @update:content="handleContentUpdate"
          @update:active-file="handleFileChange"
          @close-tab="handleCloseTab"
        />
      </div>

      <!-- 하단: Console/Result Panel -->
      <div class="console-panel panel">
        <ConsolePanel
          :execution-result="executionResult"
          :validation-result="validationResult"
          :db-snapshot="dbSnapshot"
        />
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <button
        class="btn-secondary action-button"
        :disabled="!canGoPrevious"
        @click="handlePreviousStep"
      >
        ← 이전 단계
      </button>

      <button
        class="btn-primary action-button"
        :disabled="isExecuting"
        @click="handleCheckAnswer"
      >
        {{ isExecuting ? '실행 중...' : '✓ 정답 확인' }}
      </button>

      <button
        class="btn-secondary action-button"
        :disabled="!canGoNext"
        @click="handleNextStep"
      >
        다음 단계 →
      </button>
    </div>

    <!-- 힌트 모달 -->
    <HintModal
      v-if="selectedHint"
      :is-open="isHintModalOpen"
      :hint="selectedHint"
      @close="closeHintModal"
    />

    <!-- 축하 모달 -->
    <CongratulationsModal
      :is-open="showCongratsModal"
      :current-level="currentLevel"
      :next-level="currentLevel + 1"
      :completed-steps="completedSteps.length"
      @close="showCongratsModal = false"
      @restart="handleRestart"
      @next-level="handleNextLevel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ContentPanel from './ContentPanel.vue'
import CodeEditor from './CodeEditor.vue'
import ConsolePanel from './ConsolePanel.vue'
import HintModal from '@/components/ui/HintModal.vue'
import CongratulationsModal from '@/components/ui/CongratulationsModal.vue'
import { useCurriculum } from '@/composables/use-curriculum'
// import { useRuntime } from '@/composables/use-runtime'
import { useMockRuntime as useRuntime } from '@/composables/use-mock-runtime'
import { useValidator } from '@/composables/use-validator'
import type { RuntimeFile, ExecutionResult, ValidationResult, DBSnapshot } from '@/types/runtime'
import type { Hint } from '@/types/curriculum'

const { 
  currentStep, 
  allSteps, 
  isLoadingStep, 
  loadStep, 
  goToNextStep, 
  goToPreviousStep, 
  markStepCompleted,
  userProgress,
  isAllStepsCompleted,
  currentLevel,
  restartCurriculum
} = useCurriculum()

const totalSteps = computed(() => allSteps.value.length)
const completedSteps = computed(() => userProgress.value.completedSteps)
const { executeCode, isExecuting } = useRuntime()
const { validateStep } = useValidator()

const editorFiles = ref<RuntimeFile[]>([])
const activeFile = ref<string>('')
const openTabs = ref<string[]>([]) // 열린 탭 목록
const executionResult = ref<ExecutionResult | null>(null)
const validationResult = ref<ValidationResult | null>(null)
const dbSnapshot = ref<DBSnapshot | null>(null)
const isHintModalOpen = ref(false)
const selectedHint = ref<Hint | null>(null)
const showCongratsModal = ref(false)

const canGoPrevious = computed(() => {
  return currentStep.value && currentStep.value.order > 1
})

const canGoNext = computed(() => {
  const canGo = validationResult.value?.passed === true
  console.log('canGoNext 계산:', canGo, 'validationResult:', validationResult.value)
  return canGo
})

async function handleCheckAnswer() {
  console.log('=== 정답 확인 시작 ===')
  
  if (!currentStep.value) {
    console.error('현재 단계가 없습니다')
    return
  }

  if (editorFiles.value.length === 0) {
    console.error('편집기에 파일이 없습니다')
    alert('파일이 로드되지 않았습니다. 페이지를 새로고침해주세요.')
    return
  }

  console.log('현재 단계:', currentStep.value.title)
  console.log('파일 목록:', editorFiles.value.map(f => f.name))

  executionResult.value = null
  validationResult.value = null

  try {
    // 코드 실행
    console.log('코드 실행 시작...')
    const result = await executeCode(editorFiles.value)
    console.log('실행 결과:', result)
    executionResult.value = result

    // 검증
    if (result.success) {
      console.log('검증 시작...')
      const validation = await validateStep(
        currentStep.value,
        editorFiles.value,
        result
      )
      console.log('검증 결과:', validation)
      validationResult.value = validation

      // DB 스냅샷 업데이트
      if (validation.passed) {
        console.log('✅ 정답입니다!')
        console.log('다음 단계:', validation.nextStep)
        // 진행 상황 저장
        markStepCompleted(currentStep.value.id)
        
        // 모든 스텝 완료 체크
        if (isAllStepsCompleted.value) {
          console.log('🎉 모든 단계 완료!')
          // 약간의 딜레이 후 축하 모달 표시
          setTimeout(() => {
            showCongratsModal.value = true
          }, 1000)
        }
        
        // TODO: DB 스냅샷 가져오기
        dbSnapshot.value = {
          tables: [],
          timestamp: Date.now()
        }
      } else {
        console.log('❌ 오답입니다.')
        console.log('에러 목록:', validation.errors)
        console.log('힌트:', validation.hints)
      }
    } else {
      console.error('실행 실패:', result.error)
    }
  } catch (error) {
    console.error('정답 확인 중 에러:', error)
    executionResult.value = {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : String(error),
      logs: ['예상치 못한 에러가 발생했습니다']
    }
  }

  console.log('=== 정답 확인 완료 ===')
}

function handleContentUpdate(fileName: string, content: string) {
  const file = editorFiles.value.find(f => f.name === fileName)
  if (file) {
    file.content = content
  }
}

function handleFileChange(fileName: string) {
  // 파일을 활성화하면서 탭에 추가 (중복 체크)
  if (!openTabs.value.includes(fileName)) {
    openTabs.value.push(fileName)
  }
  activeFile.value = fileName
}

function handleCloseTab(fileName: string) {
  const index = openTabs.value.indexOf(fileName)
  if (index === -1) return

  // 탭 제거
  openTabs.value.splice(index, 1)

  // 닫은 탭이 현재 활성 파일이면 다른 탭 활성화
  if (activeFile.value === fileName) {
    if (openTabs.value.length > 0) {
      // 이전 탭 또는 다음 탭 활성화
      const newActiveIndex = Math.max(0, index - 1)
      activeFile.value = openTabs.value[newActiveIndex]
    } else {
      // 모든 탭이 닫혔으면 첫 번째 파일 활성화
      if (editorFiles.value.length > 0) {
        activeFile.value = editorFiles.value[0].name
        openTabs.value.push(activeFile.value)
      }
    }
  }
}

function handleShowHint(level: number) {
  if (!currentStep.value) return
  const hint = currentStep.value.hints.find(h => h.level === level)
  if (hint) {
    selectedHint.value = hint
    isHintModalOpen.value = true
  }
}

function closeHintModal() {
  isHintModalOpen.value = false
  // 모달이 완전히 닫힌 후에 선택된 힌트 초기화
  setTimeout(() => {
    selectedHint.value = null
  }, 300)
}

function handlePreviousStep() {
  goToPreviousStep()
  resetState()
}

function handleNextStep() {
  goToNextStep()
  resetState()
}

function resetState() {
  executionResult.value = null
  validationResult.value = null
  dbSnapshot.value = null

  if (currentStep.value) {
    editorFiles.value = currentStep.value.initialFiles.map(f => ({
      name: f.name,
      path: f.path,
      content: f.content,
      readonly: f.readonly
    }))
    activeFile.value = editorFiles.value[0]?.name || ''
    // 첫 번째 파일을 기본 탭으로 추가
    openTabs.value = activeFile.value ? [activeFile.value] : []
  }
}

function handleRestart() {
  restartCurriculum()
  resetState()
}

function handleNextLevel() {
  // TODO: 다음 레벨(다른 커리큘럼)로 이동
  alert('다음 레벨은 아직 준비 중입니다! 🚀')
  handleRestart()
}

onMounted(async () => {
  await loadStep('step-1')
  resetState()
})
</script>

<style scoped lang="scss">
.learning-environment {
  display: grid;
  grid-template-columns: 500px 1fr;
  grid-template-rows: 1fr auto;
  gap: 16px;
  height: 100%;
  width: 100%;
  background: transparent;
}

.content-panel {
  grid-row: 1 / 2;
  overflow-y: auto;
}

.editor-section {
  grid-row: 1 / 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

.code-editor-panel {
  flex: 2;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.console-panel {
  flex: 1;
  min-height: 200px;
  overflow: hidden;
}

.execution-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
  gap: 16px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    font-size: 16px;
    font-weight: 500;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.action-bar {
  grid-column: 1 / -1;
  grid-row: 2 / 3;
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  :global(.dark) & {
    background: #1e293b;
    border-color: #334155;
  }
}

.action-button {
  min-width: 140px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@media (max-width: 1024px) {
  .learning-environment {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }

  .content-panel {
    max-height: 300px;
  }

  .content-panel,
  .editor-section {
    grid-column: 1 / -1;
  }
}
</style>
