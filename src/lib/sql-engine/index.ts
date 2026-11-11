import type { SqlLearnerSelectCheck, StepSqlSpec } from '@/types/sql-check'
import { evaluateLearnerSelect, evaluateSqlCheck } from './checks'
import { splitSqlStatements } from './translate'
import { createSqlSession, type SqlExecutionError, type SqlScriptFile, type SqlSession, type StatementResult } from './engine'

export { configureSqlWasm } from './engine'
export type { SqlScriptFile } from './engine'

export type SqlGradeResult =
  | { available: false }
  | { available: true; errors: string[] }

function formatExecutionError(error: SqlExecutionError): string {
  const preview = error.sql.replace(/\s+/g, ' ').slice(0, 80)
  return `${error.file} 의 ${error.index}번째 구문을 실행할 수 없습니다: ${error.message} (${preview})`
}

const CREATE_TABLE_NAME = /^CREATE\s+(?:TEMPORARY\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?/i

/** 숨은 스키마에서, 학습자 파일이 직접 정의한 테이블은 뺀다 (학습자의 정의가 우선) */
function buildPrelude(spec: StepSqlSpec, files: SqlScriptFile[]): string {
  if (!spec.prelude) return ''

  const definedByLearner = new Set(
    files
      .flatMap((file) => splitSqlStatements(file.content))
      .map((statement) => statement.match(CREATE_TABLE_NAME)?.[1]?.toLowerCase())
      .filter((name): name is string => Boolean(name))
  )

  return splitSqlStatements(spec.prelude)
    .filter((statement) => {
      const name = statement.match(CREATE_TABLE_NAME)?.[1]?.toLowerCase()
      return !name || !definedByLearner.has(name)
    })
    .join(';\n')
}

async function createLearnerSelectSession(
  spec: StepSqlSpec,
  files: SqlScriptFile[],
  check: SqlLearnerSelectCheck
): Promise<SqlSession | null> {
  const session = await createSqlSession()
  if (!session) return null

  try {
    session.executeScript(buildPrelude(spec, files))
    session.runFiles(files, { onlyDdl: true })
    if (check.fixture) session.executeScript(check.fixture)
    return session
  } catch {
    session.close()
    return null
  }
}

/**
 * 학습자의 SQL 파일을 실제 엔진에서 실행하고 스텝의 SqlCheck 들을 평가한다.
 * 엔진을 불러오지 못하면 `available: false` 를 돌려주므로 호출 쪽에서 정적 검사로 되돌아가야 한다.
 */
export async function gradeSql(spec: StepSqlSpec, files: SqlScriptFile[]): Promise<SqlGradeResult> {
  const session = await createSqlSession()
  if (!session) return { available: false }

  try {
    session.executeScript(buildPrelude(spec, files))

    const run = session.runFiles(files)
    if (run.error) {
      return { available: true, errors: [formatExecutionError(run.error)] }
    }

    const errors: string[] = []
    const learnerStatements: StatementResult[] = run.statements

    for (const check of spec.checks) {
      if (check.type === 'learnerSelect') {
        const fresh = await createLearnerSelectSession(spec, files, check)
        if (!fresh) {
          errors.push(check.message)
          continue
        }
        try {
          if (!evaluateLearnerSelect(fresh, learnerStatements, check)) errors.push(check.message)
        } finally {
          fresh.close()
        }
        continue
      }

      if (!evaluateSqlCheck(session, check)) errors.push(check.message)
    }

    return { available: true, errors }
  } catch (error) {
    return {
      available: true,
      errors: [`SQL 채점 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`]
    }
  } finally {
    session.close()
  }
}
