## 개발 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd study-editor

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 프로젝트 구조

```
src/
├── components/          # Vue 컴포넌트
│   └── learning-environment/
├── composables/         # Vue Composition API 함수
├── data/               # 정적 데이터 (커리큘럼)
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
└── styles/             # 전역 스타일
```

## 학습 단계 (Curriculum Steps) 개요

현재 프로젝트는 9단계로 구성되어 있습니다:

1. **Step 1: Prisma 초기 설정** - Prisma와 데이터베이스 연결
2. **Step 2-1: User 모델 정의 (기본)** - 기본 필드와 속성
3. **Step 2-2: User 모델 정의 (타임스탬프)** - 생성일/수정일 추가
4. **Step 2-3: User 모델 정의 (실무 기능)** - enum, @@map 활용
5. **Step 3: Create - 사용자 생성** - Prisma Client로 데이터 생성
6. **Step 4-1: Read - 기본 조회 메서드** - findMany, findUnique, findFirst
7. **Step 4-2: Read - 정렬과 필드 선택** - orderBy, select
8. **Step 4-3: Read - 페이징과 복합 쿼리** - skip/take, 복합 옵션

### Step 4 상세 구성

Step 4는 총 3단계로 나뉘어 Prisma 조회 기능을 체계적으로 학습합니다:

#### Step 4-1: Read - 기본 조회 메서드

세 가지 기본 조회 메서드의 차이점과 사용법을 학습합니다.

**학습 내용:**
- `findMany()`: 여러 레코드 조회 (배열 반환)
- `findUnique()`: @unique/@id 필드로 단건 조회 (속도 빠름)
- `findFirst()`: 일반 필드로 첫 번째 레코드 조회
- `where` 조건으로 필터링 (단일/복합 조건)

#### Step 4-2: Read - 정렬과 필드 선택

데이터 정렬과 필드 선택을 통한 최적화를 학습합니다.

**학습 내용:**
- `orderBy`: 오름차순/내림차순 정렬 (asc/desc)
- 다중 정렬: 우선순위를 둔 정렬
- `select`: 특정 필드만 선택
- 성능 최적화 및 보안 (민감 정보 제외)
- 옵션 조합: where + orderBy + select

#### Step 4-3: Read - 페이징과 복합 쿼리

페이징 구현과 복잡한 쿼리 작성법을 학습합니다.

**학습 내용:**
- `skip` & `take`: 페이징 구현
- 페이지 계산 공식: `skip: (page - 1) * pageSize`
- `count()`: 전체 개수 조회
- 복합 쿼리: where + orderBy + skip/take + select 조합
- 실무 페이징 패턴 (pagination 객체 반환)

## 새로운 학습 단계 추가하기

Step 2는 총 3단계로 나뉘어 점진적으로 학습합니다:

#### Step 2-1: User 모델 정의 (기본)

기본적인 Prisma 모델 구조와 필수 속성을 학습합니다.

#### Step 2-1: User 모델 정의 (기본)

기본적인 Prisma 모델 구조와 필수 속성을 학습합니다.

#### Prisma 모델 기본 구조

```prisma
model ModelName {
  fieldName FieldType @attribute1 @attribute2
}
```

#### 필드 타입 (FieldType)
- `Int`: 정수 (자동 증가 ID에 주로 사용)
- `String`: 문자열 (이메일, 이름 등)
- `Boolean`: 참/거짓
- `DateTime`: 날짜/시간
- `Float`: 실수
- `String?`: 선택적 필드 (nullable, 물음표 추가)

#### 필드 속성 (Attributes)

필드 속성은 `@` 기호로 시작하며, 여러 개를 연달아 사용할 수 있습니다.

**기본 키 관련:**
- `@id`: 기본 키(Primary Key)로 지정
- `@default(autoincrement())`: 자동 증가 값 생성 (주로 ID에 사용)
  - `autoincrement()`는 PostgreSQL의 SERIAL 타입과 동일
  - 새 레코드 생성 시 자동으로 1씩 증가
  - **왜 사용?** 개발자가 수동으로 ID를 지정하지 않아도 됨

**제약 조건:**
- `@unique`: 고유 제약 조건 (중복 값 방지)
  - 예: 이메일은 중복되면 안 되므로 `email String @unique`
- `@default(value)`: 기본값 지정
  - `@default(true)`: Boolean 필드의 기본값
  - `@default(now())`: DateTime 필드의 현재 시간
  - `@default("ACTIVE")`: String 필드의 기본값

**여러 속성 동시 사용:**

```prisma
model User {
  id    Int     @id @default(autoincrement())  // ✅ @id와 @default를 함께 사용
  email String  @unique @default("unknown")    // ✅ @unique와 @default를 함께 사용
}
```

- 속성은 공백으로 구분하여 여러 개 사용 가능
- 순서는 관계없지만, 관례적으로 `@id`를 먼저 작성

**선택적 필드 (`?`):**

```prisma
name String?  // NULL 값 허용
age  Int      // NULL 값 불허 (필수 필드)
```

#### 실제 예시 분석

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

1. **`id Int @id @default(autoincrement())`**
   - `Int`: 정수 타입
   - `@id`: 기본 키로 지정 (테이블에서 각 행을 고유하게 식별)
   - `@default(autoincrement())`: 자동 증가 (1, 2, 3...)
   - **두 속성을 같이 쓰는 이유**: ID는 기본 키이면서 자동 생성되어야 하므로

2. **`email String @unique`**
   - `String`: 문자열 타입
   - `@unique`: 중복된 이메일 방지 (회원가입 시 유용)

3. **`name String?`**
   - `String?`: 선택적 문자열 (NULL 허용)
   - 이름을 입력하지 않아도 사용자 생성 가능

#### Step 2-2: User 모델 정의 (타임스탬프)

실무에서 필수인 생성일/수정일 추적 기능을 학습합니다.

**@default(now()) - 생성일**
```prisma
createdAt DateTime @default(now())
```
- 레코드가 처음 생성될 때의 시간을 자동으로 저장합니다
- 회원가입 시간, 게시글 작성 시간 등을 자동으로 기록
- 한 번 설정되면 변경되지 않음

**@updatedAt - 수정일**
```prisma
updatedAt DateTime @updatedAt
```
- 데이터가 수정될 때마다 Prisma가 자동으로 현재 서버 시간을 갱신하여 저장합니다
- 개발자가 직접 시간을 업데이트할 필요 없음
- 최근 업데이트된 데이터 정렬에 활용

**차이점:**
- `@default(now())`: 생성 시 한 번만 설정 (생성일)
- `@updatedAt`: 생성 시 + 수정 시마다 자동 갱신 (수정일)

#### Step 2-3: User 모델 정의 (실무 기능)

enum과 @@map을 활용한 실무 수준의 모델 설계를 학습합니다.

**enum - 정해진 선택지**
```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  role Role @default(USER)
}
```
- ROLE, STATUS 처럼 정해진 선택지 중 하나만 골라야 할 때 사용합니다
- 타입 안전성을 보장하고 오타를 방지합니다
- 사용자 역할, 계정 상태, 주문 상태 등에 활용

**@@map - 테이블 이름 매핑**
```prisma
model User {
  id Int @id
  
  @@map("users")  // DB 테이블 이름
}
```
- 모델 이름은 User이지만, 실제 DB 테이블 이름은 users로 만들고 싶을 때 사용합니다
- 복수형 관례 대응 (User → users, Post → posts)
- 레거시 DB 연동 시 기존 테이블 이름 유지 가능

## 새로운 학습 단계 추가하기

1. `src/data/curriculum-steps.ts`에 새로운 `CurriculumStep` 객체 추가
2. `initialFiles` 배열에 필요한 파일 템플릿 정의
3. `validator` 객체에 정적/동적 검증 로직 작성
4. `hints` 배열에 단계별 힌트 추가
5. `content.theory` 섹션에 충분한 설명 추가 (특히 속성과 타입)

### 예시

```typescript
{
  id: 'step-5',
  title: '새로운 단계',
  order: 5,
  category: 'create',
  content: {
    mission: '미션 설명',
    theory: '이론 내용',
    objectives: ['목표1', '목표2']
  },
  initialFiles: [
    {
      name: 'app.js',
      path: 'app.js',
      language: 'javascript',
      content: '// 코드를 작성하세요'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'app.js',
        pattern: 'prisma',
        message: 'Prisma를 사용해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: []
}
```

## 코드 스타일

- TypeScript strict mode 사용
- Vue 3 Composition API 사용
- 함수형 프로그래밍 스타일 선호
- 명확한 변수명 사용 (isLoading, hasError 등)

## 커밋 메시지

- `feat: 새로운 기능 추가`
- `fix: 버그 수정`
- `docs: 문서 수정`
- `style: 코드 포맷팅`
- `refactor: 코드 리팩토링`
- `test: 테스트 추가/수정`

## Pull Request

1. Feature 브랜치 생성
2. 변경사항 커밋
3. PR 생성 및 설명 작성
4. 코드 리뷰 대기

## 질문이나 제안

이슈를 생성해주세요!
