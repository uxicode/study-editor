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
        if (isLevelCompleted.value) {
          console.log(`🎉 레벨 ${currentLevel.value - 1} 완료! 레벨 ${currentLevel.value}로 진급합니다!`)
          // 약간의 딜레이 후 축하 모달 표시
          setTimeout(() => {
            showCongratsModal.value = true
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
  
  // 마지막 힌트(정답)의 코드 스니펫 가져오기
  const lastHint = currentStep.value.hints[currentStep.value.hints.length - 1]
  let codeSnippet = lastHint.codeSnippet
  
  if (!codeSnippet) {
    console.warn('정답 코드가 없습니다')
    return
  }
  
  // ❌ 잘못된 방법 부분 제거 (있다면)
  if (codeSnippet.includes('❌')) {
    const wrongMethodIndex = codeSnippet.indexOf('❌')
    if (wrongMethodIndex > 0) {
      const lines = codeSnippet.substring(0, wrongMethodIndex).split('\n')
      // 마지막 빈 줄과 주석 제거
      while (lines.length > 0 && (!lines[lines.length - 1].trim() || lines[lines.length - 1].startsWith('//'))) {
        lines.pop()
      }
      codeSnippet = lines.join('\n').trim()
    }
  }
  
  // ✅ 표시 제거 (있다면)
  codeSnippet = codeSnippet.replace(/\/\/ ✅.*\n/g, '')
  
  // 여러 파일이 섞여 있는지 확인 (// schema.prisma, // app.js 등 파일 구분자 확인)
  const filePattern = /\/\/\s*(schema\.prisma|app\.js|\.env)\s*\n/gi
  const fileMatches = [...codeSnippet.matchAll(filePattern)]
  
  if (fileMatches.length > 1) {
    // 여러 파일이 섞여 있는 경우 분리하여 각각 적용
    const files: { name: string; content: string }[] = []
    
    // 각 파일 구분자 위치를 기준으로 분리
    for (let i = 0; i < fileMatches.length; i++) {
      const match = fileMatches[i]
      const fileName = match[1] // schema.prisma, app.js, .env
      const startIndex = match.index! + match[0].length
      const endIndex = i < fileMatches.length - 1 
        ? fileMatches[i + 1].index! 
        : codeSnippet.length
      
      const content = codeSnippet.substring(startIndex, endIndex).trim()
      
      if (content) {
        // 파일명 정규화 (schema.prisma -> schema.prisma, app.js -> app.js)
        const normalizedName = fileName === 'schema.prisma' ? 'schema.prisma' 
          : fileName === 'app.js' ? 'app.js'
          : fileName === '.env' ? '.env'
          : fileName
        
        files.push({
          name: normalizedName,
          content
        })
      }
    }
    
    // 각 파일에 적용
    let appliedFiles: string[] = []
    for (const file of files) {
      const targetFile = editorFiles.value.find(f => f.name === file.name)
      if (targetFile && !targetFile.readonly) {
        targetFile.content = file.content
        
        // 해당 파일을 활성화 (탭 열기 및 활성화)
        if (!openTabs.value.includes(targetFile.name)) {
          openTabs.value.push(targetFile.name)
        }
        appliedFiles.push(targetFile.name)
      }
    }
    
    // 첫 번째 적용된 파일을 활성화
    if (appliedFiles.length > 0) {
      activeFile.value = appliedFiles[0]
    }
    
    // schema.prisma 파일이 적용되었으면 데이터베이스 스냅샷 업데이트
    if (appliedFiles.includes('schema.prisma')) {
      await updateDatabaseSnapshot()
    }
    
    console.log('✨ 정답이 적용되었습니다:', appliedFiles.join(', '))
    alert(`✨ 정답 코드가 에디터에 적용되었습니다!\n파일: ${appliedFiles.join(', ')}`)
  } else {
    // 단일 파일인 경우 기존 로직 사용
    // 코드 스니펫 내용을 분석하여 타겟 파일 결정
    let targetFileName = ''
    let isPartialCode = false // 부분 코드인지 여부
    
    // Prisma 스키마 코드인지 확인
    if (codeSnippet.includes('model ') || 
        codeSnippet.includes('enum ') || 
        codeSnippet.includes('generator client') ||
        codeSnippet.includes('datasource db')) {
      targetFileName = 'schema.prisma'
      
      // generator와 datasource가 모두 있으면 전체 파일, 아니면 부분 코드
      isPartialCode = !(codeSnippet.includes('generator client') && codeSnippet.includes('datasource db'))
    }
    // JavaScript/Node 코드인지 확인
    else if (codeSnippet.includes('prisma.') || 
             codeSnippet.includes('PrismaClient') ||
             codeSnippet.includes('import') ||
             codeSnippet.includes('async function')) {
      targetFileName = 'app.js'
      
      // import와 함수가 모두 있으면 전체 파일
      isPartialCode = !(codeSnippet.includes('import') && codeSnippet.includes('async function'))
    }
    
    // 타겟 파일 찾기
    let targetFile = editorFiles.value.find(f => f.name === targetFileName)
    
    // 타겟 파일을 찾지 못했으면 readonly가 아닌 첫 번째 파일 사용
    if (!targetFile) {
      targetFile = editorFiles.value.find(f => !f.readonly)
    }
    
    if (targetFile) {
      if (isPartialCode && targetFileName === 'schema.prisma') {
        // Prisma 스키마의 부분 코드인 경우 스마트 병합
        const currentContent = targetFile.content
        let newContent = currentContent
        
        // datasource db 블록만 있는 경우
        if (codeSnippet.includes('datasource db') && !codeSnippet.includes('generator client')) {
          // 기존 파일에서 datasource db 블록 찾아서 교체
          const datasourceRegex = /datasource\s+db\s*\{[^}]*\}/s
          if (datasourceRegex.test(currentContent)) {
            // 기존 datasource 블록 교체
            newContent = currentContent.replace(datasourceRegex, codeSnippet.trim())
          } else {
            // datasource 블록 없으면 끝에 추가
            newContent = currentContent + '\n\n' + codeSnippet.trim()
          }
        }
        // model 정의만 있는 경우
        else if (codeSnippet.includes('model ')) {
          // 모델명 추출
          const modelMatch = codeSnippet.match(/model\s+(\w+)/)
          if (modelMatch) {
            const modelName = modelMatch[1]
            const modelRegex = new RegExp(`model\\s+${modelName}\\s*\\{[^}]*\\}`, 's')
            
            if (modelRegex.test(currentContent)) {
              // 기존 모델 교체
              newContent = currentContent.replace(modelRegex, codeSnippet.trim())
            } else {
              // 모델 없으면 끝에 추가
              newContent = currentContent + '\n\n' + codeSnippet.trim()
            }
          }
        }
        // enum 정의만 있는 경우
        else if (codeSnippet.includes('enum ')) {
          // enum들 추출하여 각각 처리
          const enumMatches = codeSnippet.matchAll(/enum\s+(\w+)\s*\{[^}]*\}/gs)
          newContent = currentContent
          
          for (const match of enumMatches) {
            const enumName = match[1]
            const enumCode = match[0]
            const enumRegex = new RegExp(`enum\\s+${enumName}\\s*\\{[^}]*\\}`, 's')
            
            if (enumRegex.test(newContent)) {
              newContent = newContent.replace(enumRegex, enumCode.trim())
            } else {
              // enum 없으면 model 앞에 추가
              const modelIndex = newContent.indexOf('model ')
              if (modelIndex > 0) {
                newContent = newContent.slice(0, modelIndex) + enumCode.trim() + '\n\n' + newContent.slice(modelIndex)
              } else {
                newContent = newContent + '\n\n' + enumCode.trim()
              }
            }
          }
        }
        
        targetFile.content = newContent
      } else {
        // 전체 파일 교체
        targetFile.content = codeSnippet
      }
      
      // 해당 파일을 활성화 (탭 열기 및 활성화)
      if (!openTabs.value.includes(targetFile.name)) {
        openTabs.value.push(targetFile.name)
      }
      activeFile.value = targetFile.name
      
      // schema.prisma 파일이 적용되었으면 데이터베이스 스냅샷 업데이트
      if (targetFile.name === 'schema.prisma') {
        await updateDatabaseSnapshot()
      }
      
      console.log('✨ 정답이 적용되었습니다:', targetFile.name)
      alert('✨ 정답 코드가 에디터에 적용되었습니다!\n파일: ' + targetFile.name)
    } else {
      console.warn('정답을 적용할 파일을 찾을 수 없습니다')
      alert('정답을 적용할 파일을 찾을 수 없습니다.')
    }
  }
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
async function syncPrismaSchemaToDatabase(): Promise<string> {
  const sqlStatements: string[] = []
  
  try {
    const schemaFile = editorFiles.value.find(f => f.name === 'schema.prisma')
    if (!schemaFile) {
      console.log('⚠️ schema.prisma 파일이 없습니다')
      return ''
    }

    console.log('🔄 데이터베이스 초기화 중...')
    const dbInstance = await initializeDatabase()
    console.log('✅ 데이터베이스 초기화 완료:', dbInstance ? '인스턴스 생성됨' : '인스턴스 없음')

    // 기존 테이블 삭제 (리셋) - 빠르게 처리
    console.log('🔄 기존 테이블 삭제 중...')
    try {
      // 타임아웃을 짧게 설정하여 빠르게 진행
      await Promise.race([
        resetDatabase(),
        new Promise((resolve) => setTimeout(resolve, 1000)) // 1초 타임아웃
      ])
      console.log('✅ 테이블 삭제 완료, 스키마 파싱 시작...')
    } catch (error) {
      console.warn('⚠️ 테이블 삭제 중 문제 발생 (계속 진행):', error)
      // 에러가 발생해도 계속 진행
    }

    // Prisma 스키마에서 model 추출 (중첩 중괄호 처리)
    const schemaContent = schemaFile.content
    console.log('📝 스키마 내용 (처음 200자):', schemaContent.substring(0, 200))
    console.log('📝 스키마 전체 길이:', schemaContent.length)
    
    const models: Array<{ name: string; content: string; fullMatch: string }> = []
    
    // model 블록 찾기 (중첩 중괄호 처리)
    let pos = 0
    while (pos < schemaContent.length) {
      const modelStart = schemaContent.indexOf('model ', pos)
      if (modelStart === -1) break
      
      // model 이름 추출
      const nameMatch = schemaContent.substring(modelStart).match(/model\s+(\w+)/)
      if (!nameMatch) {
        pos = modelStart + 6
        continue
      }
      
      const modelName = nameMatch[1]
      const blockStart = schemaContent.indexOf('{', modelStart)
      if (blockStart === -1) break
      
      // 중괄호 매칭하여 블록 끝 찾기
      let depth = 1
      let blockEnd = blockStart + 1
      while (depth > 0 && blockEnd < schemaContent.length) {
        if (schemaContent[blockEnd] === '{') depth++
        if (schemaContent[blockEnd] === '}') depth--
        if (depth > 0) blockEnd++
      }
      
      if (depth === 0) {
        const modelContent = schemaContent.substring(blockStart + 1, blockEnd)
        const fullMatch = schemaContent.substring(modelStart, blockEnd + 1)
        models.push({
          name: modelName,
          content: modelContent,
          fullMatch
        })
        console.log(`📦 모델 발견: ${modelName}`)
      }
      
      pos = blockEnd + 1
    }
    
    console.log(`📊 총 ${models.length}개 모델 발견`)
    
    if (models.length === 0) {
      // 모델이 없는 것은 정상일 수 있음 (예: 스텝 1은 설정 단계만)
      // 경고 없이 조용히 종료
      console.log('ℹ️ 모델이 없습니다. (설정 단계이거나 아직 모델을 정의하지 않았습니다)')
      return '' // 정상 종료
    }

    // 각 model을 SQL CREATE TABLE로 변환
    for (const model of models) {
      const tableName = model.name.toLowerCase() // Prisma는 PascalCase, SQL은 소문자
      
      // @@map 어노테이션 확인
      const mapMatch = model.fullMatch.match(/@@map\s*\(\s*["']([^"']+)["']\s*\)/)
      const actualTableName = mapMatch ? mapMatch[1] : tableName
      
      console.log(`🔨 테이블 생성 중: ${actualTableName} (모델: ${model.name})`)

      // 필드 파싱 (줄 단위로 처리)
      const lines = model.content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'))
      const fields: Array<{ name: string; type: string; attrs: string }> = []
      
      for (const line of lines) {
        // 주석 제거
        const cleanLine = line.split('//')[0].trim()
        if (!cleanLine) continue
        
        // 필드 파싱: name Type @attr1 @attr2
        const fieldMatch = cleanLine.match(/^(\w+)\s+(\w+(?:\?|\[\])?)\s*(.*)$/)
        if (fieldMatch) {
          fields.push({
            name: fieldMatch[1],
            type: fieldMatch[2],
            attrs: fieldMatch[3].trim()
          })
        }
      }
      
      console.log(`  📋 ${fields.length}개 필드 발견:`, fields.map(f => f.name).join(', '))

      // enum 타입 확인 (스키마에서 enum 정의 찾기)
      const enumRegex = /enum\s+(\w+)\s*\{[^}]+\}/g
      const enums: Record<string, string[]> = {}
      let enumMatch
      while ((enumMatch = enumRegex.exec(schemaContent)) !== null) {
        const enumName = enumMatch[1]
        const enumContent = enumMatch[0].match(/\{([^}]+)\}/)?.[1] || ''
        const enumValues = enumContent.split('\n')
          .map(l => l.trim())
          .filter(l => l && !l.startsWith('//'))
          .map(l => l.split('//')[0].trim())
        enums[enumName] = enumValues
      }

      // SQL 타입 매핑
      const typeMap: Record<string, string> = {
        'Int': 'INTEGER',
        'String': 'TEXT',
        'Boolean': 'BOOLEAN',
        'DateTime': 'TIMESTAMP',
        'Float': 'REAL'
      }

      // CREATE TABLE SQL 생성
      const columns: string[] = []
      let primaryKey: string | null = null

      for (const field of fields) {
        const baseType = field.type.replace('?', '').replace('[]', '')
        let sqlType = typeMap[baseType] || (enums[baseType] ? 'TEXT' : 'TEXT')
        let nullable = field.type.endsWith('?')
        let isPrimaryKey = field.attrs.includes('@id')
        let isUnique = field.attrs.includes('@unique')
        let defaultValue = ''
        
        // enum 타입인 경우 CHECK 제약 조건 추가
        const isEnum = enums[baseType] !== undefined

        // @default 처리
        const defaultMatch = field.attrs.match(/@default\(([^)]+)\)/)
        if (defaultMatch) {
          const defaultVal = defaultMatch[1]
          if (defaultVal === 'autoincrement()') {
            sqlType = 'SERIAL'
            nullable = false
          } else if (defaultVal === 'now()') {
            defaultValue = 'DEFAULT CURRENT_TIMESTAMP'
          } else if (defaultVal.startsWith('"') || defaultVal.startsWith("'")) {
            defaultValue = `DEFAULT ${defaultVal}`
          }
        }

        // @updatedAt 처리
        if (field.attrs.includes('@updatedAt')) {
          defaultValue = 'DEFAULT CURRENT_TIMESTAMP'
        }

        let columnDef = `"${field.name}" ${sqlType}`
        if (!nullable && !defaultValue.includes('SERIAL')) {
          columnDef += ' NOT NULL'
        }
        if (defaultValue) {
          columnDef += ' ' + defaultValue
        }
        if (isUnique) {
          columnDef += ' UNIQUE'
        }
        // enum 타입인 경우 CHECK 제약 조건 추가
        if (isEnum && enums[baseType].length > 0) {
          const enumValues = enums[baseType].map(v => `'${v}'`).join(', ')
          columnDef += ` CHECK ("${field.name}" IN (${enumValues}))`
        }

        columns.push(columnDef)

        if (isPrimaryKey) {
          primaryKey = field.name
        }
      }

      // PRIMARY KEY 추가
      if (primaryKey) {
        columns.push(`PRIMARY KEY ("${primaryKey}")`)
      }

      if (columns.length === 0) {
        console.warn(`⚠️ ${actualTableName}: 컬럼이 없어 테이블을 생성할 수 없습니다`)
        continue
      }

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS "${actualTableName}" (
          ${columns.join(',\n          ')}
        )
      `

      console.log(`📝 SQL 생성:`, createTableSQL)
      
      // SQL 문을 수집
      sqlStatements.push(createTableSQL.trim())
      
      try {
        await executeQuery(createTableSQL.trim())
        console.log(`✅ 테이블 생성 완료: ${actualTableName}`)
      } catch (error) {
        console.error(`❌ 테이블 생성 실패: ${actualTableName}`, error)
        console.error('SQL:', createTableSQL)
        throw error // 에러를 다시 throw하여 상위에서 처리할 수 있도록
      }
    }
    
    console.log('✅ 모든 테이블 생성 완료')
    
    // 생성된 모든 SQL 문을 반환
    const finalSQL = sqlStatements.join(';\n\n') + (sqlStatements.length > 0 ? ';' : '')
    console.log('📝 최종 생성된 SQL:', finalSQL ? `${finalSQL.length}자` : '없음')
    console.log('📝 SQL 내용:', finalSQL.substring(0, 200))
    
    return finalSQL
  } catch (error) {
    console.error('❌ Prisma 스키마 동기화 실패:', error)
    // 에러가 발생해도 빈 문자열 반환하여 계속 진행
    return ''
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
    
    // 코드에서 Prisma create/update 호출 찾기
    const schemaFile = editorFiles.value.find(f => f.name === 'schema.prisma')
    if (!schemaFile) return
    
    // 모델 이름 찾기 (간단하게 User 모델만 처리)
    const modelMatch = schemaFile.content.match(/model\s+(\w+)/)
    if (!modelMatch) return
    
    const modelName = modelMatch[1]
    const tableName = schemaFile.content.match(new RegExp(`model\\s+${modelName}[^}]*@@map\\(["']([^"']+)["']\\)`, 's'))?.[1] || modelName.toLowerCase()
    
    // output에서 객체 패턴 찾기 (여러 줄에 걸친 객체도 처리)
    // 예: { id: 1,\n  email: 'test@test.com',\n  name: 'Test' }
    const objectPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gs
    const objectMatches = output.match(objectPattern) || []
    
    if (objectMatches.length > 0) {
      console.log(`📦 ${objectMatches.length}개 객체 패턴 발견`)
      
      for (const objStr of objectMatches) {
        try {
          // JavaScript 객체를 JSON으로 변환 시도
          // 단순한 경우만 처리 (복잡한 객체는 무시)
          let cleanedStr = objStr
            .replace(/(\w+):/g, '"$1":')  // 키에 따옴표 추가
            .replace(/'/g, '"')           // 작은따옴표를 큰따옴표로
          
          const data = JSON.parse(cleanedStr)
          
          // Prisma 모델 필드인지 확인 (스키마에서 필드명 확인)
          const schemaFields = schemaFile.content.match(new RegExp(`model\\s+${modelName}[^}]*\\{([^}]+)\\}`, 's'))?.[1]
          if (!schemaFields) continue
          
          const fieldNames = schemaFields.match(/(\w+)\s+\w+/g)?.map(f => f.split(/\s+/)[0]) || []
          const validFields = Object.keys(data).filter(k => fieldNames.includes(k))
          
          if (validFields.length === 0) {
            console.log('⚠️ 유효한 필드가 없습니다:', Object.keys(data))
            continue
          }
          
          // 테이블에 INSERT
          const columns = validFields
          const values = columns.map(col => {
            const val = data[col]
            // 날짜 문자열을 TIMESTAMP로 변환
            if (col.includes('At') && typeof val === 'string') {
              return new Date(val).toISOString()
            }
            return val
          })
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')
          
          const insertSQL = `
            INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')})
            VALUES (${placeholders})
            ON CONFLICT DO NOTHING
          `
          
          await executeQuery(insertSQL.trim(), values)
          console.log(`✅ 데이터 삽입 완료: ${tableName}`, Object.fromEntries(columns.map((c, i) => [c, values[i]])))
        } catch (parseError) {
          // 파싱 실패 시 무시
          console.log('⚠️ 객체 파싱 실패 (무시):', objStr.substring(0, 100))
        }
      }
    } else {
      console.log('ℹ️ 출력에서 데이터 객체를 찾을 수 없습니다.')
      console.log('📝 출력 내용:', output.substring(0, 500))
    }
    
    console.log('✅ Prisma 출력 파싱 완료')
  } catch (error) {
    console.warn('⚠️ Prisma 출력 파싱 실패 (무시):', error)
  }
}

// 데이터베이스 스냅샷 업데이트
async function updateDatabaseSnapshot() {
  try {
    console.log('🔄 데이터베이스 스냅샷 업데이트 시작...')
    
    // Prisma 스키마를 데이터베이스에 동기화하고 생성된 SQL 수집
    let schemaSQL = ''
    try {
      console.log('🔄 Prisma 스키마 동기화 시작...')
      schemaSQL = await syncPrismaSchemaToDatabase()
      console.log('✅ Prisma 스키마 동기화 완료, 생성된 SQL:', schemaSQL ? `${schemaSQL.length}자` : '없음')
    } catch (error) {
      // 모델이 없거나 스키마 동기화 실패해도 계속 진행 (스텝 1처럼 모델이 없는 경우 정상)
      console.log('ℹ️ 스키마 동기화 중 문제 발생 (계속 진행):', error)
      schemaSQL = '' // 빈 문자열로 설정
    }
    
    // 스냅샷 가져오기
    console.log('📸 데이터베이스 스냅샷 가져오는 중...')
    const snapshot = await getSnapshot()
    
    // 생성된 SQL 스키마 추가 - 반응성을 위해 새 객체로 생성
    const newSnapshot = {
      tables: snapshot.tables || [],
      timestamp: Date.now(),
      schemaSQL: schemaSQL || ''
    }
    
    // 강제로 반응성 업데이트
    dbSnapshot.value = newSnapshot
    
    // Vue 반응성 보장
    await nextTick()
    
    console.log('📊 스냅샷 설정 완료:', {
      tables: newSnapshot.tables.length,
      schemaSQL: newSnapshot.schemaSQL ? `${newSnapshot.schemaSQL.length}자` : '없음',
      dbSnapshotValue: dbSnapshot.value ? '설정됨' : 'null'
    })
    
    // 생성된 SQL을 FileExplorer에 가상 파일로 추가
    console.log('📄 schema.sql 파일 추가 체크:', {
      hasSchemaSQL: !!schemaSQL,
      schemaSQLLength: schemaSQL ? schemaSQL.length : 0,
      trimmed: schemaSQL ? schemaSQL.trim().length : 0
    })
    
    if (schemaSQL && schemaSQL.trim()) {
      const schemaSqlFile = editorFiles.value.find(f => f.name === 'schema.sql')
      if (schemaSqlFile) {
        // 기존 파일 업데이트 - 반응성을 위해 새 객체로
        const fileIndex = editorFiles.value.indexOf(schemaSqlFile)
        editorFiles.value[fileIndex] = {
          ...schemaSqlFile,
          content: schemaSQL
        }
        // 배열 참조 변경으로 반응성 트리거
        editorFiles.value = [...editorFiles.value]
        console.log('✅ schema.sql 파일이 업데이트되었습니다. (기존 파일)')
        console.log('📁 FileExplorer 파일 목록:', editorFiles.value.map(f => f.name).join(', '))
      } else {
        // 새 파일 추가 - 반응성을 위해 새 배열로 생성
        editorFiles.value = [...editorFiles.value, {
          name: 'schema.sql',
          path: 'schema.sql',
          content: schemaSQL,
          readonly: true // 읽기 전용으로 설정
        }]
        console.log('✅ schema.sql 파일이 FileExplorer에 추가되었습니다. (새 파일)')
        console.log('📁 FileExplorer 파일 목록:', editorFiles.value.map(f => f.name).join(', '))
      }
      
      // Vue 반응성 보장
      await nextTick()
      console.log('✅ FileExplorer UI 업데이트 완료')
    } else {
      console.warn('⚠️ schemaSQL이 없어서 schema.sql 파일을 추가할 수 없습니다.')
      console.warn('⚠️ schemaSQL 값:', schemaSQL)
    }
    
    console.log('✅ 데이터베이스 스냅샷 업데이트 완료:', newSnapshot.tables.length, '개 테이블')
    console.log('✅ UI 업데이트 완료 - 데이터베이스 탭에서 확인하세요!')
    if (newSnapshot.tables.length > 0) {
      newSnapshot.tables.forEach(table => {
        console.log(`  - ${table.name}: ${table.rows.length} rows, ${table.columns.length} columns`)
      })
    } else if (newSnapshot.schemaSQL) {
      console.log('ℹ️ 테이블은 없지만 SQL 스키마가 생성되었습니다. 데이터베이스 탭에서 확인하세요!')
    } else {
      // 테이블이 없는 것은 정상일 수 있음 (스텝 1처럼 모델이 없는 경우)
      console.log('ℹ️ 테이블이 없습니다. (모델이 정의되지 않았거나 설정 단계입니다)')
    }
  } catch (error) {
    console.error('❌ 데이터베이스 스냅샷 업데이트 실패:', error)
    dbSnapshot.value = {
      tables: [],
      timestamp: Date.now(),
      schemaSQL: ''
    }
  }
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
  restartCurriculum()
  await resetState()
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
