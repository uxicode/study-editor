/**
 * 간단한 마크다운 파서
 * 실제 프로덕션에서는 markdown-it 같은 라이브러리 사용 권장
 */

export function parseMarkdown(text: string): string {
  return text
    // 헤더
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 볼드
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 이탤릭
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 인라인 코드
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // 코드 블록
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // 링크
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    // 줄바꿈
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^#+\s+/gm, '')
}
