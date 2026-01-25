<template>
  <div class="code-editor-container">
    <div class="editor-layout">
      <!-- 파일 탐색기 -->
      <FileExplorer
        :files="files"
        :active-file="activeFile"
        @select-file="handleSelectFile"
      />

      <!-- 에디터 영역 -->
      <div class="editor-wrapper">
        <!-- 탭 바 -->
        <div class="tab-bar">
          <div
            v-for="tabName in openTabs"
            :key="tabName"
            :class="['file-tab', { active: activeFile === tabName }]"
            @click="emit('update:activeFile', tabName)"
          >
            <span class="file-icon">{{ getFileIcon(tabName) }}</span>
            <span class="file-name">{{ tabName }}</span>
            <button
              v-if="openTabs.length > 1"
              class="close-button"
              @click.stop="handleCloseTab(tabName)"
              title="닫기"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Monaco Editor -->
        <div ref="editorContainer" class="editor-area"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { monaco } from '@/monaco-setup'
import FileExplorer from './FileExplorer.vue'
import type { RuntimeFile } from '@/types/runtime'

interface Props {
  files: RuntimeFile[]
  activeFile: string
  openTabs: string[]
}

interface Emits {
  (e: 'update:content', fileName: string, content: string): void
  (e: 'update:activeFile', fileName: string): void
  (e: 'close-tab', fileName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editorContainer = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let currentModel: monaco.editor.ITextModel | null = null
let isUpdatingFromEditor = false // 에디터 내부 변경인지 추적

onMounted(() => {
  if (!editorContainer.value) return

  // Monaco Editor 초기화
  editor = monaco.editor.create(editorContainer.value, {
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    padding: { top: 16, bottom: 16 },
    readOnly: false
  })

  // 내용 변경 이벤트
  editor.onDidChangeModelContent(() => {
    if (editor && props.activeFile) {
      isUpdatingFromEditor = true
      const content = editor.getValue()
      emit('update:content', props.activeFile, content)
      // 다음 틱에서 플래그 해제
      setTimeout(() => {
        isUpdatingFromEditor = false
      }, 0)
    }
  })

  // 초기 파일 로드
  if (props.files.length > 0 && props.activeFile) {
    loadFile(props.activeFile)
  }
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})

watch(() => props.activeFile, (newFile) => {
  if (newFile) {
    loadFile(newFile)
  }
})

// files prop 변경 감지 - 외부에서 파일 내용이 변경되었을 때 반영
watch(() => props.files, (newFiles) => {
  // 현재 활성 파일의 내용이 변경되었는지 확인
  if (props.activeFile && editor && currentModel) {
    const file = newFiles.find(f => f.name === props.activeFile)
    if (file) {
      const currentContent = editor.getValue()
      // 외부에서 변경되었고, 에디터 내부 변경이 아닌 경우에만 업데이트
      if (file.content !== currentContent && !isUpdatingFromEditor) {
        // 에디터 내용 직접 업데이트 (모델 재생성 없이)
        const position = editor.getPosition() // 커서 위치 저장
        editor.setValue(file.content)
        if (position) {
          editor.setPosition(position) // 커서 위치 복원
        }
      }
    }
  }
}, { deep: true })

// props.files watch 제거 - 에디터 내부 변경 시 무한 루프 방지
// activeFile이 변경될 때만 파일을 로드하도록 함

function loadFile(fileName: string) {
  const file = props.files.find(f => f.name === fileName)
  if (!file || !editor) return

  // 에디터 내부 변경인 경우 무시
  if (isUpdatingFromEditor) {
    return
  }

  // 현재 모델의 내용과 동일한 경우 무시 (불필요한 리로드 방지)
  if (currentModel && editor.getModel() === currentModel) {
    const currentContent = editor.getValue()
    if (currentContent === file.content) {
      return
    }
  }

  // 기존 모델 제거
  if (currentModel) {
    currentModel.dispose()
  }

  // 언어 결정
  const language = getLanguageFromFileName(fileName)

  // 새 모델 생성
  currentModel = monaco.editor.createModel(file.content, language)
  editor.setModel(currentModel)
  
  // 읽기 전용 설정
  const isReadonly = file.readonly || false
  editor.updateOptions({ readOnly: isReadonly })
  
  // 포커스 복원
  editor.focus()
}

function handleSelectFile(fileName: string) {
  emit('update:activeFile', fileName)
}

function handleCloseTab(fileName: string) {
  emit('close-tab', fileName)
}

function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    prisma: 'prisma',
    json: 'json',
    sql: 'sql'
  }

  return languageMap[ext || ''] || 'plaintext'
}

function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  
  const iconMap: Record<string, string> = {
    js: '📄',
    ts: '📘',
    prisma: '🔷',
    json: '📋',
    sql: '🗄️'
  }

  return iconMap[ext || ''] || '📄'
}
</script>

<style scoped lang="scss">
.code-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.editor-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-bar {
  display: flex;
  gap: 0;
  background: #252526;
  border-bottom: 1px solid #2d2d2d;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 2px;
  }

  :global(.dark) & {
    background: #1e293b;
    border-bottom-color: #334155;
  }
}

.file-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #2d2d2d;
  border: none;
  border-right: 1px solid #1e1e1e;
  color: #858585;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  position: relative;
  min-width: 0;

  &:hover {
    background: #37373d;
    color: #cccccc;

    .close-button {
      opacity: 1;
    }

    :global(.dark) & {
      background: #334155;
    }
  }

  &.active {
    background: #1e1e1e;
    color: #ffffff;
    border-bottom: 2px solid #007acc;

    :global(.dark) & {
      background: #0f172a;
      border-bottom-color: #3b82f6;
    }
  }

  .file-icon {
    font-size: 14px;
    flex-shrink: 0;
  }

  .file-name {
    font-family: 'Monaco', 'Courier New', monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin-left: 4px;
    background: transparent;
    border: none;
    border-radius: 3px;
    color: inherit;
    cursor: pointer;
    opacity: 0;
    transition: all 0.15s;
    font-size: 18px;
    line-height: 1;
    padding: 0;
    flex-shrink: 0;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;

      :global(.dark) & {
        background: rgba(255, 255, 255, 0.15);
      }
    }
  }

  &.active .close-button {
    opacity: 1;
  }

  :global(.dark) & {
    background: #1e293b;
    border-right-color: #0f172a;

    &:hover {
      color: #e2e8f0;
    }

    &.active {
      color: #ffffff;
    }
  }
}

.editor-area {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
