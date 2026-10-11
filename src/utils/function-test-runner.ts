import type { FunctionTest } from '@/types/curriculum'
import type { RuntimeFile, FunctionTestResult } from '@/types/runtime'

const TYPE_ATOM = String.raw`(?:[\w.]+(?:<[^<>()]*>)?(?:\[\])*|'[^']*'|"[^"]*")`
const TYPE_EXPR = String.raw`${TYPE_ATOM}(?:\s*\|\s*${TYPE_ATOM})*`

const RETURN_TYPE_RE = new RegExp(String.raw`\)\s*:\s*${TYPE_EXPR}\s*(?=\{|=>)`, 'g')
const VARIABLE_TYPE_RE = new RegExp(String.raw`\b(const|let|var)\s+(\w+)\s*:\s*${TYPE_EXPR}\s*=`, 'g')
const PARAM_TYPE_RE = new RegExp(String.raw`(\w+)\s*\??\s*:\s*${TYPE_EXPR}`, 'g')
const AS_TYPE_RE = new RegExp(String.raw`\s+as\s+(?:const\b|${TYPE_EXPR})`, 'g')

function stripParamTypes(params: string): string {
  return params.replace(PARAM_TYPE_RE, '$1')
}

/**
 * 객체 리터럴(`{ a: b }`)과 삼항식(`x ? y : z`)의 콜론은 건드리지 않도록
 * 함수 파라미터 목록·반환 타입·변수 선언 타입만 제거한다.
 */
function stripTypeScript(code: string): string {
  return code
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+/g, '')
    .replace(/^\s*interface\s+\w+[^{]*\{[\s\S]*?^\s*\}/gm, '')
    .replace(/^\s*type\s+\w+\s*=[\s\S]*?;/gm, '')
    .replace(RETURN_TYPE_RE, ')')
    .replace(/(function\s*\w*\s*\()([^)]*)\)/g, (_m, head: string, params: string) => `${head}${stripParamTypes(params)})`)
    .replace(/\(([^()]*)\)(\s*=>)/g, (_m, params: string, arrow: string) => `(${stripParamTypes(params)})${arrow}`)
    .replace(VARIABLE_TYPE_RE, '$1 $2 =')
    .replace(AS_TYPE_RE, '')
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  return JSON.stringify(value)
}

function formatCall(functionName: string, args: unknown[]): string {
  return `${functionName}(${args.map(formatValue).join(', ')})`
}

function isDeepEqual(actual: unknown, expected: unknown): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

function loadFunctionFromFile(
  file: RuntimeFile,
  functionName: string
): { fn: (...args: unknown[]) => unknown } | { error: string } {
  const cleanedCode = stripTypeScript(file.content)

  try {
    const runner = new Function(`
      ${cleanedCode}
      if (typeof ${functionName} !== 'function') {
        throw new Error('${functionName} 함수를 찾을 수 없습니다.')
      }
      return ${functionName};
    `)
    const fn = runner()

    if (typeof fn !== 'function') {
      return { error: `${functionName} 함수를 찾을 수 없습니다.` }
    }

    return { fn }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export function runFunctionTests(
  files: RuntimeFile[],
  functionTests: FunctionTest[]
): FunctionTestResult[] {
  const results: FunctionTestResult[] = []

  for (const suite of functionTests) {
    const targetFile = files.find(file => file.path === suite.target)

    if (!targetFile) {
      results.push({
        description: `${suite.functionName} 테스트`,
        call: suite.functionName,
        expected: '-',
        actual: '-',
        passed: false,
        error: `파일을 찾을 수 없습니다: ${suite.target}`
      })
      continue
    }

    const loaded = loadFunctionFromFile(targetFile, suite.functionName)

    if ('error' in loaded) {
      results.push({
        description: `${suite.functionName} 로드`,
        call: suite.functionName,
        expected: '-',
        actual: '-',
        passed: false,
        error: loaded.error
      })
      continue
    }

    for (const testCase of suite.cases) {
      const call = formatCall(suite.functionName, testCase.args)

      try {
        const actual = loaded.fn(...testCase.args)
        const passed = isDeepEqual(actual, testCase.expected)

        results.push({
          description: testCase.description,
          call,
          expected: formatValue(testCase.expected),
          actual: formatValue(actual),
          passed
        })
      } catch (error) {
        results.push({
          description: testCase.description,
          call,
          expected: formatValue(testCase.expected),
          actual: '-',
          passed: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }

  return results
}

export function formatFunctionTestLogs(results: FunctionTestResult[]): string[] {
  if (results.length === 0) {
    return []
  }

  const logs = ['', '🧪 함수 테스트 결과:']

  for (const result of results) {
    if (result.error) {
      logs.push(`  ✗ ${result.description}: ${result.error}`)
      continue
    }

    if (result.passed) {
      logs.push(`  ✓ ${result.description}: ${result.call} => ${result.actual}`)
      continue
    }

    logs.push(
      `  ✗ ${result.description}: ${result.call} => ${result.actual} (기대값: ${result.expected})`
    )
  }

  return logs
}
