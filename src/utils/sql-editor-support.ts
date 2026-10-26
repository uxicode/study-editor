import * as monaco from 'monaco-editor'

/** 컬럼명으로도 자주 쓰이는 단어(start, end, key, text 등)는 제외한다. */
const KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'NULL', 'INSERT', 'INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'COLUMN',
  'PRIMARY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'DEFAULT', 'CHECK', 'CONSTRAINT',
  'INDEX', 'AUTO_INCREMENT', 'ON', 'CASCADE', 'RESTRICT', 'JOIN', 'INNER', 'LEFT',
  'RIGHT', 'OUTER', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'AS',
  'DISTINCT', 'IN', 'IS', 'LIKE', 'BETWEEN', 'EXISTS', 'UNION', 'ASC', 'DESC', 'IF',
  'TRANSACTION', 'COMMIT', 'ROLLBACK', 'EXPLAIN', 'ANALYZE', 'SHOW', 'USE', 'DATABASE',
  'TRUNCATE', 'WITH', 'RECURSIVE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'UNSIGNED'
])

const TYPES = new Set([
  'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'VARCHAR', 'CHAR', 'DECIMAL',
  'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'FLOAT', 'DOUBLE', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT'
])

/** 컬럼명으로도 쓰이는 타입. `content text` 처럼 식별자 바로 뒤에 올 때만 타입으로 보고 변환한다. */
const CONTEXT_TYPES = new Set(['TEXT', 'DATE', 'TIME', 'YEAR', 'JSON', 'BLOB'])

/** 뒤에 `(` 가 올 때만 함수로 보고 변환한다. */
const FUNCTIONS = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'NOW', 'LAST_INSERT_ID'])

/** 앞 단어가 이 중 하나일 때만 KEY 를 키워드로 본다. */
const KEY_PREFIXES = new Set(['PRIMARY', 'FOREIGN', 'UNIQUE'])

const SNIPPETS: Array<{ label: string; insertText: string; documentation: string }> = [
  {
    label: 'CREATE TABLE',
    insertText: 'CREATE TABLE ${1:table_name} (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  $0\n);',
    documentation: '테이블 생성 기본 틀'
  },
  {
    label: 'FOREIGN KEY',
    insertText:
      'FOREIGN KEY (${1:user_id}) REFERENCES ${2:users}(${3:id}) ON DELETE ${4|CASCADE,RESTRICT,SET NULL|}',
    documentation: '외래키 제약'
  },
  {
    label: 'INSERT INTO',
    insertText: 'INSERT INTO ${1:table_name} (${2:columns}) VALUES (${3:values});',
    documentation: '행 추가'
  },
  {
    label: 'SELECT FROM',
    insertText: 'SELECT ${1:*} FROM ${2:table_name} WHERE ${3:condition};',
    documentation: '조회'
  },
  {
    label: 'INNER JOIN',
    insertText: 'INNER JOIN ${1:table_name} ON ${2:a.id} = ${3:b.a_id}',
    documentation: '내부 조인'
  },
  {
    label: 'CREATE INDEX',
    insertText: 'CREATE INDEX ${1:idx_name} ON ${2:table_name} (${3:column});',
    documentation: '인덱스 생성'
  },
  {
    label: 'EXPLAIN SELECT',
    insertText: 'EXPLAIN SELECT ${1:*} FROM ${2:table_name} WHERE ${3:condition};',
    documentation: '실행 계획 확인'
  }
]

interface KeywordEdit {
  start: number
  end: number
  text: string
}

const TOKEN = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`|--.*$|#.*$)|([A-Za-z_][A-Za-z0-9_]*)/g

/** 한 줄에서 대문자로 바꿔야 할 키워드 위치를 찾는다. 문자열, 주석, 백틱 식별자는 건너뛴다. */
export function findKeywordEdits(line: string): KeywordEdit[] {
  const edits: KeywordEdit[] = []
  let prevWord = ''
  let prevEnd = 0

  for (const match of line.matchAll(TOKEN)) {
    const [token, skipped, word] = match
    const start = match.index ?? 0
    if (skipped || !word) continue

    const upper = word.toUpperCase()
    const afterDot = line[start - 1] === '.'
    const beforeAt = line[start - 1] === '@'
    const followedByParen = /^\s*\(/.test(line.slice(start + token.length))

    const followsIdentifier =
      prevWord !== '' &&
      !KEYWORDS.has(prevWord) &&
      line.slice(prevEnd, start).trim() === ''

    const isKeyword =
      KEYWORDS.has(upper) ||
      TYPES.has(upper) ||
      (CONTEXT_TYPES.has(upper) && followsIdentifier) ||
      (FUNCTIONS.has(upper) && followedByParen) ||
      (upper === 'KEY' && KEY_PREFIXES.has(prevWord))

    if (isKeyword && !afterDot && !beforeAt && word !== upper) {
      edits.push({ start, end: start + word.length, text: upper })
    }
    prevWord = upper
    prevEnd = start + token.length
  }

  return edits
}

function toTextEdits(lineNumber: number, line: string): monaco.languages.TextEdit[] {
  return findKeywordEdits(line).map((edit) => ({
    range: new monaco.Range(lineNumber, edit.start + 1, lineNumber, edit.end + 1),
    text: edit.text
  }))
}

export function registerSqlEditorSupport(languageId: string): void {
  // 자동완성: 키워드와 스니펫을 대문자로 제안한다.
  monaco.languages.registerCompletionItemProvider(languageId, {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position)
      const range = new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn
      )

      const keywordItems = [...KEYWORDS, ...TYPES, ...CONTEXT_TYPES].map((keyword) => ({
        label: keyword,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: keyword,
        range
      }))

      const snippetItems = SNIPPETS.map((snippet) => ({
        label: snippet.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: snippet.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: snippet.documentation,
        range
      }))

      return { suggestions: [...snippetItems, ...keywordItems] }
    }
  })

  // 타이핑 중 변환: 공백, ;, (, ',', 엔터를 칠 때 직전까지의 키워드를 대문자로 바꾼다.
  monaco.languages.registerOnTypeFormattingEditProvider(languageId, {
    autoFormatTriggerCharacters: [' ', ';', '(', ',', '\n'],
    provideOnTypeFormattingEdits(model, position, ch) {
      if (ch === '\n') {
        const prevLine = position.lineNumber - 1
        if (prevLine < 1) return []
        return toTextEdits(prevLine, model.getLineContent(prevLine))
      }
      const before = model.getLineContent(position.lineNumber).slice(0, position.column - 1)
      return toTextEdits(position.lineNumber, before)
    }
  })

  // 문서 포매터(Shift+Alt+F): 붙여 넣은 소문자 SQL 전체를 변환한다.
  monaco.languages.registerDocumentFormattingEditProvider(languageId, {
    provideDocumentFormattingEdits(model) {
      const edits: monaco.languages.TextEdit[] = []
      for (let lineNumber = 1; lineNumber <= model.getLineCount(); lineNumber++) {
        edits.push(...toTextEdits(lineNumber, model.getLineContent(lineNumber)))
      }
      return edits
    }
  })
}
