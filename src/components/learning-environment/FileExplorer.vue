<template>
  <div class="file-explorer">
    <div class="explorer-header">
      <button class="toggle-button" @click="toggleExplorer">
        <span class="toggle-icon">{{ isExpanded ? '◀' : '▶' }}</span>
      </button>
      <span v-if="isExpanded" class="header-title">📁 파일 탐색기</span>
    </div>

    <Transition name="slide">
      <div v-if="isExpanded" class="explorer-content">
        <div class="file-tree">
          <div
            v-for="file in sortedFiles"
            :key="file.name"
            :class="['file-item', { active: file.name === activeFile, readonly: file.readonly }]"
            @click="selectFile(file.name)"
          >
            <span class="file-icon">{{ getFileIcon(file.name) }}</span>
            <span class="file-name">{{ file.name }}</span>
            <span v-if="file.readonly" class="readonly-badge">읽기전용</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RuntimeFile } from '@/types/runtime'

interface Props {
  files: RuntimeFile[]
  activeFile: string
}

interface Emits {
  (e: 'select-file', fileName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isExpanded = ref(true)

const sortedFiles = computed(() => {
  return [...props.files].sort((a, b) => {
    // .env 파일을 맨 위로
    if (a.name === '.env') return -1
    if (b.name === '.env') return 1
    // schema.prisma를 그 다음으로
    if (a.name === 'schema.prisma') return -1
    if (b.name === 'schema.prisma') return 1
    // 나머지는 알파벳 순
    return a.name.localeCompare(b.name)
  })
})

function toggleExplorer() {
  isExpanded.value = !isExpanded.value
}

function selectFile(fileName: string) {
  emit('select-file', fileName)
}

function getFileIcon(fileName: string): string {
  if (fileName === '.env') return '🔐'
  
  const ext = fileName.split('.').pop()?.toLowerCase()
  
  const iconMap: Record<string, string> = {
    js: '📄',
    ts: '📘',
    prisma: '🔷',
    json: '📋',
    sql: '🗄️',
    env: '🔐'
  }

  return iconMap[ext || ''] || '📄'
}
</script>

<style scoped lang="scss">
.file-explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  border-right: 1px solid #2d2d2d;
  position: relative;

  :global(.dark) & {
    background: #0f172a;
    border-right-color: #1e293b;
  }
}

.explorer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #2d2d2d;
  background: #252526;

  :global(.dark) & {
    background: #1e293b;
    border-bottom-color: #334155;
  }
}

.toggle-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #cccccc;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #2d2d2d;

    :global(.dark) & {
      background: #334155;
    }
  }
}

.toggle-icon {
  font-size: 12px;
}

.header-title {
  font-size: 13px;
  font-weight: 600;
  color: #cccccc;
  user-select: none;

  :global(.dark) & {
    color: #e2e8f0;
  }
}

.explorer-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.file-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  color: #cccccc;
  font-size: 13px;
  user-select: none;
  position: relative;

  &:hover {
    background: #2a2d2e;

    :global(.dark) & {
      background: #1e293b;
    }
  }

  &.active {
    background: #37373d;
    color: #ffffff;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #007acc;
    }

    :global(.dark) & {
      background: #334155;
      
      &::before {
        background: #3b82f6;
      }
    }
  }

  &.readonly {
    opacity: 0.8;
  }
}

.file-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-family: 'Monaco', 'Courier New', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.readonly-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #3a3d41;
  color: #858585;
  border-radius: 3px;
  flex-shrink: 0;

  :global(.dark) & {
    background: #475569;
    color: #94a3b8;
  }
}

// 슬라이드 애니메이션
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  width: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  width: 100%;
  opacity: 1;
}
</style>
