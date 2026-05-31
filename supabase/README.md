# Supabase 설정

이 디렉터리는 학습 플랫폼의 Supabase 프로젝트 스키마/마이그레이션을 보관합니다. 회원 가입·로그인과 진행 상황 저장만 Supabase로 처리하며, 학습용 가상 DB는 프론트엔드의 `src/lib/learning/`에서 처리합니다.

## 적용 방법

### 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com) 에서 프로젝트 생성
2. Project Settings → API에서 다음 값을 복사
   - `Project URL`
   - `anon public` key
3. 프론트엔드 `.env`에 아래 값을 설정

```bash
VITE_SUPABASE_URL="https://<your-project>.supabase.co"
VITE_SUPABASE_ANON_KEY="<your-anon-key>"
```

### 2. 마이그레이션 적용

[migrations/001_user_progress.sql](migrations/001_user_progress.sql) 의 SQL을 다음 중 하나의 방법으로 실행합니다.

- Supabase Dashboard → SQL Editor 에 붙여 넣고 실행
- Supabase CLI 사용 시:

```bash
supabase db push
```

### 3. Auth Provider 활성화

Authentication → Providers 에서 다음 항목을 켭니다.

- Email (기본)
- Google, GitHub (선택)

### 4. 이메일 인증 (Confirm email) 활성화

`Authentication → Providers → Email` 에서 **Confirm email** 토글을 켭니다.
이 설정이 켜져 있으면 회원가입 시 Supabase 가 자동으로 인증 메일을 발송하고,
사용자가 메일의 링크를 클릭해야만 로그인이 가능합니다.

또한 `Authentication → URL Configuration` 에서 다음 값을 설정합니다.

- **Site URL**: `http://localhost:5173` (배포 시에는 실제 도메인)
- **Additional Redirect URLs**: 콤마/줄바꿈으로 구분해 아래 URL 을 모두 추가
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/login`
  - 배포 도메인의 `/auth/callback`
  - 배포 도메인의 `/login`

> 회원가입 / 인증 메일 재전송 시 프론트엔드가 `emailRedirectTo` 로
> `${origin}/auth/callback` 을 넘기므로, 위 목록에 반드시 포함되어 있어야 합니다.

### 5. (선택) 이메일 템플릿 커스터마이즈

`Authentication → Email Templates → Confirm signup` 의 본문과 제목을 한국어로
바꿔 두면 사용자 경험이 좋아집니다. `{{ .ConfirmationURL }}` 변수는 그대로 두세요.

## 데이터 모델

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `user_id` | `uuid` (PK, FK → `auth.users.id`) | 사용자 식별자 |
| `completed_steps` | `text[]` | 완료한 스텝 id 목록 |
| `current_step` | `text` | 현재 진행 중인 스텝 id |
| `attempts` | `jsonb` | 스텝별 시도 횟수 (`{ "step-1": 2, ... }`) |
| `updated_at` | `timestamptz` | 마지막 업데이트 시각 |

Row Level Security가 활성화되어 있어 사용자는 본인 행만 읽고 쓸 수 있습니다.
