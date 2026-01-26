/**
 * Node.js 모듈 폴리필 (브라우저 환경용)
 * PGlite가 Node.js 모듈을 참조할 때 사용
 */

// 빈 객체로 대체하여 에러 방지
export const nodePolyfills = {
  fs: {},
  path: {
    resolve: (...args: string[]) => args.join('/'),
    join: (...args: string[]) => args.join('/'),
    dirname: (path: string) => path.split('/').slice(0, -1).join('/') || '.',
    basename: (path: string) => path.split('/').pop() || '',
    extname: (path: string) => {
      const parts = path.split('.')
      return parts.length > 1 ? '.' + parts.pop() : ''
    }
  },
  os: {
    platform: () => 'browser',
    homedir: () => '/'
  },
  crypto: {
    randomBytes: (size: number) => {
      const array = new Uint8Array(size)
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(array)
      } else {
        // 폴백: Math.random 사용
        for (let i = 0; i < size; i++) {
          array[i] = Math.floor(Math.random() * 256)
        }
      }
      return array
    }
  }
}
