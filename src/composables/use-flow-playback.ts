import { ref, watch, onBeforeUnmount, type Ref } from 'vue'

/**
 * 흐름 다이어그램의 재생 시계.
 * requestAnimationFrame 으로 경과 시간(elapsed)을 올리고, 일시정지·다시 보기·단계 전환 시 초기화한다.
 * 사용자가 "동작 줄이기" 를 켠 경우 자동 재생하지 않는다.
 */
export function useFlowPlayback(stageKey: Ref<string | number>) {
  const elapsed = ref(0)
  const isPlaying = ref(!prefersReducedMotion())

  let frameId: number | null = null
  let lastTime: number | null = null

  function tick(now: number) {
    if (lastTime !== null) {
      elapsed.value += now - lastTime
    }
    lastTime = now
    frameId = requestAnimationFrame(tick)
  }

  function start() {
    if (frameId !== null || typeof requestAnimationFrame === 'undefined') return
    lastTime = null
    frameId = requestAnimationFrame(tick)
  }

  function stop() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId)
      frameId = null
    }
    lastTime = null
  }

  function play() {
    isPlaying.value = true
    start()
  }

  function pause() {
    isPlaying.value = false
    stop()
  }

  function togglePlay() {
    if (isPlaying.value) pause()
    else play()
  }

  function replay() {
    elapsed.value = 0
    play()
  }

  watch(stageKey, () => {
    elapsed.value = 0
  })

  if (isPlaying.value) start()

  onBeforeUnmount(stop)

  return { elapsed, isPlaying, play, pause, togglePlay, replay }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
