<template>
  <div
    class="learning-environment"
    :style="{ '--content-panel-width': contentPanelWidth + 'px' }"
  >
    <!-- 좌측: Content Panel + 우측 가장자리 리사이즈 핸들 -->
    <div class="content-panel panel">
      <ContentPanel
        :step="currentStep"
        :is-loading="isLoadingStep"
        :current-step-number="currentStep?.order || 0"
        :total-steps="totalSteps"
        :completed-steps="completedSteps"
        :is-authenticated="authStore.isAuthenticated"
        @show-hint="handleShowHint"
        @apply-answer="handleApplyAnswer"
      />
      <div
        class="content-panel-resize-handle"
        :class="{ 'is-resizing': isResizingContentPanel }"
        role="separator"
        aria-orientation="vertical"
        :aria-valuenow="contentPanelWidth"
        :aria-valuemin="CONTENT_PANEL_MIN_WIDTH"
        tabindex="0"
        title="드래그하여 좌측 패널 너비 조절"
        @mousedown.prevent="startContentPanelResize"
        @keydown="onContentPanelKeyboardResize"
      >
        <div class="resize-grip" aria-hidden="true"></div>
      </div>
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
          :is-authenticated="authStore.isAuthenticated"
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
        :title="canGoNext ? '다음 단계로 이동' : '먼저 현재 단계를 완료해주세요'"
      >
        다음 단계 →
        <span v-if="!canGoNext" class="tooltip-text">(검증 필요)</span>
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
      :current-level="currentLevel - 1"
      :next-level="currentLevel"
      :completed-steps="completedSteps.length"
      @close="handleCloseCongratsModal"
      @restart="handleRestart"
      @next-level="handleNextLevel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import ContentPanel from './ContentPanel.vue'
import CodeEditor from './CodeEditor.vue'
import ConsolePanel from './ConsolePanel.vue'
import HintModal from '@/components/ui/HintModal.vue'
import CongratulationsModal from '@/components/ui/CongratulationsModal.vue'
import { useCurriculum } from '@/composables/use-curriculum'
import { usePanelResize } from '@/composables/use-panel-resize'
import { LEVEL_STEP_COUNTS } from '@/data/curriculum-steps'
// import { useRuntime } from '@/composables/use-runtime'
import { useMockRuntime as useRuntime } from '@/composables/use-mock-runtime'
import { useValidator } from '@/composables/use-validator'
import { useDatabase } from '@/composables/use-database'
import {
  createSnapshot,
  logSnapshotInfo
} from '@/utils/database-snapshot'
import {
  updateSchemaSqlFile
} from '@/utils/file-manager'
import { prismaToSql, prismaOutputToSql } from '@/services/prisma-api.service'
import { loadRawSqlSchema } from '@/lib/learning'
import {
  cleanCodeSnippet,
  splitCodeSnippetIntoFiles,
  detectCodeSnippetType,
  type CodeFile
} from '@/utils/code-snippet-processor'
import {
  applyMultipleFiles,
  applySingleFile,
  findTargetFile
} from '@/utils/file-applier'
import { handleError } from '@/utils/error-handler'
import type { RuntimeFile, ExecutionResult, ValidationResult, DBSnapshot } from '@/types/runtime'
import type { Hint } from '@/types/curriculum'

const router = useRouter()
const authStore = useAuthStore()

// 좌측 학습 콘텐츠 패널 리사이즈
const CONTENT_PANEL_MIN_WIDTH = 320
const CONTENT_PANEL_DEFAULT_WIDTH = 500
const {
  width: contentPanelWidth,
  isResizing: isResizingContentPanel,
  startResize: startContentPanelResize,
  onKeyboardResize: onContentPanelKeyboardResize
} = usePanelResize({
  initialWidth: CONTENT_PANEL_DEFAULT_WIDTH,
  minWidth: CONTENT_PANEL_MIN_WIDTH,
  // 우측 에디터 영역도 최소한의 공간을 확보 — 화면 너비의 65% 까지만 허용
  maxWidth: (vw) => Math.max(CONTENT_PANEL_MIN_WIDTH, Math.floor(vw * 0.65)),
  storageKey: 'learning-content-panel-width'
})

const {
  currentStep, 
  allSteps, 
  isLoadingStep, 
  loadStep, 
  loadProgress,
  goToNextStep, 
  goToPreviousStep, 
  markStepCompleted,
  userProgress,
  currentLevel,
  restartCurriculum
} = useCurriculum()

const totalSteps = computed(() => allSteps.value.length)
const completedSteps = computed(() => userProgress.value.completedSteps)
const { executeCode, isExecuting } = useRuntime()
const { validateStep } = useValidator()
const { initializeDatabase, getSnapshot, reset: resetDatabase } = useDatabase()

const editorFiles = ref<RuntimeFile[]>([])
const activeFile = ref<string>('')
const openTabs = ref<string[]>([]) // 열린 탭 목록
const executionResult = ref<ExecutionResult | null>(null)
const validationResult = ref<ValidationResult | null>(null)
const dbSnapshot = ref<DBSnapshot | null>(null)
const isHintModalOpen = ref(false)
const selectedHint = ref<Hint | null>(null)
const showCongratsModal = ref(false)
const previousLevel = ref(1)

const canGoPrevious = computed(() => {
  return currentStep.value && currentStep.value.order > 1
})

const canGoNext = computed(() => {
  if (!validationResult.value) {
    return false
  }
  return validationResult.value.passed === true
})

async function handleCheckAnswer() {
  console.log('=== 정답 확인 시작 ===')
  
  // 사전 조건 검사
  if (!validatePreConditions()) return
  
  // 상태 초기화
  resetAnswerState()
  
  try {
    // 1. 코드 실행
    const executionResult = await executeUserCode()
    
    // 2. 실행 실패 시 조기 반환
    if (!executionResult.success) {
      console.error('실행 실패:', executionResult.error)
      return
    }
    
    // 3. 검증 실행
    const validation = await runValidation(executionResult)
    
    // 4. 검증 결과에 따른 처리
    await handleValidationResult(validation, executionResult)
    
  } catch (error) {
    handleExecutionError(error)
  }

  console.log('=== 정답 확인 완료 ===')
}

/**
 * 사전 조건 검사
 */
function validatePreConditions(): boolean {
  if (!currentStep.value) {
    console.error('현재 단계가 없습니다')
    return false
  }

  if (editorFiles.value.length === 0) {
    console.error('편집기에 파일이 없습니다')
    alert('파일이 로드되지 않았습니다. 페이지를 새로고침해주세요.')
    return false
  }

  console.log('현재 단계:', currentStep.value.title)
  console.log('파일 목록:', editorFiles.value.map(f => f.name))
  return true
}

/**
 * 상태 초기화
 */
function resetAnswerState(): void {
  executionResult.value = null
  validationResult.value = null
}

/**
 * 사용자 코드 실행
 */
async function executeUserCode(): Promise<ExecutionResult> {
  // console.log('코드 실행 시작...')
  const result = await executeCode(editorFiles.value)
  // console.log('실행 결과:', result)
  executionResult.value = result
  return result
}

/**
 * 검증 실행
 */
async function runValidation(result: ExecutionResult): Promise<ValidationResult> {
  // console.log('검증 시작...')
  const validation = await validateStep(currentStep.value!, editorFiles.value, result)
  console.log('검증 결과:', validation)
  validationResult.value = validation
  return validation
}

/**
 * 검증 결과 처리
 */
async function handleValidationResult(validation: ValidationResult, result: ExecutionResult): Promise<void> {
  if (!validation.passed) {
    console.log('❌ 오답입니다.')
    console.log('에러 목록:', validation.errors)
    console.log('힌트:', validation.hints)
    return
  }

  // 검증 통과 시 처리
  await handleValidationSuccess(validation, result)
}

/**
 * 검증 성공 시 처리
 */
async function handleValidationSuccess(validation: ValidationResult, result: ExecutionResult): Promise<void> {
  // console.log('✅ 정답입니다!')
  
  // 진행 상황 저장 및 상태 업데이트 (주차 완료 체크 포함)
  await updateProgressState(validation)
  
  // 데이터베이스 스냅샷 업데이트 (실패해도 검증에 영향 없음)
  await updateDatabaseSnapshotSafely(result)
}

/**
 * 진행 상황 저장 및 상태 업데이트
 */
async function updateProgressState(validation: ValidationResult): Promise<void> {
  const oldLevel = currentLevel.value
  markStepCompleted(currentStep.value!.id)
  validationResult.value = { ...validation }
  
  // Vue 반응성 업데이트를 기다림
  await nextTick()
  
  // 주차가 올라갔는지 확인 (nextTick 후에 체크)
  const newLevel = currentLevel.value
  if (newLevel > oldLevel) {
    console.log(`🎉 ${oldLevel}주차 완료! ${newLevel}주차로 진급합니다!`)
    previousLevel.value = newLevel
    
    // 모달 표시 (약간의 지연을 두어 사용자 경험 향상)
    setTimeout(() => {
      if (!showCongratsModal.value) {
        showCongratsModal.value = true
      }
    }, 500)
  }
  
  if (!canGoNext.value) {
    console.warn('⚠️ canGoNext가 false입니다. validationResult를 다시 확인합니다.')
    console.log('validationResult 상세:', JSON.stringify(validationResult.value, null, 2))
  }
}


/**
 * 데이터베이스 스냅샷 안전 업데이트
 */
async function updateDatabaseSnapshotSafely(result: ExecutionResult): Promise<void> {
  try {
    // console.log('🔄 코드 실행 성공, 데이터베이스 스냅샷 업데이트 중...')
    await syncDataFromPrismaOutput(result.output)
    await updateDatabaseSnapshot()
  } catch (error) {
    handleError(error, {
      level: 'warn',
      message: '데이터베이스 스냅샷 업데이트 실패 (무시)',
      ignore: true
    })
  }
}

/**
 * 실행 에러 처리
 */
function handleExecutionError(error: unknown): void {
  handleError(error, {
    level: 'error',
    message: '정답 확인 중 에러',
    onError: (err) => {
      executionResult.value = {
        success: false,
        output: '',
        error: err instanceof Error ? err.message : String(err),
        logs: ['예상치 못한 에러가 발생했습니다']
      }
    }
  })
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

// 탭 닫기 핸들러
function handleCloseTab(fileName: string) {
  const index = openTabs.value.indexOf(fileName)
  if (index === -1) return

  // 탭 제거
  openTabs.value.splice(index, 1)

  // 닫은 탭이 현재 활성 파일이 아니면 종료
  if (activeFile.value !== fileName) return

  // 남은 탭이 있으면 이전/다음 탭 활성화
  if (openTabs.value.length > 0) {
    const newActiveIndex = Math.max(0, index - 1)
    activeFile.value = openTabs.value[newActiveIndex]
    return
  }

  // 모든 탭이 닫혔으면 첫 번째 파일 활성화
  if (editorFiles.value.length === 0) return
  
  activeFile.value = editorFiles.value[0].name
  openTabs.value.push(activeFile.value)
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

async function handleApplyAnswer() {
  if (!currentStep.value || !currentStep.value.hints.length) return
  
  // 1. 마지막 힌트에서 코드 스니펫 가져오기
  const codeSnippet = getAnswerCodeSnippet()
  if (!codeSnippet) {
    return
  }
  
  // 2. 코드 스니펫 정리
  const cleanedSnippet = cleanCodeSnippet(codeSnippet)
  
  // 3. 여러 파일이 섞여 있는지 확인
  const multipleFiles = splitCodeSnippetIntoFiles(cleanedSnippet)
  
  if (multipleFiles.length > 0) {
    // 여러 파일인 경우
    await applyMultipleFilesToEditor(multipleFiles)
  } else {
    // 단일 파일인 경우
    await applySingleFileToEditor(cleanedSnippet)
  }
}

/**
 * 마지막 힌트에서 정답 코드 스니펫 가져오기
 */
function getAnswerCodeSnippet(): string | null {
  if (!currentStep.value || !currentStep.value.hints.length) {
    return null
  }
  
  const lastHint = currentStep.value.hints[currentStep.value.hints.length - 1]
  const codeSnippet = lastHint.codeSnippet
  
  if (!codeSnippet) {
    console.warn('정답 코드가 없습니다')
    return null
  }
  
  return codeSnippet
}

/**
 * 여러 파일에 코드 적용
 */
async function applyMultipleFilesToEditor(files: CodeFile[]): Promise<void> {
  const result = applyMultipleFiles(
    files,
    editorFiles.value,
    openTabs.value,
    activeFile.value
  )
  
  activeFile.value = result.activeFile
  
  if (result.shouldUpdateSnapshot) {
    await updateDatabaseSnapshot()
  }
  
  const fileList = result.appliedFiles.join(', ')
  // console.log('✨ 정답이 적용되었습니다:', fileList)
  alert(`✨ 정답 코드가 에디터에 적용되었습니다!\n파일: ${fileList}`)
}

/**
 * 단일 파일에 코드 적용
 */
async function applySingleFileToEditor(codeSnippet: string): Promise<void> {
  // 코드 스니펫 타입 감지
  const snippetType = detectCodeSnippetType(codeSnippet)
  
  if (!snippetType) {
    console.warn('코드 스니펫 타입을 감지할 수 없습니다')
    alert('정답을 적용할 파일을 찾을 수 없습니다.')
    return
  }
  
  // 타겟 파일 찾기
  const targetFile = findTargetFile(snippetType.targetFile, editorFiles.value)
  
  if (!targetFile) {
    console.warn('정답을 적용할 파일을 찾을 수 없습니다')
    alert('정답을 적용할 파일을 찾을 수 없습니다.')
    return
  }
  
  // 파일에 코드 적용
  const result = applySingleFile(
    targetFile,
    codeSnippet,
    snippetType.isPartialCode,
    openTabs.value
  )
  
  activeFile.value = targetFile.name
  
  if (result.shouldUpdateSnapshot) {
    await updateDatabaseSnapshot()
  }
  
  // console.log('✨ 정답이 적용되었습니다:', targetFile.name)
  alert(`✨ 정답 코드가 에디터에 적용되었습니다!\n파일: ${targetFile.name}`)
}

async function handlePreviousStep() {
  await goToPreviousStep()
  await resetState()
}

async function handleNextStep() {
  // console.log('🚀 다음 단계로 이동 시작...')
  // console.log('현재 스텝:', currentStep.value?.id)
  // console.log('검증 결과:', validationResult.value)
  
  if (!validationResult.value?.passed) {
    console.warn('⚠️ 검증이 통과하지 않았습니다. 다음 단계로 이동할 수 없습니다.')
    alert('먼저 현재 단계를 완료해주세요!')
    return
  }
  
  await goToNextStep()
  await resetState()
  console.log('✅ 다음 단계로 이동 완료')
}

interface SchemaSyncResult {
  schemaSQL: string
  source: 'prisma' | 'sql' | 'none'
}

/**
 * 현재 에디터의 스키마 파일을 인메모리 DB에 반영한다.
 * - schema.prisma 가 있으면 Prisma → MySQL DDL 변환
 * - 없으면 schema.sql 의 원본 SQL 을 적용
 */
async function syncSchemaToDatabase(): Promise<SchemaSyncResult> {
  const prismaFile = editorFiles.value.find((f) => f.name === 'schema.prisma')
  const sqlFile = editorFiles.value.find((f) => f.name === 'schema.sql')

  if (prismaFile) {
    try {
      await initializeAndResetDatabase()
      const sql = await prismaToSql(prismaFile.content)
      return { schemaSQL: sql ?? '', source: 'prisma' }
    } catch (error) {
      return {
        schemaSQL: handleError(error, {
          level: 'error',
          message: 'Prisma 스키마 동기화 실패',
          fallbackValue: ''
        }),
        source: 'prisma'
      }
    }
  }

  if (sqlFile) {
    try {
      await initializeAndResetDatabase()
      const { normalizedSql } = loadRawSqlSchema(sqlFile.content)
      return { schemaSQL: normalizedSql || sqlFile.content, source: 'sql' }
    } catch (error) {
      return {
        schemaSQL: handleError(error, {
          level: 'warn',
          message: 'SQL 스키마 동기화 실패',
          fallbackValue: sqlFile.content
        }),
        source: 'sql'
      }
    }
  }

  return { schemaSQL: '', source: 'none' }
}

/**
 * 데이터베이스 초기화 및 리셋
 */
async function initializeAndResetDatabase(): Promise<void> {
  // console.log('🔄 데이터베이스 초기화 중...')
  await initializeDatabase()
  // console.log('✅ 데이터베이스 초기화 완료')

  try {
    await Promise.race([
      resetDatabase(),
      new Promise((resolve) => setTimeout(resolve, 1000))
    ])
  } catch (error) {
    handleError(error, {
      level: 'warn',
      message: '테이블 삭제 중 문제 발생 (계속 진행)',
      ignore: true
    })
  }
}


// Prisma 출력에서 데이터 생성 정보를 파싱하여 PGlite에 반영 (서비스 호출)
async function syncDataFromPrismaOutput(output: string): Promise<void> {
  try {
    if (!output) return

    const schemaFile = editorFiles.value.find((f) => f.name === 'schema.prisma')
    if (!schemaFile) return

    await prismaOutputToSql(output, schemaFile.content)
  } catch (error) {
    handleError(error, {
      level: 'warn',
      message: 'Prisma 출력 파싱 실패 (무시)',
      ignore: true
    })
  }
}

// 데이터베이스 스냅샷 업데이트
async function updateDatabaseSnapshot() {
  try {
    const { schemaSQL, source } = await syncSchemaToDatabase()
    const snapshot = await getSnapshot()
    const newSnapshot = createSnapshot(snapshot.tables, schemaSQL)
    await updateSnapshotReactive(newSnapshot)

    // Prisma 스키마에서 SQL 을 생성한 경우에만 schema.sql 을 FileExplorer 에 추가 (readonly)
    // schema.sql 원본을 사용 중인 경우 학습자의 편집 파일을 덮어쓰지 않는다
    if (source === 'prisma') {
      await updateSchemaSqlInFiles(schemaSQL)
    }

    logSnapshotInfo(newSnapshot)
  } catch (error) {
    handleError(error, {
      level: 'error',
      message: '데이터베이스 스냅샷 업데이트 실패',
      onError: () => {
        dbSnapshot.value = createSnapshot([], '')
      }
    })
  }
}

/**
 * 스냅샷을 반응형으로 업데이트
 */
async function updateSnapshotReactive(snapshot: DBSnapshot): Promise<void> {
  dbSnapshot.value = snapshot
  await nextTick()
  
  //  console.log('📊 스냅샷 설정 완료:', {
  //   tables: snapshot.tables.length,
  //   schemaSQL: snapshot.schemaSQL ? `${snapshot.schemaSQL.length}자` : '없음',
  //   dbSnapshotValue: dbSnapshot.value ? '설정됨' : 'null'
  // })
}

/**
 * schema.sql 파일을 FileExplorer에 추가/업데이트
 */
async function updateSchemaSqlInFiles(schemaSQL: string): Promise<void> {
  if (!schemaSQL || !schemaSQL.trim()) {
    // schemaSQL이 없는 것은 정상적인 상황일 수 있음 (예: 스텝 1처럼 모델이 없는 경우)
    // 조용하게 처리
    return
  }
  
  // console.log('📄 schema.sql 파일 추가 체크:', {
  //   hasSchemaSQL: !!schemaSQL,
  //   schemaSQLLength: schemaSQL.length,
  //   trimmed: schemaSQL.trim().length
  // })
  
  // 파일 업데이트
  editorFiles.value = updateSchemaSqlFile(editorFiles.value, schemaSQL)
  
  // Vue 반응성 보장
  await nextTick()
}

async function resetState() {
  executionResult.value = null
  validationResult.value = null
  dbSnapshot.value = null

  if (currentStep.value) {
    // editorFiles 를 설정하기 전에 이전 스키마 내용 저장 (watch 중복 트리거 방지)
    const oldPrisma = editorFiles.value.find((f) => f.name === 'schema.prisma')?.content
    const oldSql = editorFiles.value.find((f) => f.name === 'schema.sql')?.content

    editorFiles.value = currentStep.value.initialFiles.map((f) => ({
      name: f.name,
      path: f.path,
      content: f.content,
      readonly: f.readonly
    }))
    activeFile.value = editorFiles.value[0]?.name || ''
    openTabs.value = activeFile.value ? [activeFile.value] : []

    await nextTick()

    const newPrisma = editorFiles.value.find((f) => f.name === 'schema.prisma')?.content
    const newSql = editorFiles.value.find((f) => f.name === 'schema.sql')?.content

    // watch 가 트리거되지 않는 경우 (스키마 내용 동일 or 스키마 파일 자체 없음) 수동 갱신
    const schemaChanged = newPrisma !== oldPrisma || newSql !== oldSql
    if (!schemaChanged) {
      await updateDatabaseSnapshot()
    }
  }
}

async function handleRestart() {
  // console.log('🔄 처음으로 가 복습하기 - 재시작 중...')
  
  // 축하 모달 닫기 (재시작 시 모달이 다시 뜨는 것 방지)
  showCongratsModal.value = false
  
  // 검증 결과 초기화 (재시작 시 모달이 다시 뜨는 것 방지)
  validationResult.value = null
  
  // 이전 주차 초기화
  previousLevel.value = 1
  
  // 커리큘럼 재시작
  restartCurriculum()
  await resetState()
  
  // 재시작 후 현재 주차로 업데이트
  previousLevel.value = currentLevel.value
  
  //  console.log('✅ 재시작 완료')
}

function handleCloseCongratsModal() {
  showCongratsModal.value = false
  // 모달이 닫힐 때 previousLevel을 현재 주차로 업데이트하여 중복 표시 방지
  previousLevel.value = currentLevel.value
}

async function handleNextLevel() {
  const nextLevel = currentLevel.value

  if (nextLevel >= 2 && !authStore.isAuthenticated) {
    showCongratsModal.value = false
    if (confirm('2주차부터는 로그인이 필요합니다. 로그인 페이지로 이동할까요?')) {
      router.push('/login')
    }
    return
  }

  // 다음 주차가 존재하는지 확인 (4주차가 최대)
  if (nextLevel > 4) {
    alert('모든 주차를 완료했습니다! 🎉')
    return
  }
  
  // 다음 주차의 첫 번째 스텝 인덱스 계산
  let firstStepIndex = 0
  for (let level = 1; level < nextLevel; level++) {
    firstStepIndex += LEVEL_STEP_COUNTS[level as keyof typeof LEVEL_STEP_COUNTS] || 0
  }
  
  // 다음 주차의 첫 번째 스텝 찾기
  const nextLevelFirstStep = allSteps.value[firstStepIndex]
  
  if (!nextLevelFirstStep) {
    console.error('다음 주차의 첫 번째 스텝을 찾을 수 없습니다.')
    alert('다음 주차로 이동할 수 없습니다.')
    return
  }
  
  // 모달 닫기
  showCongratsModal.value = false
  previousLevel.value = nextLevel
  
  // 다음 주차의 첫 번째 스텝으로 이동
  await loadStep(nextLevelFirstStep.id)
  await resetState()
  
  console.log(`✅ ${nextLevel}주차의 첫 번째 스텝으로 이동 완료`)
}

// 스키마 파일(schema.prisma / schema.sql) 변경 감지하여 데이터베이스 업데이트
watch(
  () => {
    const prisma = editorFiles.value.find((f) => f.name === 'schema.prisma')?.content ?? ''
    const sql = editorFiles.value.find((f) => f.name === 'schema.sql')?.content ?? ''
    return prisma + '\n---\n' + sql
  },
  async (newKey, oldKey) => {
    if (newKey !== oldKey) {
      await updateDatabaseSnapshot()
    }
  }
)

// 주차 변화 감지 (보조용 - updateProgressState에서 주로 처리)
watch(
  currentLevel,
  (newLevel, oldLevel) => {
    if (oldLevel && newLevel > oldLevel) {
      console.log(`📊 주차 변화 감지: ${oldLevel} → ${newLevel}`)
    }
  },
  { immediate: false }
)

onMounted(async () => {
  // App.vue 의 initAuth 와 경쟁하지 않도록 먼저 await (initAuth 는 idempotent)
  await authStore.initAuth()
  await loadProgress()
  previousLevel.value = currentLevel.value
  await loadStep(userProgress.value.currentStep || 'week-1-1')
  await resetState()
})
</script>

<style scoped lang="scss">
.learning-environment {
  position: relative;
  display: grid;
  grid-template-columns: var(--content-panel-width, 500px) 1fr;
  grid-template-rows: 1fr auto;
  gap: 16px;
  height: 100%;
  width: 100%;
  background: transparent;
}

.content-panel {
  grid-row: 1 / 2;
  position: relative;
  // 내부 ContentPanel 이 자체 스크롤(overflow-y: auto)을 가지고 있으므로
  // 여기서는 overflow 를 visible 로 유지해야 우측 가장자리에 걸린 리사이즈 핸들이
  // 잘리지 않는다.
  overflow: visible;
}

.content-panel-resize-handle {
  // .content-panel 의 오른쪽 경계를 정확히 가운데로 가로지르는 12px 의 hit area.
  // 패널 안쪽 6px, gap(16px) 쪽 6px → 좌우 어느 쪽으로 호버해도 잡힘.
  position: absolute;
  top: 0;
  right: -6px;
  width: 12px;
  height: 100%;
  cursor: col-resize;
  background: transparent;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;

  .resize-grip {
    background: #cbd5e1;
    opacity: 0.55;
  }

  &:hover,
  &.is-resizing {
    background: rgba(59, 130, 246, 0.15);

    .resize-grip {
      background: #3b82f6;
      opacity: 1;
      width: 3px;
    }
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
  }

  :global(.dark) & {
    .resize-grip {
      background: #475569;
    }

    &:hover,
    &.is-resizing {
      background: rgba(96, 165, 250, 0.22);

      .resize-grip {
        background: #60a5fa;
      }
    }
  }
}

.resize-grip {
  width: 2px;
  height: 48px;
  border-radius: 2px;
  transition: background-color 0.15s ease, opacity 0.15s ease, width 0.15s ease;
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

  // 단열 레이아웃에서는 가로 리사이즈가 의미 없음 → 숨김
  .content-panel-resize-handle {
    display: none;
  }
}
</style>
