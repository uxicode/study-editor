# 빠른 시작 가이드

## 5분 안에 시작하기

### 1단계: 설치
```bash
npm install
```

### 2단계: 실행
```bash
npm run dev
```

### 3단계: 브라우저 열기
브라우저에서 http://localhost:5173/ 접속

---

## 첫 번째 단계 완료하기

### 1. Step 1: Prisma 초기 설정

좌측 패널의 지시사항을 읽고:

```prisma
// schema.prisma 파일에서
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

"✓ 정답 확인" 버튼 클릭!

### 2. Step 2: User 모델 정의

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

### 3. Step 3: 사용자 생성

```javascript
const newUser = await prisma.user.create({
  data: {
    email: "alice@example.com",
    name: "Alice"
  }
})
```

---

## 💡 팁

1. **힌트 활용**: 막힐 때는 "💡 힌트" 버튼 클릭
2. **콘솔 확인**: 하단 패널에서 실행 결과 확인
3. **진행 저장**: 브라우저 LocalStorage에 자동 저장

---

## 🔥 다음 단계

- Step 4에서 데이터 조회 배우기
- 완료한 단계는 자동으로 체크됩니다
- 언제든지 이전 단계로 돌아갈 수 있습니다

---

## 문제 해결

### 서버가 시작되지 않아요
```bash
# 포트가 이미 사용 중인 경우
pkill -f vite
npm run dev
```

### 타입 에러가 나요
```bash
npx vue-tsc --noEmit
```

### 패키지 설치가 안 돼요
```bash
rm -rf node_modules package-lock.json
npm install
```

---

행복한 학습 되세요! 🚀
