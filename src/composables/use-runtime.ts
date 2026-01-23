import { ref } from 'vue'
import { WebContainer } from '@webcontainer/api'
import type { RuntimeFile, ExecutionResult } from '@/types/runtime'
import { runCommand, dirExists } from '@/utils/webcontainer-helper'

// 전역 저장소를 사용하여 WebContainer 인스턴스 재사용
const WEBCONTAINER_KEY = '__webcontainer_instance__'

function getGlobalWebContainer(): WebContainer | null {
  return (window as any)[WEBCONTAINER_KEY] || null
}

function setGlobalWebContainer(instance: WebContainer) {
  (window as any)[WEBCONTAINER_KEY] = instance
}

export function useRuntime() {
  const isExecuting = ref(false)
  const isInitialized = ref(false)

  async function initializeWebContainer() {
    // 전역 저장소에서 기존 인스턴스 확인
    const existingInstance = getGlobalWebContainer()
    if (existingInstance) {
      console.log('Reusing existing WebContainer instance')
      isInitialized.value = true
      return existingInstance
    }

    try {
      console.log('Initializing WebContainer...')
      const instance = await WebContainer.boot()
      setGlobalWebContainer(instance)
      isInitialized.value = true
      console.log('WebContainer initialized successfully')
      return instance
    } catch (error) {
      console.error('Failed to initialize WebContainer:', error)
      throw error
    }
  }

  async function executeCode(files: RuntimeFile[]): Promise<ExecutionResult> {
    isExecuting.value = true
    const logs: string[] = []

    try {
      const container = await initializeWebContainer()

      // 파일 시스템에 파일 작성
      logs.push('Writing files to virtual filesystem...')
      for (const file of files) {
        // 디렉토리가 필요한 경우 먼저 생성
        const pathParts = file.path.split('/')
        if (pathParts.length > 1) {
          const dirPath = pathParts.slice(0, -1).join('/')
          try {
            await container.fs.mkdir(dirPath, { recursive: true })
          } catch (e) {
            // 디렉토리가 이미 존재하면 무시
          }
        }
        
        await container.fs.writeFile(file.path, file.content)
        logs.push(`  ✓ ${file.path}`)
      }

      // package.json이 없으면 기본 생성
      const hasPackageJson = files.some(f => f.name === 'package.json')
      if (!hasPackageJson) {
        const defaultPackageJson = {
          name: 'student-code',
          version: '1.0.0',
          type: 'module',
          dependencies: {
            '@prisma/client': '^5.0.0',
            prisma: '^5.0.0'
          }
        }
        await container.fs.writeFile('package.json', JSON.stringify(defaultPackageJson, null, 2))
        logs.push('  ✓ package.json (generated)')
      }

      // 의존성 설치
      logs.push('Installing dependencies...')
      const { exitCode: installExitCode, output: installOutput } = await runCommand(
        container,
        'npm',
        ['install'],
        { logPrefix: '[npm] ', throwOnError: false }
      )
      
      if (installExitCode !== 0) {
        logs.push('  ✗ npm install failed')
        logs.push(`  Output: ${installOutput}`)
        throw new Error(`npm install failed\n${installOutput}`)
      }
      logs.push('  ✓ Dependencies installed')

      // Prisma 초기화 (schema.prisma가 있는 경우)
      const hasPrismaSchema = files.some(f => f.name === 'schema.prisma')
      if (hasPrismaSchema) {
        logs.push('Running Prisma generate...')
        
        const { exitCode: generateExitCode, output: generateOutput } = await runCommand(
          container,
          'npx',
          ['prisma', 'generate'],
          { logPrefix: '[Prisma] ', throwOnError: false }
        )
        
        if (generateExitCode !== 0) {
          logs.push('  ✗ Prisma generate failed')
          logs.push(`  Output: ${generateOutput}`)
          throw new Error(`Prisma generate failed\n${generateOutput}`)
        }
        
        logs.push('  ✓ Prisma client generated')
        
        // 생성된 client가 있는지 확인
        const clientDirExists = await dirExists(container, 'node_modules/.prisma/client')
        if (clientDirExists) {
          const clientFiles = await container.fs.readdir('node_modules/.prisma/client')
          logs.push(`  ✓ Client files: ${clientFiles.length} files`)
        } else {
          logs.push('  ⚠ Warning: .prisma/client directory not found')
        }
      }

      // 메인 파일 실행 (app.js 또는 index.js)
      const mainFile = files.find(f => f.name === 'app.js' || f.name === 'index.js')
      if (!mainFile) {
        throw new Error('No main file (app.js or index.js) found')
      }

      logs.push(`Executing ${mainFile.name}...`)
      const execProcess = await container.spawn('node', [mainFile.path])

      let output = ''
      let error = ''

      execProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data
          }
        })
      )

      const exitCode = await execProcess.exit

      if (exitCode !== 0) {
        error = output
        return {
          success: false,
          output: '',
          error,
          logs
        }
      }

      logs.push('  ✓ Execution completed')

      return {
        success: true,
        output,
        error: undefined,
        logs,
        queryLogs: [] // TODO: Prisma 쿼리 로그 파싱
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logs.push(`  ✗ Error: ${errorMessage}`)

      return {
        success: false,
        output: '',
        error: errorMessage,
        logs
      }
    } finally {
      isExecuting.value = false
    }
  }

  async function cleanup() {
    const instance = getGlobalWebContainer()
    if (instance) {
      // WebContainer 인스턴스를 전역에서 제거
      // 실제 인스턴스는 브라우저가 관리하므로 참조만 제거
      (window as any)[WEBCONTAINER_KEY] = null
      isInitialized.value = false
      console.log('WebContainer reference cleared')
    }
  }

  return {
    isExecuting,
    isInitialized,
    initializeWebContainer,
    executeCode,
    cleanup
  }
}
