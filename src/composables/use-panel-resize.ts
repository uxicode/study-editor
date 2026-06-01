import { ref, onBeforeUnmount, type Ref } from 'vue'

interface UsePanelResizeOptions {
  /** 초기 너비 (px). storageKey 로 저장된 값이 있으면 그 값이 우선한다. */
  initialWidth: number
  /** 최소 너비 (px) */
  minWidth: number
  /** 최대 너비 — 숫자(px) 또는 `(viewportWidth) => px` */
  maxWidth: number | ((viewportWidth: number) => number)
  /** localStorage 키 (생략 시 저장 안 함) */
  storageKey?: string
  /** 키보드 화살표로 조절할 스텝 (px). 기본 16 */
  keyboardStep?: number
}

interface UsePanelResizeReturn {
  width: Ref<number>
  isResizing: Ref<boolean>
  startResize: (event: PointerEvent | MouseEvent) => void
  onKeyboardResize: (event: KeyboardEvent) => void
}

/**
 * 가로 방향 패널의 드래그 리사이즈 로직.
 * - 포인터 다운 → 윈도우의 mousemove/mouseup 을 잡아 너비를 업데이트
 * - 드래그 중 텍스트 선택 방지 및 col-resize 커서 유지
 * - 윈도우 리사이즈에도 max 범위 안으로 자동 클램프
 */
export function usePanelResize(options: UsePanelResizeOptions): UsePanelResizeReturn {
  const {
    initialWidth,
    minWidth,
    maxWidth,
    storageKey,
    keyboardStep = 16
  } = options

  function resolveMax(): number {
    return typeof maxWidth === 'function' ? maxWidth(window.innerWidth) : maxWidth
  }

  function clamp(value: number): number {
    const max = resolveMax()
    return Math.max(minWidth, Math.min(max, value))
  }

  function readSavedWidth(): number | null {
    if (!storageKey) return null
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return null
      const n = Number(raw)
      return Number.isFinite(n) ? n : null
    } catch {
      return null
    }
  }

  function persist(value: number): void {
    if (!storageKey) return
    try {
      localStorage.setItem(storageKey, String(Math.round(value)))
    } catch {
      // localStorage 접근 실패는 무시 (시크릿 모드 등)
    }
  }

  const width = ref<number>(clamp(readSavedWidth() ?? initialWidth))
  const isResizing = ref(false)

  let startX = 0
  let startWidth = 0
  let originalUserSelect = ''
  let originalCursor = ''

  function onPointerMove(event: MouseEvent): void {
    const delta = event.clientX - startX
    width.value = clamp(startWidth + delta)
  }

  function onPointerUp(): void {
    if (!isResizing.value) return
    isResizing.value = false
    document.body.style.userSelect = originalUserSelect
    document.body.style.cursor = originalCursor
    window.removeEventListener('mousemove', onPointerMove)
    window.removeEventListener('mouseup', onPointerUp)
    persist(width.value)
  }

  function startResize(event: PointerEvent | MouseEvent): void {
    isResizing.value = true
    startX = event.clientX
    startWidth = width.value
    originalUserSelect = document.body.style.userSelect
    originalCursor = document.body.style.cursor
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)
  }

  function onKeyboardResize(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const direction = event.key === 'ArrowLeft' ? -1 : 1
    width.value = clamp(width.value + direction * keyboardStep)
    persist(width.value)
  }

  function onWindowResize(): void {
    width.value = clamp(width.value)
  }
  window.addEventListener('resize', onWindowResize)

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onPointerMove)
    window.removeEventListener('mouseup', onPointerUp)
    window.removeEventListener('resize', onWindowResize)
    if (isResizing.value) {
      document.body.style.userSelect = originalUserSelect
      document.body.style.cursor = originalCursor
    }
  })

  return { width, isResizing, startResize, onKeyboardResize }
}
