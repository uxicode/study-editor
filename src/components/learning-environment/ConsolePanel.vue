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
        :class="['console-tab', { active: activeTab === 'validation' }]"
        @click="activeTab = 'validation'"
      >
        ✓ 검증 결과
      </button>
      <button
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

      <!-- 검증 결과 탭 -->
      <div v-if="activeTab === 'validation'" class="tab-panel">
        <div v-if="!validationResult" class="empty-message">
          정답 확인을 실행하면 검증 결과가 여기에 표시됩니다.
        </div>
        <div v-else class="validation-content">
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

            <div v-if="validationResult.hints.length > 0" class="hint-list">
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
        <div v-if="!dbSnapshot || (dbSnapshot.tables.length === 0 && !dbSnapshot.schemaSQL)" class="empty-message">
          데이터베이스에 테이블이 없습니다. {{ JSON.stringify(dbSnapshot) }}
        </div>
        <div v-else class="database-content">
          <!-- SQL 스키마 섹션 -->
          <div v-if="dbSnapshot.schemaSQL" class="schema-viewer">
            <div class="schema-header">
              <h4>📄 PostgreSQL 스키마</h4>
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
import { ref, watch } from 'vue'
import type { ExecutionResult, ValidationResult, DBSnapshot } from '@/types/runtime'

interface Props {
  executionResult: ExecutionResult | null
  validationResult: ValidationResult | null
  dbSnapshot: DBSnapshot | null
}

const props = defineProps<Props>()

const activeTab = ref<'output' | 'validation' | 'database'>('output')

// executionResult나 validationResult가 업데이트되면 해당 탭으로 전환
watch(() => props.executionResult, (newResult) => {
  if (newResult) {
    activeTab.value = 'output'
  }
})

watch(() => props.validationResult, (newResult) => {
  if (newResult) {
    activeTab.value = 'validation'
  }
})

// dbSnapshot이 업데이트되고 테이블이나 SQL 스키마가 있으면 데이터베이스 탭으로 전환
watch(() => props.dbSnapshot, (newSnapshot) => {
  if (newSnapshot) {
    const hasTables = newSnapshot.tables && newSnapshot.tables.length > 0
    const hasSchemaSQL = newSnapshot.schemaSQL && newSnapshot.schemaSQL.trim().length > 0
    
    if (hasTables || hasSchemaSQL) {
      console.log('🔄 데이터베이스 탭으로 자동 전환:', { hasTables, hasSchemaSQL })
      activeTab.value = 'database'
    }
  }
}, { deep: true, immediate: true })

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

  &:hover {
    background: #2d2d2d;
    color: #d1d5db;
  }

  &.active {
    background: #374151;
    color: #f9fafb;
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
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  font-size: 14px;
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
  white-space: pre-wrap;
  word-break: break-all;
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
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.validation-success,
.validation-failure {
  text-align: center;
  max-width: 500px;
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
