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

  // command - 보통 npm, npx, node 등
  // args - 보통 명령어 인자 (install, generate, start 등)
  //  npm install 실행 예시: const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  //  설치 완료 대기: await installProcess.exit;
  //  npx prisma generate 실행 예시: const generateProcess = await webcontainerInstance.spawn('npx', ['prisma', 'generate']);
  //  생성 완료 대기: await generateProcess.exit;
  //  node app.js 실행 예시: const nodeProcess = await webcontainerInstance.spawn('node', ['app.js']);
  //  실행 완료 대기: await nodeProcess.exit;
  // WebContainer의 spawn 메서드는 표준 출력(stdout)과 표준 에러(stderr)를 포함하는 ReadableStream을 반환.
  const process = await container.spawn(command, args)

  let output = ''
  
  // 출력 스트림 연결: process.output.pipeTo(new WritableStream({ write(data) { output += data; if (logPrefix) { console.log(`${logPrefix}${data}`); } } }))
  // npm install 설치시 출력 예시: npm install 실행 중...
  // installProcess.output: npm install이 실행되면서 출력하는 텍스트 데이터(예: "Installing...", "Added 150 packages...")가 흐르는 입구.
  // .pipeTo(dest): 이 흐름을 낚아채서 특정 목적지(dest)로 쏟아부어 줌.
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
/* // WritableStream의 생성자 안에는 데이터 흐름의 각 단계(시작, 쓰기, 종료, 에러)를 제어할 수 있는 핸들러 예시
  const customStream = new WritableStream({
    // 1. 스트림이 열릴 때 실행 (초기화)
    start(controller) {
      console.log('로그 추적 시작...');
    },
  
    // 2. 데이터(chunk)가 들어올 때마다 실행 (핵심)
    write(chunk) {
      // chunk는 보통 WebContainer에서 보낸 문자열입니다.
      console.log('데이터 수신:', chunk);
      
      // 여기서 터미널에 쓰거나, 특정 단어를 검사할 수 있습니다.
      myTerminal.write(chunk);
    },
  
    // 3. 스트림이 정상적으로 닫힐 때 실행
    close() {
      console.log('모든 데이터 처리가 완료되었습니다.');
    },
  
    // 4. 에러 발생 시 실행
    abort(err) {
      console.error('스트림 처리 중 에러 발생:', err);
    }
  });
 */
  // 명령 실행 완료 대기
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
    // 파일 읽기: await container.fs.readFile(path)
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
