import type { WebContainer } from '@webcontainer/api'

/**
 * WebContainer에서 명령을 실행하고 출력을 수집합니다
 */
export async function runCommand(
  container: WebContainer,
  command: string,
  args: string[],
  options: {
    logPrefix?: string
    throwOnError?: boolean
  } = {}
): Promise<{ exitCode: number; output: string }> {
  const { logPrefix = '', throwOnError = true } = options

  console.log(`${logPrefix}Running: ${command} ${args.join(' ')}`)

  const process = await container.spawn(command, args)

  let output = ''
  
  process.output.pipeTo(
    new WritableStream({
      write(data) {
        output += data
        if (logPrefix) {
          console.log(`${logPrefix}${data}`)
        }
      }
    })
  )

  const exitCode = await process.exit

  if (throwOnError && exitCode !== 0) {
    throw new Error(
      `Command failed: ${command} ${args.join(' ')}\nExit code: ${exitCode}\nOutput: ${output}`
    )
  }

  return { exitCode, output }
}

/**
 * 파일 존재 여부를 확인합니다
 */
export async function fileExists(
  container: WebContainer,
  path: string
): Promise<boolean> {
  try {
    await container.fs.readFile(path)
    return true
  } catch {
    return false
  }
}

/**
 * 디렉토리 존재 여부를 확인합니다
 */
export async function dirExists(
  container: WebContainer,
  path: string
): Promise<boolean> {
  try {
    await container.fs.readdir(path)
    return true
  } catch {
    return false
  }
}
