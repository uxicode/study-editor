<template>
  <div class="console-panel-container">
    <!-- 탭 헤더 -->
    <div class="console-tabs">
      <button
        :class="['console-tab', { active: activeTab === 'output' }]"
        @click="activeTab = 'output'"
      >
        📋 출력
      </button>
      <button
        :class="['console-tab', { active: activeTab === 'console' }]"
        @click="activeTab = 'console'"
      >
        💻 콘솔
        <span v-if="consoleLogs.length > 0" class="badge">{{ consoleLogs.length }}</span>
      </button>
      <button
        :class="['console-tab', { active: activeTab === 'validation' }]"
        @click="activeTab = 'validation'"
      >
        ✓ 검증 결과
      </button>
      <button
        v-if="showDatabaseTab"
        :class="['console-tab', { active: activeTab === 'database' }]"
        @click="activeTab = 'database'"
      >
        🗄️ 데이터베이스
      </button>
    </div>

    <!-- 탭 컨텐츠 -->
    <div class="console-content">
      <!-- 출력 탭 -->
      <div v-if="activeTab === 'output'" class="tab-panel">
        <div v-if="!executionResult" class="empty-message">
          코드를 실행하면 결과가 여기에 표시됩니다.
        </div>
        <div v-else class="output-content">
          <div v-if="executionResult.error" class="error-message">
            <div class="error-header">❌ 에러 발생</div>
            <pre class="error-text">{{ executionResult.error }}</pre>
          </div>
          <div v-else class="success-message">
            <div class="success-header">✅ 실행 성공</div>
            <pre class="output-text">{{ executionResult.output }}</pre>
          </div>
          
          <!-- 로그 -->
          <div v-if="executionResult.logs.length > 0" class="logs-section">
            <div class="logs-header">📝 로그</div>
            <div class="log-item" v-for="(log, idx) in executionResult.logs" :key="idx">
              {{ log }}
            </div>
          </div>
        </div>
      </div>

      <!-- 콘솔 탭 -->
      <div v-if="activeTab === 'console'" class="tab-panel">
        <div class="console-panel-header">
          <span class="console-panel-title">💻 콘솔 출력</span>
          <button v-if="consoleLogs.length > 0" class="btn-clear" @click="clearConsole" title="콘솔 비우기">
            🧹 지우기
          </button>
        </div>

        <div v-if="consoleLogs.length === 0" class="empty-message">
          콘솔 출력이 없습니다.
          <div class="empty-hint">
            코드 에디터에 <code>console.log()</code>, <code>console.error()</code> 등을 작성하고 정답 확인/실행을 해보세요!
          </div>
        </div>
        <div v-else class="console-logs-list">
          <div
            v-for="entry in consoleLogs"
            :key="entry.id"
            :class="['console-log-item', entry.type]"
          >
            <span class="log-timestamp">{{ entry.timestamp }}</span>
            <span class="log-type-icon">
              <template v-if="entry.type === 'log'">💬</template>
              <template v-else-if="entry.type === 'info'">ℹ️</template>
              <template v-else-if="entry.type === 'warn'">⚠️</template>
              <template v-else-if="entry.type === 'error'">❌</template>
            </span>
            <div class="log-args">
              <span v-for="(arg, idx) in entry.args" :key="idx" class="arg-item">{{ arg }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 검증 결과 탭 -->
      <div v-if="activeTab === 'validation'" class="tab-panel">
        <div v-if="!validationResult" class="empty-message">
          정답 확인을 실행하면 검증 결과가 여기에 표시됩니다.
        </div>
        <div v-else class="validation-content">
          <div v-if="validationResult.functionTestResults?.length" class="function-test-results">
            <h4>🧪 함수 테스트</h4>
            <div
              v-for="(test, idx) in validationResult.functionTestResults"
              :key="idx"
              :class="['function-test-item', test.passed ? 'passed' : 'failed']"
            >
              <span class="test-status">{{ test.passed ? '✓' : '✗' }}</span>
              <div class="test-details">
                <div class="test-description">{{ test.description }}</div>
                <div class="test-call">{{ test.call }}</div>
                <div v-if="test.error" class="test-error">{{ test.error }}</div>
                <div v-else class="test-values">
                  기대값: {{ test.expected }} / 실제값: {{ test.actual }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="validationResult.passed" class="validation-success">
            <div class="validation-icon">🎉</div>
            <h3>정답입니다!</h3>
            <p>다음 단계로 진행할 수 있습니다.</p>
            <div class="success-details">
              <div class="detail-item">
                ✓ 모든 검증을 통과했습니다
              </div>
              <div v-if="validationResult.nextStep" class="detail-item">
                → 다음 단계: {{ validationResult.nextStep }}
              </div>
            </div>
          </div>
          <div v-else class="validation-failure">
            <div class="validation-icon">❌</div>
            <h3>아직 조건을 만족하지 못했습니다</h3>
            
            <div v-if="validationResult.errors.length > 0" class="error-list">
              <h4>오류 목록:</h4>
              <div
                v-for="(error, idx) in validationResult.errors"
                :key="idx"
                class="error-item"
              >
                <span class="error-type">[{{ error.type }}]</span>
                {{ error.message }}
              </div>
            </div>

            <div v-if="isAuthenticated && validationResult.hints.length > 0" class="hint-list">
              <h4>💡 힌트:</h4>
              <div
                v-for="(hint, idx) in validationResult.hints"
                :key="idx"
                class="hint-item"
              >
                {{ hint }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 데이터베이스 탭 -->
      <div v-if="activeTab === 'database'" class="tab-panel">
        <div v-if="!dbSnapshot || (dbSnapshot.tables?.length === 0 && !dbSnapshot.schemaSQL)" class="empty-message">
          이 단계에서는 표시할 스키마가 없습니다.
          <div class="empty-hint">
            <code>schema.prisma</code> 의 모델을 정의하거나, <code>schema.sql</code> 에 <code>CREATE TABLE</code> 문을 작성하면 자동으로 표시됩니다.
          </div>
        </div>
        <div v-else-if="dbSnapshot" class="database-content">
          <!-- SQL 스키마 섹션 -->
          <div v-if="dbSnapshot.schemaSQL" class="schema-viewer">
            <div class="schema-header">
              <h4>📄 MySQL 스키마</h4>
              <button 
                class="btn-copy" 
                @click="copySchemaSQL"
                title="SQL 복사"
              >
                📋 복사
              </button>
            </div>
            <pre class="schema-sql">{{ dbSnapshot.schemaSQL }}</pre>
          </div>
          
          <!-- 테이블 목록 -->
          <div v-for="table in dbSnapshot.tables" :key="table.name" class="table-viewer">
            <div class="table-header">
              <h4>{{ table.name }}</h4>
              <span class="row-count">{{ table.rows.length }} rows</span>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th v-for="col in table.columns" :key="col.name">
                      {{ col.name }}
                      <span class="column-type">{{ col.type }}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in table.rows" :key="idx">
                    <td v-for="col in table.columns" :key="col.name">
                      {{ formatCellValue(row[col.name]) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ExecutionResult, ValidationResult, DBSnapshot, ConsoleLogEntry } from '@/types/runtime'

interface Props {
  executionResult: ExecutionResult | null
  validationResult: ValidationResult | null
  dbSnapshot: DBSnapshot | null
  isAuthenticated: boolean
}

const props = defineProps<Props>()

import { useCurriculum } from '@/composables/use-curriculum'
const { activeCurriculumId } = useCurriculum()

const activeTab = ref<'output' | 'console' | 'validation' | 'database'>('output')
const clearedLogs = ref(false)

const consoleLogs = computed<ConsoleLogEntry[]>(() => {
  if (clearedLogs.value) return []
  return props.executionResult?.consoleLogs ?? []
})

function clearConsole() {
  clearedLogs.value = true
}

const showDatabaseTab = computed(() => {
  return activeCurriculumId.value === 'backend'
})

watch(showDatabaseTab, (newShow) => {
  if (!newShow && activeTab.value === 'database') {
    activeTab.value = 'output'
  }
})

// computed로 dbSnapshot을 안전하게 접근
const dbSnapshot = computed(() => props.dbSnapshot)

// executionResult나 validationResult가 업데이트되면 해당 탭으로 전환
watch(() => props.executionResult, (newResult) => {
  if (newResult) {
    clearedLogs.value = false
    // consoleLogs가 존재하고 1개 이상이면 사용자가 확인할 수 있도록 콘솔 탭이 클릭 가능하며 기본 선택 유지
  }
})

watch(() => props.validationResult, (newResult) => {
  if (newResult) {
    activeTab.value = 'validation'
  }
})

// dbSnapshot 이 업데이트되고 표시할 내용이 있으면 데이터베이스 탭으로 전환
watch(
  () => props.dbSnapshot,
  (newSnapshot) => {
    if (!newSnapshot) return
    if (!showDatabaseTab.value) return
    const hasTables = (newSnapshot.tables?.length ?? 0) > 0
    const hasSchemaSQL = !!newSnapshot.schemaSQL?.trim()
    if (hasTables || hasSchemaSQL) {
      activeTab.value = 'database'
    }
  }
)

// SQL 스키마 복사 함수
function copySchemaSQL() {
  if (props.dbSnapshot?.schemaSQL) {
    navigator.clipboard.writeText(props.dbSnapshot.schemaSQL)
      .then(() => {
        alert('✅ SQL 스키마가 클립보드에 복사되었습니다!')
      })
      .catch(err => {
        console.error('복사 실패:', err)
        alert('❌ 복사에 실패했습니다.')
      })
  }
}

function formatCellValue(value: unknown): string {
  if (value === null) return 'NULL'
  if (value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>

<style scoped lang="scss">
.console-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.console-tabs {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: #1e1e1e;
  border-bottom: 1px solid #2d2d2d;
}

.console-tab {
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #2d2d2d;
    color: #d1d5db;
  }

  &.active {
    background: #374151;
    color: #f9fafb;
  }

  .badge {
    background: #3b82f6;
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 10px;
    line-height: 1.2;
  }
}

.console-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #374151;

  .console-panel-title {
    font-size: 14px;
    font-weight: 600;
    color: #f3f4f6;
  }

  .btn-clear {
    background: #374151;
    color: #d1d5db;
    border: none;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #4b5563;
      color: #ffffff;
    }
  }
}

.console-logs-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
}

.console-log-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #282c34;
  border-left: 3px solid #6b7280;

  &.log {
    border-left-color: #9ca3af;
    color: #e5e7eb;
  }

  &.info {
    border-left-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    color: #93c5fd;
  }

  &.warn {
    border-left-color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
    color: #fde047;
  }

  &.error {
    border-left-color: #ef4444;
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
  }

  .log-timestamp {
    font-size: 11px;
    color: #6b7280;
    min-width: 60px;
    margin-top: 2px;
  }

  .log-type-icon {
    font-size: 12px;
    margin-top: 1px;
  }

  .log-args {
    flex: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;

    .arg-item {
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

.console-content {
  flex: 1;
  overflow-y: auto;
  background: #1e1e1e;
  color: #e5e7eb;
}

.tab-panel {
  padding: 16px;
  height: 100%;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  padding: 24px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;

  code {
    background: #2d2d2d;
    padding: 1px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    color: #d1d5db;
  }
}

.empty-hint {
  font-size: 12px;
  color: #9ca3af;
  max-width: 480px;
  line-height: 1.5;
}

.output-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-message,
.success-message {
  border-radius: 8px;
  padding: 12px;
}

.error-message {
  background: #7f1d1d;
  border: 1px solid #991b1b;
}

.success-message {
  background: #14532d;
  border: 1px solid #166534;
}

.error-header,
.success-header {
  font-weight: 600;
  margin-bottom: 8px;
}

.error-text,
.output-text {
  margin: 0;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  // white-space: pre-wrap;
  // word-break: break-all;
}

.logs-section {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 12px;
}

.logs-header {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.log-item {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  color: #9ca3af;
  padding: 4px 0;
  border-bottom: 1px solid #374151;

  &:last-child {
    border-bottom: none;
  }
}

.validation-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  width: 100%;
}

.function-test-results {
  width: 100%;
  text-align: left;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #374151;

    :global(.dark) & {
      color: #d1d5db;
    }
  }
}

.function-test-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;

  &.passed {
    background: rgba(16, 185, 129, 0.1);
    border-left: 3px solid #10b981;
  }

  &.failed {
    background: rgba(239, 68, 68, 0.1);
    border-left: 3px solid #ef4444;
  }
}

.test-status {
  font-weight: 700;
  flex-shrink: 0;
}

.test-description {
  font-weight: 600;
  margin-bottom: 4px;
}

.test-call,
.test-values,
.test-error {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #6b7280;

  :global(.dark) & {
    color: #9ca3af;
  }
}

.validation-success,
.validation-failure {
  text-align: center;
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}

.validation-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.validation-success h3 {
  color: #10b981;
  font-size: 24px;
  margin: 0 0 8px 0;
}

.success-details {
  margin-top: 16px;
  text-align: left;
  width: 100%;
}

.detail-item {
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.1);
  border-left: 3px solid #10b981;
  margin-bottom: 8px;
  font-size: 14px;
  color: #059669;

  :global(.dark) & {
    background: rgba(16, 185, 129, 0.2);
    color: #6ee7b7;
  }
}

.validation-failure h3 {
  color: #ef4444;
  font-size: 20px;
  margin: 0 0 24px 0;
}

.error-list,
.hint-list {
  text-align: left;
  margin-top: 24px;
  width: 100%;

  h4 {
    font-size: 14px;
    color: #d1d5db;
    margin: 0 0 8px 0;
  }
}

.error-item,
.hint-item {
  background: #2d2d2d;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
}

.error-type {
  color: #ef4444;
  font-weight: 600;
  margin-right: 8px;
}

.database-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.schema-viewer {
  background: #2d2d2d;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #4b5563;
}

.schema-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #374151;
  border-bottom: 1px solid #4b5563;

  h4 {
    margin: 0;
    font-size: 16px;
    color: #f9fafb;
  }
}

.btn-copy {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }

  &:active {
    background: #1d4ed8;
  }
}

.schema-sql {
  padding: 16px;
  margin: 0;
  background: #1e293b;
  color: #e2e8f0;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
  border-radius: 0 0 8px 8px;

  :global(.dark) & {
    background: #0f172a;
    color: #cbd5e1;
  }
}

.table-viewer {
  background: #2d2d2d;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #374151;
  border-bottom: 1px solid #4b5563;

  h4 {
    margin: 0;
    font-size: 16px;
    color: #f9fafb;
  }
}

.row-count {
  font-size: 12px;
  color: #9ca3af;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #374151;
  }

  th {
    background: #1f2937;
    font-weight: 600;
    color: #d1d5db;
    position: sticky;
    top: 0;
  }

  td {
    color: #e5e7eb;
  }

  tbody tr:hover {
    background: #374151;
  }
}

.column-type {
  display: block;
  font-size: 11px;
  color: #6b7280;
  font-weight: 400;
}
</style>
