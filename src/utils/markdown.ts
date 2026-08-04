/**
 * 견고한 마크다운 파서 유틸리티
 */

/**
 * HTML 특수문자 이스케이프 (코드 블록/인라인 코드 내부 태그가 실제 DOM 요소로 렌더링되는 것 방지)
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function parseMarkdown(text: string): string {
  if (!text) return ''

  let result = normalizeMarkdown(text)

  // 1. 코드 블록(```) 임시 보호 및 100% HTML 이스케이프 처리
  // 언어 지정 뒤의 공백, \r\n, 어떤 언어 명칭이 오더라도 모두 유연하게 매칭
  const codeBlockPlaceholders: string[] = []
  result = result.replace(/```[ \t]*([^\n]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlockPlaceholders.length}__`
    const escapedCode = escapeHtml(code.replace(/\s+$/, ''))
    codeBlockPlaceholders.push(`<pre class="code-block"><code>${escapedCode}</code></pre>`)
    return placeholder
  })

  // 2. 인라인 코드(`...`) 임시 보호 및 HTML 이스케이프 처리
  const inlineCodePlaceholders: string[] = []
  result = result.replace(/`([^`\n]+)`/g, (_match, code) => {
    const placeholder = `__INLINE_CODE_${inlineCodePlaceholders.length}__`
    const escapedCode = escapeHtml(code)
    inlineCodePlaceholders.push(`<code>${escapedCode}</code>`)
    return placeholder
  })

  // 3. 마크다운 테이블 변환
  const lines = result.split('\n')
  const output: string[] = []
  let inTable = false
  let tableRows: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|')
    const isSeparator = /^\|[\s\-:|]+\|$/.test(line.trim())

    if (isTableRow && !isSeparator) {
      if (!inTable) {
        inTable = true
        tableRows = []
      }
      tableRows.push(line)
    } else if (isSeparator && inTable) {
      continue
    } else {
      if (inTable && tableRows.length > 0) {
        output.push(convertTableToHTML(tableRows))
        tableRows = []
        inTable = false
      }
      output.push(line)
    }
  }

  if (inTable && tableRows.length > 0) {
    output.push(convertTableToHTML(tableRows))
  }

  result = output.join('\n')

  // 4. 생성된 HTML 테이블 임시 보호
  const tablePlaceholders: string[] = []
  result = result.replace(/<table>[\s\S]*?<\/table>/g, (match) => {
    const placeholder = `__TABLE_${tablePlaceholders.length}__`
    tablePlaceholders.push(match)
    return placeholder
  })

  // 5. 일반 마크다운 요소 변환
  result = result
    // 헤더 (h1 ~ h3)
    .replace(/^\s*###\s+(.*)$/gim, '<h3>$1</h3>')
    .replace(/^\s*##\s+(.*)$/gim, '<h2>$1</h2>')
    .replace(/^\s*#\s+(.*)$/gim, '<h1>$1</h1>')
    // 인용구 (Blockquote)
    .replace(/^\s*>\s+(.*)$/gim, '<blockquote>$1</blockquote>')
    // 볼드 및 이탤릭
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 순서 없는 리스트 항목 (- 또는 *)
    .replace(/^\s*[\-\*]\s+(.*)$/gim, '<li>$1</li>')
    // 링크
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // 연속된 <li> 항목들을 <ul> 로 감싸기
  result = result.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)

  // 줄바꿈 변환
  result = result
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    // 블록 요소 주변의 불필요한 <br> 정리
    .replace(/(<\/h[1-3]>)<br>/g, '$1')
    .replace(/(<\/blockquote>)<br>/g, '$1')
    .replace(/(<\/ul>)<br>/g, '$1')
    .replace(/(<\/pre>)<br>/g, '$1')

  // 6. 보호했던 테이블, 인라인 코드, 코드 블록 순서대로 완벽 복원
  tablePlaceholders.forEach((table, index) => {
    result = result.replace(`__TABLE_${index}__`, table)
  })

  inlineCodePlaceholders.forEach((codeHTML, index) => {
    result = result.replace(`__INLINE_CODE_${index}__`, codeHTML)
  })

  codeBlockPlaceholders.forEach((codeHTML, index) => {
    result = result.replace(`__CODE_BLOCK_${index}__`, codeHTML)
  })

  return result
}

function normalizeMarkdown(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n')
  const trimmed = normalized.replace(/^\n+/, '').replace(/\n+$/, '')

  const lines = trimmed.split('\n')
  const indents = lines
    .filter(line => line.trim().length > 0)
    .map(line => (line.match(/^\s+/)?.[0].length ?? 0))

  const minIndent = indents.length > 0 ? Math.min(...indents) : 0
  if (minIndent === 0) return trimmed

  return lines
    .map(line => (line.trim().length > 0 ? line.slice(minIndent) : ''))
    .join('\n')
}

/**
 * 마크다운 테이블 배열을 HTML 테이블로 변환
 */
function convertTableToHTML(rows: string[]): string {
  if (rows.length === 0) return ''

  const headerRow = rows[0]
  const headerCells = headerRow
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0)

  const headerHTML = `<thead><tr>${headerCells.map(cell => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>`

  const dataRows = rows.slice(1).map(row => {
    const cells = row
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0)

    while (cells.length < headerCells.length) {
      cells.push('')
    }

    return `<tr>${cells.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
  }).join('')

  return `<table>${headerHTML}<tbody>${dataRows}</tbody></table>`
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^#+\s+/gm, '')
}
