import type { FunctionTest } from '@/types/curriculum'
import type { RuntimeFile, FunctionTestResult } from '@/types/runtime'

function stripTypeScript(code: string): string {
  return code
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+/g, '')
    .replace(/(?:interface|type)\s+\w+[\s\S]*?\{[\s\S]*?\}/g, '')
    .replace(/type\s+\w+\s*=[\s\S]*?;/g, '')
    .replace(/:\s*(?:string|number|boolean|any|void|object|unknown|never|Record<[\w, ]+>|Array<[\w]+>|\w+\[\]|\w+)\b/g, '')
    .replace(/\s+as\s+[\w<>[\]]+/g, '')
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
