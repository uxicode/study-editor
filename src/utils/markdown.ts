/**
 * 간단한 마크다운 파서
 * 실제 프로덕션에서는 markdown-it 같은 라이브러리 사용 권장
 */

export function parseMarkdown(text: string): string {
  let result = text
  
  // 코드 블록을 임시로 보호 (테이블 변환 시 코드 블록 안의 테이블은 변환하지 않음)
  const codeBlockPlaceholders: string[] = []
  result = result.replace(/```(\w+)?\n([\s\S]*?)```/g, (match) => {
    const placeholder = `__CODE_BLOCK_${codeBlockPlaceholders.length}__`
    codeBlockPlaceholders.push(match)
    return placeholder
  })
  
  // 테이블 변환 (줄 단위로 처리)
  const lines = result.split('\n')
  const output: string[] = []
  let inTable = false
  let tableRows: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|')
    const isSeparator = /^\|[\s\-:|]+\|$/.test(line.trim())
    
    if (isTableRow && !isSeparator) {
      // 테이블 행 시작
      if (!inTable) {
        inTable = true
        tableRows = []
      }
      tableRows.push(line)
    } else if (isSeparator && inTable) {
      // 구분선은 무시 (헤더와 데이터 행 구분용)
      continue
    } else {
      // 테이블이 끝남
      if (inTable && tableRows.length > 0) {
        // 테이블 HTML 생성
        const tableHTML = convertTableToHTML(tableRows)
        output.push(tableHTML)
        tableRows = []
        inTable = false
      }
      output.push(line)
    }
  }
  
  // 마지막 테이블 처리
  if (inTable && tableRows.length > 0) {
    const tableHTML = convertTableToHTML(tableRows)
    output.push(tableHTML)
  }
  
  result = output.join('\n')
  
  // 코드 블록 복원
  codeBlockPlaceholders.forEach((codeBlock, index) => {
    result = result.replace(`__CODE_BLOCK_${index}__`, codeBlock)
  })
  
  // 코드 블록 변환
  result = result.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
  
  // 테이블을 임시로 보호 (줄바꿈 변환 시 테이블 내부 줄바꿈이 변환되지 않도록)
  const tablePlaceholders: string[] = []
  result = result.replace(/<table>[\s\S]*?<\/table>/g, (match) => {
    const placeholder = `__TABLE_${tablePlaceholders.length}__`
    tablePlaceholders.push(match)
    return placeholder
  })
  
  // 나머지 변환
  result = result
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
    // 링크
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    // 줄바꿈
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
  
  // 테이블 복원
  tablePlaceholders.forEach((table, index) => {
    result = result.replace(`__TABLE_${index}__`, table)
  })
  
  return result
}

/**
 * 테이블 행 배열을 HTML 테이블로 변환
 */
function convertTableToHTML(rows: string[]): string {
  if (rows.length === 0) return ''
  
  // 첫 번째 행을 헤더로 처리
  const headerRow = rows[0]
  const headerCells = headerRow.split('|')
    .map((cell: string) => cell.trim())
    .filter((cell: string) => cell.length > 0)
  
  const headerHTML = `<tr>${headerCells.map((cell: string) => `<th>${cell}</th>`).join('')}</tr>`
  
  // 나머지 행을 데이터 행으로 처리
  const dataRows = rows.slice(1).map((row: string) => {
    const cells = row.split('|')
      .map((cell: string) => cell.trim())
      .filter((cell: string) => cell.length > 0)
    
    // 셀 개수가 헤더와 다르면 빈 셀 추가
    while (cells.length < headerCells.length) {
      cells.push('')
    }
    
    return `<tr>${cells.map((cell: string) => `<td>${cell}</td>`).join('')}</tr>`
  }).join('')
  
  return `<table>${headerHTML}${dataRows}</table>`
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^#+\s+/gm, '')
}
