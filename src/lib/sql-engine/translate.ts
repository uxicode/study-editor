/**
 * MySQL 문법 → SQLite 문법 변환.
 *
 * 학습 커리큘럼이 쓰는 MySQL 전용 문법만 다룬다 (AUTO_INCREMENT, 인라인 KEY, ENGINE, COMMENT, EXPLAIN 등).
 * 지원하지 않는 문법은 그대로 두어 SQLite 가 오류를 내도록 한다.
 */

/** 주석을 제거하고 `;` 기준으로 구문을 나눈다 (문자열·백틱 안의 `;` 는 무시) */
export function splitSqlStatements(script: string): string[] {
  const statements: string[] = []
  let current = ''
  let i = 0

  while (i < script.length) {
    const ch = script[i]
    const next = script[i + 1]

    if (ch === '-' && next === '-') {
      while (i < script.length && script[i] !== '\n') i++
      continue
    }
    if (ch === '#') {
      while (i < script.length && script[i] !== '\n') i++
      continue
    }
    if (ch === '/' && next === '*') {
      const end = script.indexOf('*/', i + 2)
      i = end === -1 ? script.length : end + 2
      current += ' '
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch
      current += ch
      i++
      while (i < script.length) {
        current += script[i]
        if (script[i] === quote) {
          if (script[i + 1] === quote) {
            current += script[i + 1]
            i += 2
            continue
          }
          i++
          break
        }
        i++
      }
      continue
    }
    if (ch === ';') {
      if (current.trim()) statements.push(current.trim())
      current = ''
      i++
      continue
    }

    current += ch
    i++
  }

  if (current.trim()) statements.push(current.trim())
  return statements
}

/** MySQL 구문 하나를 SQLite 구문 목록으로 변환한다 (건너뛸 구문은 빈 배열) */
export function translateStatement(statement: string): string[] {
  const sql = statement.trim()

  if (/^(USE|SET|SHOW|DESCRIBE|DESC|CREATE\s+DATABASE|DROP\s+DATABASE)\b/i.test(sql)) {
    return []
  }
  if (/^START\s+TRANSACTION\b/i.test(sql)) {
    return ['BEGIN']
  }
  if (/^EXPLAIN\b/i.test(sql)) {
    const rest = sql
      .replace(/^EXPLAIN\s+(?:ANALYZE\s+|FORMAT\s*=\s*\w+\s+)?/i, '')
      .replace(/^QUERY\s+PLAN\s+/i, '')
    return [`EXPLAIN QUERY PLAN ${replaceFunctions(rest)}`]
  }
  if (/^CREATE\s+(?:TEMPORARY\s+)?TABLE\b/i.test(sql)) {
    return translateCreateTable(sql)
  }

  return [replaceFunctions(sql)]
}

function replaceFunctions(sql: string): string {
  return sql.replace(/\bNOW\s*\(\s*\)/gi, 'CURRENT_TIMESTAMP')
}

interface CreateTableParts {
  head: string
  body: string
  tableName: string
}

function parseCreateTable(sql: string): CreateTableParts | null {
  const open = sql.indexOf('(')
  if (open === -1) return null

  let depth = 0
  let quote: string | null = null
  let close = -1
  for (let i = open; i < sql.length; i++) {
    const ch = sql[i]
    if (quote) {
      if (ch === quote) quote = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch
    } else if (ch === '(') {
      depth++
    } else if (ch === ')') {
      depth--
      if (depth === 0) {
        close = i
        break
      }
    }
  }
  if (close === -1) return null

  const head = sql.slice(0, open).trim()
  const nameMatch = head.match(/([`"]?)(\w+)\1\s*$/)
  if (!nameMatch) return null

  return { head, body: sql.slice(open + 1, close), tableName: nameMatch[2] }
}

function splitTopLevel(body: string): string[] {
  const parts: string[] = []
  let depth = 0
  let quote: string | null = null
  let current = ''

  for (const ch of body) {
    if (quote) {
      current += ch
      if (ch === quote) quote = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch
      current += ch
    } else if (ch === '(') {
      depth++
      current += ch
    } else if (ch === ')') {
      depth--
      current += ch
    } else if (ch === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function translateCreateTable(sql: string): string[] {
  const parts = parseCreateTable(sql)
  if (!parts) return [sql]

  const extraStatements: string[] = []
  const definitions: string[] = []

  for (const definition of splitTopLevel(parts.body)) {
    const keyMatch = definition.match(/^(UNIQUE\s+)?(?:KEY|INDEX)\s+(?:[`"]?(\w+)[`"]?\s*)?\(([^)]+)\)/i)
    if (keyMatch) {
      const [, unique, indexName, columns] = keyMatch
      if (unique) {
        definitions.push(`UNIQUE (${columns})`)
      } else {
        const name = indexName ?? `idx_${parts.tableName}_${columns.replace(/\W+/g, '_')}`
        extraStatements.push(`CREATE INDEX ${name} ON ${parts.tableName} (${columns})`)
      }
      continue
    }
    if (/^(FULLTEXT|SPATIAL)\b/i.test(definition)) continue

    definitions.push(isTableConstraint(definition) ? definition : translateColumn(definition))
  }

  return [`${parts.head} (\n  ${definitions.join(',\n  ')}\n)`, ...extraStatements]
}

function isTableConstraint(definition: string): boolean {
  return /^(CONSTRAINT\b|PRIMARY\s+KEY\b|FOREIGN\s+KEY\b|UNIQUE\b|CHECK\b)/i.test(definition)
}

function translateColumn(definition: string): string {
  let column = definition
    .replace(/\b(?:UNSIGNED|ZEROFILL)\b/gi, '')
    .replace(/\bCOMMENT\s+'(?:[^']|'')*'/gi, '')
    .replace(/\bON\s+UPDATE\s+CURRENT_TIMESTAMP(?:\s*\(\s*\d*\s*\))?/gi, '')
    .replace(/\b(?:CHARACTER\s+SET|CHARSET)\s+\w+/gi, '')
    .replace(/\bCOLLATE\s+\w+/gi, '')

  column = replaceFunctions(column)

  const enumMatch = column.match(/^([`"]?\w+[`"]?)\s+ENUM\s*\(([^)]*)\)/i)
  if (enumMatch) {
    column = column.replace(enumMatch[0], `${enumMatch[1]} TEXT CHECK (${enumMatch[1]} IN (${enumMatch[2]}))`)
  }

  if (/\bAUTO_INCREMENT\b/i.test(column)) {
    column = column
      .replace(/^([`"]?\w+[`"]?)\s+(?:TINYINT|SMALLINT|MEDIUMINT|INT|INTEGER|BIGINT)(?:\s*\(\d+\))?/i, '$1 INTEGER')
      .replace(/\bAUTO_INCREMENT\b/gi, '')
    if (/\bPRIMARY\s+KEY\b/i.test(column)) {
      column = column.replace(/\bPRIMARY\s+KEY\b/i, 'PRIMARY KEY AUTOINCREMENT')
    }
  }

  return column.replace(/\s+/g, ' ').trim()
}
