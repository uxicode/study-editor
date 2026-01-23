# WebContainers 제한사항 및 해결방법

## Prisma Client Import 문제

### 문제
WebContainers 환경에서 Prisma Client가 CommonJS 모듈로 빌드되어 있어, ES Module 방식의 named import가 작동하지 않습니다.

```javascript
// ❌ 작동하지 않음
import { PrismaClient } from '@prisma/client'
```

### 해결방법
CommonJS 호환 import 구문을 사용하세요:

```javascript
// ✅ 올바른 방법
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()
```

## 기타 알려진 제한사항

### 1. 데이터베이스 연결
WebContainers는 실제 PostgreSQL 서버에 연결할 수 없습니다. 대신:
- PGlite (WASM PostgreSQL) 사용
- SQLite 사용
- 또는 Mock 데이터 사용

### 2. 파일 시스템
- 메모리 내 파일 시스템 사용
- 세션 종료 시 모든 데이터 소실
- 대용량 파일 처리 제한

### 3. 네트워크
- 외부 API 호출 제한
- localhost만 접근 가능

### 4. Node.js 모듈
일부 네이티브 모듈은 작동하지 않을 수 있습니다:
- bcrypt (대신 bcryptjs 사용)
- sharp
- node-gyp 기반 모듈

## 권장사항

### 학습 환경에 적합한 구성
```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0"
  }
}
```

### Import 패턴
모든 Prisma 관련 코드에서 CommonJS 호환 import 사용:

```javascript
// 표준 패턴
import pkg from '@prisma/client'
const { PrismaClient } = pkg
```

### 데이터베이스 URL
```env
DATABASE_URL="file:./dev.db"  # SQLite 사용
# 또는
DATABASE_URL="postgresql://user:pass@localhost:5432/db"  # PGlite
```

## 트러블슈팅

### "Named export not found" 에러
→ CommonJS 호환 import 사용

### "Module not found" 에러
→ npm install 확인

### Prisma Generate 실패
→ schema.prisma 경로 확인 (prisma/schema.prisma)

### 데이터베이스 연결 실패
→ DATABASE_URL 환경변수 확인

## 참고 자료
- [WebContainers 공식 문서](https://webcontainers.io/)
- [Prisma 문서](https://www.prisma.io/docs)
- [ES Modules vs CommonJS](https://nodejs.org/api/esm.html)
