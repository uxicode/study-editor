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
  extractModelName,
  extractTableNameFromSchema
} from '@/utils/prisma-schema-parser'
import {
  extractObjectPatterns,
  convertJsObjectToJSON,
  extractModelFieldNames,
  filterValidFields,
  convertDateFields
} from '@/utils/prisma-output-parser'
import {
  generateInsertSQL,
  prepareInsertData
} from '@/utils/sql-data-inserter'
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
const { initializeDatabase, getSnapshot, reset: resetDatabase, executeQuery } = useDatabase()

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

    // 검증 (데이터베이스 스냅샷 업데이트와 독립적으로 실행)
    if (result.success) {
      console.log('검증 시작...')
      const validation = await validateStep(
        currentStep.value,
        editorFiles.value,
        result
      )
      console.log('검증 결과:', validation)
      validationResult.value = validation

      // 검증 통과 시 처리
      if (validation.passed) {
        console.log('✅ 정답입니다!')
        console.log('다음 단계:', validation.nextStep)
        console.log('validationResult 설정 전:', validationResult.value)
        
        // 진행 상황 저장
        markStepCompleted(currentStep.value.id)
        
        // validationResult를 명시적으로 설정 (이미 위에서 설정했지만 확실히)
        validationResult.value = { ...validation }
        
        // Vue reactivity를 위해 nextTick 사용
        await nextTick()
        
        console.log('validationResult 설정 후:', validationResult.value)
        console.log('canGoNext 상태:', canGoNext.value)
        
        // canGoNext가 여전히 false인 경우 강제로 업데이트
        if (!canGoNext.value) {
          console.warn('⚠️ canGoNext가 false입니다. validationResult를 다시 확인합니다.')
          console.log('validationResult 상세:', JSON.stringify(validationResult.value, null, 2))
        }
        
        // 레벨 완료 체크 (레벨 1의 모든 스텝 완료 시)
        // 단, 이미 모달이 열려있지 않은 경우에만 표시 (재시작 시 모달이 다시 뜨는 것 방지)
        if (isLevelCompleted.value && !showCongratsModal.value) {
          console.log(`🎉 레벨 ${currentLevel.value - 1} 완료! 레벨 ${currentLevel.value}로 진급합니다!`)
          // 약간의 딜레이 후 축하 모달 표시
          setTimeout(() => {
            // 재시작 중이 아닌 경우에만 모달 표시
            if (!showCongratsModal.value) {
              showCongratsModal.value = true
            }
          }, 1000)
        } else {
          // 다음 단계로 이동 가능하다는 메시지 표시
          console.log('✅ 다음 단계로 이동할 수 있습니다! "다음 단계 →" 버튼을 클릭하세요.')
        }
        
        // 데이터베이스 스냅샷 업데이트 (검증과 독립적으로, 실패해도 검증에는 영향 없음)
        try {
          console.log('🔄 코드 실행 성공, 데이터베이스 스냅샷 업데이트 중...')
          await syncDataFromPrismaOutput(result.output)
          await updateDatabaseSnapshot()
        } catch (dbError) {
          // 데이터베이스 업데이트 실패는 검증에 영향을 주지 않음
          console.warn('⚠️ 데이터베이스 스냅샷 업데이트 실패 (무시):', dbError)
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

    // 각 테이블에 대해 SQL 실행
    for (const table of tables) {
      console.log(`🚀 테이블 생성 실행 시작: ${table.name}`)
      await executeQuery(table.sql)
      console.log(`✅ 테이블 생성 완료: ${table.name}`)
    }
    
    console.log('✅ 모든 테이블 생성 완료')
    console.log('📝 최종 생성된 SQL:', sql ? `${sql.length}자` : '없음')
    
    return sql
  } catch (error) {
    console.error('❌ Prisma 스키마 동기화 실패:', error)
    return ''
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
    console.warn('⚠️ 테이블 삭제 중 문제 발생 (계속 진행):', error)
  }
}


// Prisma 출력에서 데이터 생성 정보를 파싱하여 PGlite에 반영
async function syncDataFromPrismaOutput(output: string) {
  try {
    console.log('🔍 Prisma 출력 파싱 중...')
    
    if (!output) {
      console.log('⚠️ 출력이 없습니다.')
      return
    }
    
    // 스키마 파일 및 모델 정보 가져오기
    const schemaInfo = getSchemaInfo()
    if (!schemaInfo) {
      return
    }
    
    const { schemaContent, modelName, tableName } = schemaInfo
    
    // 출력에서 객체 패턴 추출
    const objectPatterns = extractObjectPatterns(output)
    
    if (objectPatterns.length === 0) {
      console.log('ℹ️ 출력에서 데이터 객체를 찾을 수 없습니다.')
      console.log('📝 출력 내용:', output.substring(0, 500))
      return
    }
    
    console.log(`📦 ${objectPatterns.length}개 객체 패턴 발견`)
    
    // 필드명 추출
    const fieldNames = extractModelFieldNames(schemaContent, modelName)
    
    // 각 객체를 파싱하여 데이터베이스에 삽입
    for (const objStr of objectPatterns) {
      await processAndInsertObject(objStr, fieldNames, tableName)
    }
    
    console.log('✅ Prisma 출력 파싱 완료')
  } catch (error) {
    console.warn('⚠️ Prisma 출력 파싱 실패 (무시):', error)
  }
}

/**
 * 스키마 정보 가져오기
 */
function getSchemaInfo(): { schemaContent: string; modelName: string; tableName: string } | null {
  const schemaFile = editorFiles.value.find(f => f.name === 'schema.prisma')
  if (!schemaFile) {
    return null
  }
  
  const modelName = extractModelName(schemaFile.content)
  if (!modelName) {
    return null
  }
  
  const tableName = extractTableNameFromSchema(schemaFile.content, modelName)
  
  return {
    schemaContent: schemaFile.content,
    modelName,
    tableName
  }
}

/**
 * 객체 문자열을 파싱하여 데이터베이스에 삽입
 */
async function processAndInsertObject(
  objStr: string,
  validFieldNames: string[],
  tableName: string
): Promise<void> {
  try {
    // JavaScript 객체를 JSON으로 변환
    const data = convertJsObjectToJSON(objStr)
    if (!data) {
      console.log('⚠️ 객체 파싱 실패 (무시):', objStr.substring(0, 100))
      return
    }
    
    // 유효한 필드만 필터링
    const validData = filterValidFields(data, validFieldNames)
    
    if (Object.keys(validData).length === 0) {
      console.log('⚠️ 유효한 필드가 없습니다:', Object.keys(data))
      return
    }
    
    // 날짜 필드 변환
    const convertedData = convertDateFields(validData)
    
    // INSERT SQL 생성 및 실행
    const { columns, values } = prepareInsertData(convertedData)
    const insertSQL = generateInsertSQL(tableName, columns, values)
    
    await executeQuery(insertSQL, values)
    console.log(`✅ 데이터 삽입 완료: ${tableName}`, Object.fromEntries(columns.map((c, i) => [c, values[i]])))
  } catch (error) {
    console.log('⚠️ 데이터 삽입 실패 (무시):', error)
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
    console.error('❌ 데이터베이스 스냅샷 업데이트 실패:', error)
    dbSnapshot.value = createSnapshot([], '')
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
    console.log('ℹ️ 스키마 동기화 중 문제 발생 (계속 진행):', error)
    return ''
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
