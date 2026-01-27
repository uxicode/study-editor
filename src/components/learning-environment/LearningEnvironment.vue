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
        @apply-answer="handleApplyAnswer"
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
      @close="showCongratsModal = false"
      @restart="handleRestart"
      @next-level="handleNextLevel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import ContentPanel from './ContentPanel.vue'
import CodeEditor from './CodeEditor.vue'
import ConsolePanel from './ConsolePanel.vue'
import HintModal from '@/components/ui/HintModal.vue'
import CongratulationsModal from '@/components/ui/CongratulationsModal.vue'
import { useCurriculum } from '@/composables/use-curriculum'
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

const { 
  currentStep, 
  allSteps, 
  isLoadingStep, 
  loadStep, 
  goToNextStep, 
  goToPreviousStep, 
  markStepCompleted,
  userProgress,
  isLevelCompleted,
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

const canGoPrevious = computed(() => {
  return currentStep.value && currentStep.value.order > 1
})

const canGoNext = computed(() => {
  if (!validationResult.value) {
    return false
  }
  const canGo = validationResult.value.passed === true
  console.log('canGoNext 계산:', canGo, 'validationResult:', {
    passed: validationResult.value.passed,
    errors: validationResult.value.errors?.length || 0,
    nextStep: validationResult.value.nextStep
  })
  return canGo
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
  console.log('코드 실행 시작...')
  const result = await executeCode(editorFiles.value)
  console.log('실행 결과:', result)
  executionResult.value = result
  return result
}

/**
 * 검증 실행
 */
async function runValidation(result: ExecutionResult): Promise<ValidationResult> {
  console.log('검증 시작...')
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
  console.log('✅ 정답입니다!')
  
  // 진행 상황 저장 및 상태 업데이트
  await updateProgressState(validation)
  
  // 레벨 완료 체크 및 모달 표시
  handleLevelCompletion()
  
  // 데이터베이스 스냅샷 업데이트 (실패해도 검증에 영향 없음)
  await updateDatabaseSnapshotSafely(result)
}

/**
 * 진행 상황 저장 및 상태 업데이트
 */
async function updateProgressState(validation: ValidationResult): Promise<void> {
  markStepCompleted(currentStep.value!.id)
  validationResult.value = { ...validation }
  await nextTick()
  
  console.log('validationResult 설정 완료:', validationResult.value)
  console.log('canGoNext 상태:', canGoNext.value)
  
  if (!canGoNext.value) {
    console.warn('⚠️ canGoNext가 false입니다. validationResult를 다시 확인합니다.')
    console.log('validationResult 상세:', JSON.stringify(validationResult.value, null, 2))
  }
}

/**
 * 레벨 완료 체크 및 축하 모달 표시
 */
function handleLevelCompletion(): void {
  const shouldShowModal = isLevelCompleted.value && !showCongratsModal.value
  
  if (shouldShowModal) {
    console.log(`🎉 레벨 ${currentLevel.value - 1} 완료! 레벨 ${currentLevel.value}로 진급합니다!`)
    setTimeout(() => {
      if (!showCongratsModal.value) {
        showCongratsModal.value = true
      }
    }, 1000)
  } else {
    console.log('✅ 다음 단계로 이동할 수 있습니다! "다음 단계 →" 버튼을 클릭하세요.')
  }
}

/**
 * 데이터베이스 스냅샷 안전 업데이트
 */
async function updateDatabaseSnapshotSafely(result: ExecutionResult): Promise<void> {
  try {
    console.log('🔄 코드 실행 성공, 데이터베이스 스냅샷 업데이트 중...')
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
  console.log('✨ 정답이 적용되었습니다:', fileList)
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
  
  console.log('✨ 정답이 적용되었습니다:', targetFile.name)
  alert(`✨ 정답 코드가 에디터에 적용되었습니다!\n파일: ${targetFile.name}`)
}

async function handlePreviousStep() {
  await goToPreviousStep()
  await resetState()
}

async function handleNextStep() {
  console.log('🚀 다음 단계로 이동 시작...')
  console.log('현재 스텝:', currentStep.value?.id)
  console.log('검증 결과:', validationResult.value)
  
  if (!validationResult.value?.passed) {
    console.warn('⚠️ 검증이 통과하지 않았습니다. 다음 단계로 이동할 수 없습니다.')
    alert('먼저 현재 단계를 완료해주세요!')
    return
  }
  
  await goToNextStep()
  await resetState()
  console.log('✅ 다음 단계로 이동 완료')
}

// Prisma 스키마를 파싱하여 PGlite에 테이블 생성
// Express.js API를 통해 Prisma → SQL 변환 처리
async function syncPrismaSchemaToDatabase(): Promise<string> {
  try {
    const schemaFile = editorFiles.value.find(f => f.name === 'schema.prisma')
    if (!schemaFile) {
      console.log('⚠️ schema.prisma 파일이 없습니다')
      return ''
    }

    // 데이터베이스 초기화 및 리셋
    await initializeAndResetDatabase()

    // Express.js API 호출하여 Prisma → SQL 변환
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    console.log('📡 Express API 호출:', `${apiUrl}/api/prisma-to-sql`)

    const response = await fetch(`${apiUrl}/api/prisma-to-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        schemaContent: schemaFile.content
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API 요청 실패: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'SQL 변환 실패')
    }

    const { sql, tables } = result

    console.log(`📊 총 ${result.modelsCount || 0}개 모델, ${result.enumsCount || 0}개 enum 발견`)
    
    if (!sql || sql.trim() === '') {
      console.log('ℹ️ 모델이 없습니다. (설정 단계이거나 아직 모델을 정의하지 않았습니다)')
      return ''
    }

    // 서버에서 이미 SQL이 실행되었으므로 추가 작업 없음
    console.log(`✅ ${tables.length}개 테이블이 서버에서 생성되었습니다.`)
    console.log('📝 최종 생성된 SQL:', sql ? `${sql.length}자` : '없음')
    
    return sql
  } catch (error) {
    return handleError(error, {
      level: 'error',
      message: 'Prisma 스키마 동기화 실패',
      fallbackValue: ''
    })
  }
}

/**
 * 데이터베이스 초기화 및 리셋
 */
async function initializeAndResetDatabase(): Promise<void> {
  console.log('🔄 데이터베이스 초기화 중...')
  await initializeDatabase()
  console.log('✅ 데이터베이스 초기화 완료')

  console.log('🔄 기존 테이블 삭제 중...')
  try {
    await Promise.race([
      resetDatabase(),
      new Promise((resolve) => setTimeout(resolve, 1000))
    ])
    console.log('✅ 테이블 삭제 완료')
  } catch (error) {
    handleError(error, {
      level: 'warn',
      message: '테이블 삭제 중 문제 발생 (계속 진행)',
      ignore: true
    })
  }
}


// Prisma 출력에서 데이터 생성 정보를 파싱하여 PGlite에 반영
// Express.js API를 통해 Prisma 출력 → INSERT SQL 변환 처리
async function syncDataFromPrismaOutput(output: string): Promise<void> {
  try {
    console.log('🔍 Prisma 출력 파싱 중...')
    
    if (!output) {
      console.log('⚠️ 출력이 없습니다.')
      return
    }
    
    // 스키마 파일 가져오기
    const schemaFile = editorFiles.value.find(f => f.name === 'schema.prisma')
    if (!schemaFile) {
      console.log('⚠️ schema.prisma 파일이 없습니다.')
      return
    }
    
    // Express.js API 호출하여 Prisma 출력 → INSERT SQL 변환
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    console.log('📡 Express API 호출:', `${apiUrl}/api/prisma-output-to-sql`)

    const response = await fetch(`${apiUrl}/api/prisma-output-to-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        output,
        schemaContent: schemaFile.content
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API 요청 실패: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'INSERT SQL 변환 실패')
    }

    const { insertStatements } = result

    if (!insertStatements || insertStatements.length === 0) {
      console.log('ℹ️ INSERT SQL이 생성되지 않았습니다.')
      return
    }

    console.log(`📦 ${insertStatements.length}개 INSERT SQL 생성됨`)

    // 서버에서 이미 INSERT SQL이 실행되었으므로 추가 작업 없음
    console.log(`✅ ${insertStatements.length}개 INSERT SQL이 서버에서 실행되었습니다.`)
    
    console.log('✅ Prisma 출력 파싱 완료')
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
    console.log('🔄 데이터베이스 스냅샷 업데이트 시작...')
    
    // 1. Prisma 스키마 동기화 및 SQL 생성
    const schemaSQL = await syncSchemaAndGetSQL()
    
    // 2. 데이터베이스 스냅샷 가져오기
    const snapshot = await getSnapshot()
    
    // 3. 스냅샷 객체 생성 및 업데이트
    const newSnapshot = createSnapshot(snapshot.tables, schemaSQL)
    await updateSnapshotReactive(newSnapshot)
    
    // 4. schema.sql 파일을 FileExplorer에 추가/업데이트
    await updateSchemaSqlInFiles(schemaSQL)
    
    // 5. 로깅
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
 * Prisma 스키마 동기화 및 SQL 생성
 */
async function syncSchemaAndGetSQL(): Promise<string> {
  try {
    console.log('🔄 Prisma 스키마 동기화 시작...')
    const schemaSQL = await syncPrismaSchemaToDatabase()
    console.log('✅ Prisma 스키마 동기화 완료, 생성된 SQL:', schemaSQL ? `${schemaSQL.length}자` : '없음')
    return schemaSQL
  } catch (error) {
    // 모델이 없거나 스키마 동기화 실패해도 계속 진행 (스텝 1처럼 모델이 없는 경우 정상)
    return handleError(error, {
      level: 'log',
      message: '스키마 동기화 중 문제 발생 (계속 진행)',
      fallbackValue: ''
    })
  }
}

/**
 * 스냅샷을 반응형으로 업데이트
 */
async function updateSnapshotReactive(snapshot: DBSnapshot): Promise<void> {
  dbSnapshot.value = snapshot
  await nextTick()
  
  console.log('📊 스냅샷 설정 완료:', {
    tables: snapshot.tables.length,
    schemaSQL: snapshot.schemaSQL ? `${snapshot.schemaSQL.length}자` : '없음',
    dbSnapshotValue: dbSnapshot.value ? '설정됨' : 'null'
  })
}

/**
 * schema.sql 파일을 FileExplorer에 추가/업데이트
 */
async function updateSchemaSqlInFiles(schemaSQL: string): Promise<void> {
  if (!schemaSQL || !schemaSQL.trim()) {
    console.warn('⚠️ schemaSQL이 없어서 schema.sql 파일을 추가할 수 없습니다.')
    return
  }
  
  console.log('📄 schema.sql 파일 추가 체크:', {
    hasSchemaSQL: !!schemaSQL,
    schemaSQLLength: schemaSQL.length,
    trimmed: schemaSQL.trim().length
  })
  
  // 파일 업데이트
  editorFiles.value = updateSchemaSqlFile(editorFiles.value, schemaSQL)
  
  // Vue 반응성 보장
  await nextTick()
  
  const fileList = editorFiles.value.map(f => f.name).join(', ')
  console.log('✅ schema.sql 파일이 FileExplorer에 업데이트되었습니다.')
  console.log('📁 FileExplorer 파일 목록:', fileList)
  console.log('✅ FileExplorer UI 업데이트 완료')
}

async function resetState() {
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
  
  // 스텝 변경 시 데이터베이스 스냅샷 업데이트
  if (currentStep.value) {
    await updateDatabaseSnapshot()
  }
}

async function handleRestart() {
  console.log('🔄 처음으로 가 복습하기 - 재시작 중...')
  
  // 축하 모달 닫기 (재시작 시 모달이 다시 뜨는 것 방지)
  showCongratsModal.value = false
  
  // 검증 결과 초기화 (재시작 시 모달이 다시 뜨는 것 방지)
  validationResult.value = null
  
  // 커리큘럼 재시작
  restartCurriculum()
  await resetState()
  
  console.log('✅ 재시작 완료')
}

function handleNextLevel() {
  // TODO: 다음 레벨(다른 커리큘럼)로 이동
  alert('다음 레벨은 아직 준비 중입니다! 🚀')
  handleRestart()
}

// 스키마 파일 변경 감지하여 데이터베이스 업데이트
watch(
  () => editorFiles.value.find(f => f.name === 'schema.prisma')?.content,
  async (newContent, oldContent) => {
    if (newContent && newContent !== oldContent) {
      console.log('Prisma 스키마 변경 감지, 데이터베이스 업데이트 중...')
      await updateDatabaseSnapshot()
    }
  },
  { deep: true }
)

onMounted(async () => {
  await loadStep('step-1')
  await resetState()
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
